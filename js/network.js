/* =========================================
   D3.js FORCE-DIRECTED NETWORK GRAPH
   ========================================= */

import {
    DOMAIN_GROUPS, ENTITY_TYPES, FONSS_PARENT_NAME,
    classifyEntityType, getEntityColor
} from './data.js';

let simulation = null;
let svg, g, linkGroup, nodeGroup, labelGroup;
let zoomBehavior = null;
let width, height;
let currentNodes = [];
let currentLinks = [];
let allNetworkData = null;
let selectedNodeId = null;
let hoveredNodeId = null;
let currentLinkSel = null;
let currentNodeSel = null;
let currentLabelSel = null;
let fonssExpanded = false;
let initialLoadComplete = false;
let keyboardFocusIndex = -1;

// Filter state
let filterState = {
    domains: [],
    entityTypes: [],      // multi-select entity types
    specialFilter: null,  // backward compat
    specialFilters: []    // multi-select special filters ['strategic', 'ukraine']
};

// ---- PUBLIC API ----

export function initNetwork(networkData) {
    allNetworkData = networkData;
    filterState.domains = [...networkData.allDomains];

    setupSVG();
    buildFilters(networkData);
    rebuildGraph();
    setupNavHelp();
    setupGraphToolbar();
    setupKeyboard();
    setupSwipeDismiss();

    window.addEventListener('resize', () => {
        resizeSVG();
        if (simulation) simulation.alpha(0.3).restart();
    });
}

export function selectNodeByName(name) {
    if (!allNetworkData || !name) return;
    const node = currentNodes.find(n =>
        n.data?.label === name || n.data?.label === decodeURIComponent(name)
    );
    if (node) {
        // Wait for simulation to settle a bit first
        setTimeout(() => selectNode(node), 100);
    }
}

export function getFilterState() {
    return filterState;
}

// ---- SVG SETUP ----

function setupSVG() {
    const container = document.getElementById('graph-container');
    width = container.clientWidth;
    height = container.clientHeight;

    svg = d3.select('#network-svg')
        .attr('width', width)
        .attr('height', height);

    svg.selectAll('*').remove();

    // Defs for glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Main group (for zoom/pan)
    g = svg.append('g').attr('class', 'graph-group');

    // Sub-groups
    linkGroup = g.append('g').attr('class', 'links');
    nodeGroup = g.append('g').attr('class', 'nodes');
    labelGroup = g.append('g').attr('class', 'labels');

    // Zoom behavior
    zoomBehavior = d3.zoom()
        .scaleExtent([0.2, 5])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoomBehavior);

    // Click on background to deselect
    svg.on('click', (event) => {
        if (event.target === svg.node()) {
            deselectNode();
        }
    });
}

function resizeSVG() {
    const container = document.getElementById('graph-container');
    width = container.clientWidth;
    height = container.clientHeight;
    svg.attr('width', width).attr('height', height);
}

// ---- GRAPH BUILDING ----

function rebuildGraph() {
    const { nodes, edges, fonssId } = allNetworkData;
    const { domains, entityTypes, specialFilters } = filterState;

    // Determine visible domain node IDs
    const visibleDomainIds = new Set();
    for (const [id, node] of Object.entries(nodes)) {
        if (node.type === 'Domain' && domains.includes(node.label)) {
            visibleDomainIds.add(id);
        }
    }

    // Determine visible partners
    const visiblePartners = new Set();
    const activeEdges = [];

    for (const edge of edges) {
        if (!visibleDomainIds.has(edge.target)) continue;
        const partner = nodes[edge.source];
        if (!partner || partner.parentId !== null) continue;

        // Apply entity type filter (multi-select)
        if (entityTypes.length > 0 && !entityTypes.includes(classifyEntityType(partner.label))) continue;

        // Apply special filters (multi-select, OR logic)
        if (specialFilters && specialFilters.length > 0) {
            let passesSpecial = false;
            if (specialFilters.includes('strategic') && partner.strategic) passesSpecial = true;
            if (specialFilters.includes('ukraine') && partner.ukraine) passesSpecial = true;
            if (!passesSpecial) continue;
        }

        visiblePartners.add(edge.source);
        activeEdges.push(edge);
    }

    // If filters active, only show domains that have connections
    let finalDomainIds = visibleDomainIds;
    if (entityTypes.length > 0 || (specialFilters && specialFilters.length > 0)) {
        const connectedDomains = new Set(activeEdges.map(e => e.target));
        finalDomainIds = new Set([...visibleDomainIds].filter(d => connectedDomains.has(d)));
    }

    // Build D3 node array
    const d3Nodes = [];
    const nodeMap = new Map();

    for (const dId of finalDomainIds) {
        const node = nodes[dId];
        const d3Node = {
            id: dId,
            label: node.label,
            type: 'Domain',
            color: '#dc2626',
            radius: 18,
            data: node
        };
        d3Nodes.push(d3Node);
        nodeMap.set(dId, d3Node);
    }

    for (const pId of visiblePartners) {
        const node = nodes[pId];
        const isStrategic = node.strategic;
        const d3Node = {
            id: pId,
            label: node.label.length > 28 ? node.label.substring(0, 25) + '...' : node.label,
            fullLabel: node.label,
            type: 'Partner',
            entityType: node.entityType,
            color: node.color,
            radius: isStrategic ? 14 : 10,
            data: node
        };
        d3Nodes.push(d3Node);
        nodeMap.set(pId, d3Node);
    }

    // Build D3 link array
    const d3Links = activeEdges
        .filter(e => nodeMap.has(e.source) && nodeMap.has(e.target))
        .map(e => ({
            source: e.source,
            target: e.target
        }));

    // FONSS expansion: add member nodes and links when expanded
    if (fonssExpanded && fonssId && nodeMap.has(fonssId)) {
        for (const [id, node] of Object.entries(nodes)) {
            if (node.isFonssMember && node.parentId === fonssId) {
                const d3Node = {
                    id: id,
                    label: node.label.length > 28 ? node.label.substring(0, 25) + '...' : node.label,
                    fullLabel: node.label,
                    type: 'Partner',
                    entityType: node.entityType,
                    color: node.color,
                    radius: 7,
                    data: node
                };
                d3Nodes.push(d3Node);
                nodeMap.set(id, d3Node);
                d3Links.push({ source: id, target: fonssId });
            }
        }
    }

    currentNodes = d3Nodes;
    currentLinks = d3Links;

    // Update stats overlay with current visible counts
    updateStats(visiblePartners.size, finalDomainIds.size, d3Links.length);

    // Update filter counts
    updateFilterCounts(visiblePartners);

    // Show/hide empty message
    updateEmptyMessage(visiblePartners.size);

    renderGraph(d3Nodes, d3Links);
}

function renderGraph(nodes, links) {
    if (simulation) simulation.stop();

    const shouldAnimate = initialLoadComplete;

    linkGroup.selectAll('*').remove();
    nodeGroup.selectAll('*').remove();
    labelGroup.selectAll('*').remove();

    if (nodes.length === 0) { initialLoadComplete = true; return; }

    // Create links
    const linkSel = linkGroup.selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', 'rgba(220, 38, 38, 0.15)')
        .attr('stroke-width', 1.5);
    currentLinkSel = linkSel;

    // Create nodes
    const nodeSel = nodeGroup.selectAll('g')
        .data(nodes, d => d.id)
        .join('g')
        .attr('class', 'node-group')
        .style('cursor', 'pointer');
    currentNodeSel = nodeSel;

    // Domain nodes (diamond shape)
    nodeSel.filter(d => d.type === 'Domain')
        .append('rect')
        .attr('width', d => d.radius * 1.6)
        .attr('height', d => d.radius * 1.6)
        .attr('x', d => -d.radius * 0.8)
        .attr('y', d => -d.radius * 0.8)
        .attr('rx', 3)
        .attr('transform', 'rotate(45)')
        .attr('fill', d => d.color)
        .attr('stroke', 'rgba(255,255,255,0.3)')
        .attr('stroke-width', 1.5);

    // Partner nodes (circle)
    nodeSel.filter(d => d.type === 'Partner')
        .append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.color)
        .attr('stroke', 'rgba(255,255,255,0.2)')
        .attr('stroke-width', 1);

    // Labels
    const labelSel = labelGroup.selectAll('text')
        .data(nodes, d => d.id)
        .join('text')
        .text(d => d.type === 'Domain' ? d.label : (d.label.length > 20 ? d.label.substring(0, 18) + '...' : d.label))
        .attr('text-anchor', 'middle')
        .attr('dy', d => d.type === 'Domain' ? d.radius + 16 : d.radius + 14)
        .attr('fill', '#cbd5e1')
        .attr('font-size', d => d.type === 'Domain' ? '11px' : '9px')
        .attr('font-weight', d => d.type === 'Domain' ? '700' : '400')
        .attr('font-family', 'Nunito, Inter, sans-serif')
        .attr('pointer-events', 'none');
    currentLabelSel = labelSel;

    // Animated enter transitions (skip on initial load)
    if (shouldAnimate) {
        linkSel.style('opacity', 0).transition().duration(300).style('opacity', 1);
        nodeSel.style('opacity', 0).transition().duration(400).style('opacity', 1);
        labelSel.style('opacity', 0).transition().duration(400).delay(100).style('opacity', 1);
    }
    initialLoadComplete = true;

    // Interaction
    const tooltip = document.getElementById('tooltip');
    const isMobileDevice = () => window.innerWidth < 768 || 'ontouchstart' in window;

    nodeSel.on('mouseenter', function(event, d) {
        // Skip tooltip on mobile - only show on desktop hover
        if (isMobileDevice()) return;
        hoveredNodeId = d.id;
        highlightConnections(d, linkSel, nodeSel, labelSel);
        showTooltip(event, d, tooltip);
    })
    .on('mousemove', function(event) {
        if (isMobileDevice()) return;
        moveTooltip(event, tooltip);
    })
    .on('mouseleave', function() {
        if (isMobileDevice()) return;
        hoveredNodeId = null;
        if (selectedNodeId) {
            const selNode = currentNodes.find(n => n.id === selectedNodeId);
            if (selNode) {
                highlightConnections(selNode, linkSel, nodeSel, labelSel);
            } else {
                resetHighlight(linkSel, nodeSel, labelSel);
            }
        } else {
            resetHighlight(linkSel, nodeSel, labelSel);
        }
        hideTooltip(tooltip);
    })
    .on('click', function(event, d) {
        event.stopPropagation();
        // On mobile, hide tooltip and just show detail card
        if (isMobileDevice()) {
            hideTooltip(tooltip);
        }
        selectNode(d);
    });

    // Drag behavior
    nodeSel.call(d3.drag()
        .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        })
        .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        })
    );

    // Force simulation
    const isMobile = window.innerWidth < 768;
    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(isMobile ? 80 : 120))
        .force('charge', d3.forceManyBody().strength(isMobile ? -150 : -300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => d.radius + (d.type === 'Domain' ? 30 : 15)))
        .force('x', d3.forceX(width / 2).strength(0.05))
        .force('y', d3.forceY(height / 2).strength(0.05))
        .alpha(1)
        .alphaDecay(0.02)
        .on('tick', () => {
            linkSel
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
            labelSel.attr('x', d => d.x).attr('y', d => d.y);
        });
}

// ---- HOVER HIGHLIGHT ----

function highlightConnections(d, linkSel, nodeSel, labelSel) {
    const connectedIds = new Set([d.id]);
    currentLinks.forEach(l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sId === d.id) connectedIds.add(tId);
        if (tId === d.id) connectedIds.add(sId);
    });

    nodeSel.transition().duration(150)
        .style('opacity', n => connectedIds.has(n.id) ? 1 : 0.08);

    labelSel.transition().duration(150)
        .style('opacity', n => connectedIds.has(n.id) ? 1 : 0.05);

    linkSel.transition().duration(150)
        .attr('stroke', l => {
            const sId = typeof l.source === 'object' ? l.source.id : l.source;
            const tId = typeof l.target === 'object' ? l.target.id : l.target;
            return (sId === d.id || tId === d.id) ? 'rgba(220, 38, 38, 0.6)' : 'rgba(220, 38, 38, 0.03)';
        })
        .attr('stroke-width', l => {
            const sId = typeof l.source === 'object' ? l.source.id : l.source;
            const tId = typeof l.target === 'object' ? l.target.id : l.target;
            return (sId === d.id || tId === d.id) ? 2.5 : 0.5;
        });

    nodeSel.filter(n => n.id === d.id)
        .select('circle, rect')
        .transition().duration(150)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2.5)
        .style('filter', 'url(#glow)');
}

function resetHighlight(linkSel, nodeSel, labelSel) {
    nodeSel.transition().duration(200)
        .style('opacity', 1);

    labelSel.transition().duration(200)
        .style('opacity', 1);

    linkSel.transition().duration(200)
        .attr('stroke', 'rgba(220, 38, 38, 0.15)')
        .attr('stroke-width', 1.5);

    nodeSel.selectAll('circle')
        .transition().duration(200)
        .attr('stroke', 'rgba(255,255,255,0.2)')
        .attr('stroke-width', 1)
        .style('filter', null);

    nodeSel.selectAll('rect')
        .transition().duration(200)
        .attr('stroke', 'rgba(255,255,255,0.3)')
        .attr('stroke-width', 1.5)
        .style('filter', null);
}

// ---- ZOOM FOCUS ----

function zoomToFocus(d) {
    if (!zoomBehavior || !svg) return;

    // Find connected nodes
    const connectedIds = new Set([d.id]);
    currentLinks.forEach(l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sId === d.id) connectedIds.add(tId);
        if (tId === d.id) connectedIds.add(sId);
    });

    const connectedNodes = currentNodes.filter(n => connectedIds.has(n.id) && n.x !== undefined);
    if (connectedNodes.length === 0) return;

    // Calculate bounding box of selected node + neighbors
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    connectedNodes.forEach(n => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
    });

    // Add padding around the cluster
    const padding = 100;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    const dx = maxX - minX;
    const dy = maxY - minY;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    // Scale to fit, capped so we don't zoom in too far
    const scale = Math.min(width / dx, height / dy, 2.5);
    const tx = width / 2 - cx * scale;
    const ty = height / 2 - cy * scale;

    svg.transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}

function zoomReset() {
    if (!zoomBehavior || !svg || currentNodes.length === 0) return;

    // Fit all visible nodes
    const positioned = currentNodes.filter(n => n.x !== undefined);
    if (positioned.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positioned.forEach(n => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
    });

    const padding = 60;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    const dx = maxX - minX;
    const dy = maxY - minY;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const scale = Math.min(width / dx, height / dy, 1);
    const tx = width / 2 - cx * scale;
    const ty = height / 2 - cy * scale;

    svg.transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}

// ---- TOOLTIP ----

function showTooltip(event, d, el) {
    const { nodes, edges } = allNetworkData;
    let html = `<div class="tooltip-name">${d.data.label}</div>`;

    if (d.type === 'Partner') {
        html += `<div class="tooltip-type">${d.entityType}</div>`;
        const domainCount = edges.filter(e => e.source === d.id).length;
        html += `<div class="tooltip-connections">${domainCount} domenii conectate</div>`;
        if (d.data.strategic) html += `<div style="color:#f59e0b;font-size:0.72rem">Partener strategic</div>`;
        if (d.data.ukraine) html += `<div style="color:#3b82f6;font-size:0.72rem">Sprijin Ucraina</div>`;
    } else {
        const partnerCount = edges.filter(e => e.target === d.id).length;
        html += `<div class="tooltip-type">Domeniu de activitate</div>`;
        html += `<div class="tooltip-connections">${partnerCount} parteneri</div>`;
    }

    el.innerHTML = html;
    el.classList.remove('hidden');
    moveTooltip(event, el);
}

function moveTooltip(event, el) {
    const rect = document.getElementById('graph-container').getBoundingClientRect();
    let x = event.clientX - rect.left + 14;
    let y = event.clientY - rect.top - 10;

    if (x + 260 > rect.width) x = event.clientX - rect.left - 260;
    if (y + 100 > rect.height) y = event.clientY - rect.top - 100;

    el.style.left = x + 'px';
    el.style.top = y + 'px';
}

function hideTooltip(el) {
    el.classList.add('hidden');
}

// ---- NODE SELECTION ----

function selectNode(d) {
    // Collapse FONSS if selecting an unrelated node
    if (fonssExpanded && !d.data?.isFonssMember && d.data?.label !== FONSS_PARENT_NAME) {
        collapseFonss();
        d = currentNodes.find(n => n.id === d.id) || d;
    }

    selectedNodeId = d.id;
    keyboardFocusIndex = currentNodes.indexOf(d);
    showDetailCard(d);

    // Update URL hash
    if (d.data?.label) {
        history.replaceState(null, '', '#network/' + encodeURIComponent(d.data.label));
    }

    // Highlight selected node and its connections
    if (currentLinkSel && currentNodeSel && currentLabelSel) {
        highlightConnections(d, currentLinkSel, currentNodeSel, currentLabelSel);
    }

    // Expand FONSS members when FONSS is selected
    if (!fonssExpanded && d.data?.label === FONSS_PARENT_NAME) {
        expandFonss(d.id);
        const fonssNode = currentNodes.find(n => n.id === d.id);
        if (fonssNode && currentLinkSel && currentNodeSel && currentLabelSel) {
            highlightConnections(fonssNode, currentLinkSel, currentNodeSel, currentLabelSel);
        }
        // Zoom to FONSS cluster after expansion settles
        setTimeout(() => {
            const fn = currentNodes.find(n => n.id === d.id);
            if (fn) zoomToFocus(fn);
        }, 300);
    } else {
        // Zoom to focus on selected node and its neighbors
        zoomToFocus(d);
    }
}

function deselectNode() {
    selectedNodeId = null;
    keyboardFocusIndex = -1;
    document.getElementById('partner-detail').classList.add('hidden');
    document.getElementById('partner-detail').style.transform = '';

    // Update URL hash
    history.replaceState(null, '', '#network');

    // Reset highlight
    if (currentLinkSel && currentNodeSel && currentLabelSel) {
        resetHighlight(currentLinkSel, currentNodeSel, currentLabelSel);
    }

    // Collapse FONSS members
    if (fonssExpanded) {
        collapseFonss();
    }

    // Zoom back to show full graph
    zoomReset();
}

// ---- FONSS EXPANSION ----

function savePositions() {
    const positions = {};
    currentNodes.forEach(n => {
        if (n.x !== undefined) positions[n.id] = { x: n.x, y: n.y };
    });
    return positions;
}

function restorePositions(positions, fonssAnchorId) {
    currentNodes.forEach(n => {
        if (positions[n.id]) {
            n.x = positions[n.id].x;
            n.y = positions[n.id].y;
        } else if (fonssAnchorId && n.data?.isFonssMember && positions[fonssAnchorId]) {
            n.x = positions[fonssAnchorId].x + (Math.random() - 0.5) * 60;
            n.y = positions[fonssAnchorId].y + (Math.random() - 0.5) * 60;
        }
    });
}

function expandFonss(fonssNodeId) {
    fonssExpanded = true;
    const positions = savePositions();
    rebuildGraph();
    restorePositions(positions, fonssNodeId);
    if (simulation) simulation.alpha(0.5).restart();
}

function collapseFonss() {
    fonssExpanded = false;
    const positions = savePositions();
    rebuildGraph();
    restorePositions(positions);
    if (simulation) simulation.alpha(0.3).restart();
}

function showDetailCard(d) {
    const detail = document.getElementById('partner-detail');
    const content = document.getElementById('detail-content');
    const { nodes, edges } = allNetworkData;

    let html = '';

    if (d.type === 'Partner') {
        html += `<div class="detail-name">${d.data.label}</div>`;
        html += `<div class="detail-type">${d.entityType}</div>`;

        let badges = '';
        if (d.data.strategic) badges += '<span class="badge badge-strategic">Partener strategic</span>';
        if (d.data.ukraine) badges += '<span class="badge badge-ukraine">Sprijin în criza ucraineană</span>';
        if (d.data.isFonssMember) badges += '<span class="badge badge-fonss">FONSS</span>';
        if (badges) html += `<div class="detail-badges">${badges}</div>`;

        html += `<div class="detail-desc">${d.data.description}</div>`;

        html += `<div class="detail-domains-label">Domenii de activitate</div>`;
        html += `<div class="detail-domains">`;
        if (d.data.isFonssMember) {
            html += `<span class="tag-domain">Servicii sociale</span>`;
        } else {
            const myDomains = edges
                .filter(e => e.source === d.id)
                .map(e => nodes[e.target]?.label)
                .filter(Boolean);
            [...new Set(myDomains)].sort().forEach(dom => {
                html += `<span class="tag-domain">${dom}</span>`;
            });
        }
        html += `</div>`;

    } else {
        const linkedPartners = edges
            .filter(e => e.target === d.id)
            .map(e => nodes[e.source]?.label)
            .filter(Boolean);

        html += `<div class="detail-name">${d.data.label}</div>`;
        html += `<div class="detail-type">Domeniu de activitate</div>`;
        html += `<div class="domain-partner-count">Acest domeniu conecteaza <strong>${linkedPartners.length}</strong> parteneri.</div>`;

        if (linkedPartners.length > 0) {
            html += `<div class="detail-domains-label" style="margin-top:12px">Parteneri conectati</div>`;
            html += `<div class="detail-domains">`;
            linkedPartners.sort().forEach(name => {
                html += `<span class="tag-domain">${name}</span>`;
            });
            html += `</div>`;
        }
    }

    content.innerHTML = html;
    detail.classList.remove('hidden');
}

// Listen for deselect events
document.addEventListener('deselect-node', deselectNode);

// Close detail card button
document.getElementById('close-detail')?.addEventListener('click', deselectNode);

// ---- FILTERS ----

function buildFilters(networkData) {
    buildEntityFilters(networkData);
    buildDomainFilters(networkData);
    buildSpecialFilters(networkData);
    buildSearch(networkData);
    setupMobileFilters(networkData);
    setupDropdowns();
}

function buildEntityFilters(networkData) {
    const { nodes } = networkData;
    const container = document.getElementById('entity-filters');
    if (!container) return;

    // Count entities
    const counts = {};
    for (const [, node] of Object.entries(nodes)) {
        if (node.type === 'Partner' && node.parentId === null) {
            const t = classifyEntityType(node.label);
            counts[t] = (counts[t] || 0) + 1;
        }
    }

    let html = '';
    for (const [type, config] of Object.entries(ENTITY_TYPES)) {
        const count = counts[type] || 0;
        html += `<label class="filter-checkbox">
            <input type="checkbox" value="${type}">
            <span class="filter-dot" style="background:${config.color}"></span>
            <span class="filter-label">${type}</span>
            <span class="filter-count">${count}</span>
        </label>`;
    }
    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            filterState.entityTypes = [...container.querySelectorAll('input[type="checkbox"]:checked')]
                .map(c => c.value);
            updateEntityCountLabel();
            deselectNode();
            rebuildGraph();
            syncMobileFilters();
        });
    });
}

function updateEntityCountLabel() {
    const label = document.getElementById('entity-count-label');
    if (!label) return;
    const count = filterState.entityTypes.length;
    label.textContent = count > 0 ? count : '';
}

function buildDomainFilters(networkData) {
    const container = document.getElementById('domain-filters');
    if (!container) return;
    const allDomains = networkData.allDomains;

    let html = '';
    for (const [groupName, groupDomains] of Object.entries(DOMAIN_GROUPS)) {
        const available = groupDomains.filter(d => allDomains.includes(d));
        if (available.length === 0) continue;

        html += `<div class="domain-group expanded" data-group="${groupName}">`;
        html += `<div class="domain-group-header">
            <span class="domain-group-arrow">&#9654;</span>
            <span>${groupName}</span>
            <span class="domain-group-count">${available.length}</span>
        </div>`;
        html += `<div class="domain-group-items">`;
        for (const domain of available) {
            html += `<label class="domain-checkbox">
                <input type="checkbox" value="${domain}" checked>
                <span>${domain}</span>
            </label>`;
        }
        html += `</div></div>`;
    }
    container.innerHTML = html;

    // Toggle group expansion
    container.querySelectorAll('.domain-group-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('expanded');
        });
    });

    // Checkbox changes
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            updateDomainFilter();
            rebuildGraph();
            updateDomainCountLabel();
        });
    });

    // Select all / none
    document.getElementById('select-all-domains')?.addEventListener('click', () => {
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        updateDomainFilter();
        rebuildGraph();
        updateDomainCountLabel();
    });

    document.getElementById('select-no-domains')?.addEventListener('click', () => {
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        updateDomainFilter();
        rebuildGraph();
        updateDomainCountLabel();
    });

    updateDomainCountLabel();
}

function updateDomainFilter() {
    const container = document.getElementById('domain-filters');
    if (!container) return;
    const checked = [...container.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);
    filterState.domains = checked;
}

function updateDomainCountLabel() {
    const label = document.getElementById('domain-count-label');
    if (!label) return;
    const container = document.getElementById('domain-filters');
    if (!container) return;
    const total = container.querySelectorAll('input[type="checkbox"]').length;
    const checked = container.querySelectorAll('input[type="checkbox"]:checked').length;
    if (checked === total) {
        label.textContent = '';
    } else {
        label.textContent = `${checked}/${total}`;
    }
}

function setupDropdowns() {
    // Setup all filter dropdowns
    const dropdowns = [
        { btn: 'entity-dropdown-btn', panel: 'entity-panel' },
        { btn: 'domain-dropdown-btn', panel: 'domain-panel' },
        { btn: 'special-dropdown-btn', panel: 'special-panel' }
    ];

    // Close all panels function
    const closeAllPanels = (exceptPanelId = null) => {
        dropdowns.forEach(({ panel: panelId }) => {
            if (panelId !== exceptPanelId) {
                document.getElementById(panelId)?.classList.add('hidden');
            }
        });
    };

    dropdowns.forEach(({ btn: btnId, panel: panelId }) => {
        const btn = document.getElementById(btnId);
        const panel = document.getElementById(panelId);
        if (!btn || !panel) return;

        // Button click - toggle panel
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const isHidden = panel.classList.contains('hidden');
            closeAllPanels(); // Close all first

            if (isHidden) {
                panel.classList.remove('hidden');
            }
        });

        // Prevent clicks inside the panel from closing it
        panel.addEventListener('click', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        // Also handle mousedown to prevent any early closing
        panel.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
    });

    // Close all on outside click (use setTimeout to ensure it runs after other handlers)
    document.addEventListener('click', (e) => {
        // Don't close if clicking on a dropdown button or inside a panel
        const isDropdownBtn = e.target.closest('.fb-dropdown-btn');
        const isDropdownPanel = e.target.closest('.fb-dropdown-panel');

        if (!isDropdownBtn && !isDropdownPanel) {
            closeAllPanels();
        }
    });
}

function buildSpecialFilters(networkData) {
    const { nodes } = networkData;
    const container = document.getElementById('special-filters');
    if (!container) return;

    let strategicCount = 0, ukraineCount = 0;
    for (const [, node] of Object.entries(nodes)) {
        if (node.type === 'Partner' && node.parentId === null) {
            if (node.strategic) strategicCount++;
            if (node.ukraine) ukraineCount++;
        }
    }

    container.innerHTML = `
        <label class="filter-checkbox" title="Parteneri strategici - parteneri cu care DSU are protocoale extinse de colaborare">
            <input type="checkbox" value="strategic">
            <span class="filter-icon">&#9733;</span>
            <span class="filter-label">Parteneri strategici</span>
            <span class="filter-count">${strategicCount}</span>
        </label>
        <label class="filter-checkbox" title="Parteneri implicati in gestionarea crizei din Ucraina">
            <input type="checkbox" value="ukraine">
            <span class="filter-icon filter-icon-ua">UA</span>
            <span class="filter-label">Sprijin Ucraina</span>
            <span class="filter-count">${ukraineCount}</span>
        </label>
    `;

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const checked = [...container.querySelectorAll('input[type="checkbox"]:checked')].map(c => c.value);
            // For special filters, we'll use an array now
            filterState.specialFilters = checked;
            filterState.specialFilter = checked.length > 0 ? checked[0] : null; // backward compat
            updateSpecialCountLabel();
            deselectNode();
            rebuildGraph();
            syncMobileFilters();
        });
    });
}

function updateSpecialCountLabel() {
    const label = document.getElementById('special-count-label');
    if (!label) return;
    const container = document.getElementById('special-filters');
    if (!container) return;
    const count = container.querySelectorAll('input[type="checkbox"]:checked').length;
    label.textContent = count > 0 ? count : '';
}

function buildSearch(networkData) {
    const { nodes } = networkData;
    const input = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    if (!input || !resultsEl) return;

    const partners = Object.entries(nodes)
        .filter(([, n]) => n.type === 'Partner' && n.parentId === null)
        .map(([id, n]) => ({ id, label: n.label }))
        .sort((a, b) => a.label.localeCompare(b.label));

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        if (query.length < 2) {
            resultsEl.classList.add('hidden');
            return;
        }

        const matches = partners.filter(p => p.label.toLowerCase().includes(query)).slice(0, 10);
        if (matches.length === 0) {
            resultsEl.innerHTML = '<div class="search-result-item" style="color:var(--text-dim)">Niciun rezultat</div>';
            resultsEl.classList.remove('hidden');
            return;
        }

        resultsEl.innerHTML = matches.map(m =>
            `<div class="search-result-item" data-id="${m.id}">${m.label}</div>`
        ).join('');
        resultsEl.classList.remove('hidden');

        resultsEl.querySelectorAll('.search-result-item[data-id]').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const node = currentNodes.find(n => n.id === id);
                if (node) {
                    selectNode(node);
                }
                input.value = '';
                resultsEl.classList.add('hidden');
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!resultsEl.contains(e.target) && e.target !== input) {
            resultsEl.classList.add('hidden');
        }
    });
}

// ---- MOBILE FILTERS ----

function setupMobileFilters(networkData) {
    const toggle = document.getElementById('mobile-filter-toggle');
    const panel = document.getElementById('mobile-filter-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        toggle.classList.toggle('active');
    });

    // Build mobile entity filters
    const mobileEntity = document.getElementById('mobile-entity-filters');
    if (mobileEntity) {
        let html = '<div class="mfp-title">Tip organizatie</div><div class="mfp-pills">';
        for (const [type, config] of Object.entries(ENTITY_TYPES)) {
            html += `<button class="entity-pill" data-type="${type}">
                <span class="entity-dot" style="background:${config.color}"></span>
                <span class="entity-pill-label">${type}</span>
            </button>`;
        }
        html += '</div>';
        mobileEntity.innerHTML = html;

        mobileEntity.querySelectorAll('.entity-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                filterState.entityTypes = [...mobileEntity.querySelectorAll('.entity-pill.active')]
                    .map(b => b.dataset.type);
                syncDesktopEntityFilters();
                deselectNode();
                rebuildGraph();
            });
        });
    }

    // Build mobile domain filters
    const mobileDomain = document.getElementById('mobile-domain-filters');
    if (mobileDomain) {
        let html = '<div class="mfp-title">Domenii</div>';
        html += '<div class="mfp-domain-actions">';
        html += '<button class="mfp-btn" id="m-select-all">Toate</button>';
        html += '<button class="mfp-btn" id="m-select-none">Niciuna</button>';
        html += '</div>';
        html += '<div class="mfp-domain-list">';
        for (const domain of networkData.allDomains) {
            html += `<label class="domain-checkbox">
                <input type="checkbox" value="${domain}" checked>
                <span>${domain}</span>
            </label>`;
        }
        html += '</div>';
        mobileDomain.innerHTML = html;

        mobileDomain.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => {
                syncDomainFiltersFromMobile();
                rebuildGraph();
            });
        });

        document.getElementById('m-select-all')?.addEventListener('click', () => {
            mobileDomain.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
            syncDomainFiltersFromMobile();
            rebuildGraph();
        });

        document.getElementById('m-select-none')?.addEventListener('click', () => {
            mobileDomain.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            syncDomainFiltersFromMobile();
            rebuildGraph();
        });
    }

    // Build mobile special filters
    const mobileSpecial = document.getElementById('mobile-special-filters');
    if (mobileSpecial) {
        mobileSpecial.innerHTML = `
            <div class="mfp-title">Filtre speciale</div>
            <div class="mfp-pills">
                <button class="special-pill" data-filter="strategic">
                    <span class="special-pill-icon">&#9733;</span> Strategici
                </button>
                <button class="special-pill" data-filter="ukraine">
                    <span class="special-pill-icon-ua">UA</span> Ucraina
                </button>
            </div>
        `;

        mobileSpecial.querySelectorAll('.special-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                const isActive = btn.classList.contains('active');
                mobileSpecial.querySelectorAll('.special-pill').forEach(b => b.classList.remove('active'));

                if (isActive) {
                    filterState.specialFilter = null;
                } else {
                    btn.classList.add('active');
                    filterState.specialFilter = filter;
                }

                syncDesktopSpecialFilters();
                deselectNode();
                rebuildGraph();
            });
        });
    }
}

function syncMobileFilters() {
    // Sync entity type state to mobile
    const mobileEntity = document.getElementById('mobile-entity-filters');
    if (mobileEntity) {
        mobileEntity.querySelectorAll('.entity-pill').forEach(btn => {
            btn.classList.toggle('active', filterState.entityTypes.includes(btn.dataset.type));
        });
    }

    // Sync special filter state to mobile
    const mobileSpecial = document.getElementById('mobile-special-filters');
    if (mobileSpecial) {
        mobileSpecial.querySelectorAll('.special-pill').forEach(btn => {
            btn.classList.toggle('active', filterState.specialFilter === btn.dataset.filter);
        });
    }
}

function syncDesktopEntityFilters() {
    const desktop = document.getElementById('entity-filters');
    if (desktop) {
        desktop.querySelectorAll('.entity-pill').forEach(btn => {
            btn.classList.toggle('active', filterState.entityTypes.includes(btn.dataset.type));
        });
    }
}

function syncDesktopSpecialFilters() {
    const desktop = document.getElementById('special-filters');
    if (desktop) {
        desktop.querySelectorAll('.special-pill').forEach(btn => {
            btn.classList.toggle('active', filterState.specialFilter === btn.dataset.filter);
        });
    }
}

function syncDomainFiltersFromMobile() {
    const mobileDomain = document.getElementById('mobile-domain-filters');
    if (!mobileDomain) return;
    const checked = [...mobileDomain.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);
    filterState.domains = checked;

    // Sync to desktop
    const desktopDomain = document.getElementById('domain-filters');
    if (desktopDomain) {
        desktopDomain.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = checked.includes(cb.value);
        });
    }
    updateDomainCountLabel();
}

// ---- STATS OVERLAY ----

function updateStats(partnerCount, domainCount, connectionCount) {
    document.getElementById('stat-partners').textContent = partnerCount;
    document.getElementById('stat-domains').textContent = domainCount;
    document.getElementById('stat-connections').textContent = connectionCount;
}

// ---- FILTER COUNTS (Task 3) ----

function updateFilterCounts(visiblePartnerIds) {
    if (!allNetworkData) return;
    const { nodes } = allNetworkData;

    // Count visible partners by entity type
    const typeCounts = {};
    for (const pId of visiblePartnerIds) {
        const node = nodes[pId];
        if (!node) continue;
        const t = classifyEntityType(node.label);
        typeCounts[t] = (typeCounts[t] || 0) + 1;
    }

    // Update desktop entity pills
    document.querySelectorAll('#entity-filters .entity-pill').forEach(btn => {
        const type = btn.dataset.type;
        const countEl = btn.querySelector('.entity-pill-count');
        if (countEl) {
            countEl.textContent = typeCounts[type] || 0;
        }
    });

    // Count visible strategic and ukraine
    let strategicVisible = 0, ukraineVisible = 0;
    for (const pId of visiblePartnerIds) {
        const node = nodes[pId];
        if (!node) continue;
        if (node.strategic) strategicVisible++;
        if (node.ukraine) ukraineVisible++;
    }

    document.querySelectorAll('#special-filters .special-pill').forEach(btn => {
        const countEl = btn.querySelector('.special-pill-count');
        if (countEl) {
            if (btn.dataset.filter === 'strategic') countEl.textContent = strategicVisible;
            if (btn.dataset.filter === 'ukraine') countEl.textContent = ukraineVisible;
        }
    });
}

// ---- EMPTY MESSAGE (Task 4) ----

function updateEmptyMessage(partnerCount) {
    let msgEl = document.getElementById('empty-graph-msg');

    if (partnerCount === 0) {
        if (!msgEl) {
            msgEl = document.createElement('div');
            msgEl.id = 'empty-graph-msg';
            msgEl.className = 'empty-graph-msg';
            msgEl.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    <path d="M8 11h6"/>
                </svg>
                <div class="empty-graph-title">Nu exista niciun partener</div>
                <div class="empty-graph-text">Verifica filtrele selectate - niciun partener nu corespunde criteriilor actuale.</div>
            `;
            document.getElementById('graph-container').appendChild(msgEl);
        }
        msgEl.style.display = 'flex';
    } else {
        if (msgEl) msgEl.style.display = 'none';
    }
}

// ---- NAVIGATION HELP CARD (Task 6) ----

function setupNavHelp() {
    const page = document.getElementById('page-network');
    if (!page) return;

    // Create help card (shown on first visit)
    const helpCard = document.createElement('div');
    helpCard.id = 'nav-help-card';
    helpCard.className = 'nav-help-card';
    helpCard.innerHTML = `
        <button id="nav-help-close" class="nav-help-close" title="Inchide">&times;</button>
        <div class="nav-help-title">Bun venit!</div>
        <div class="nav-help-intro">
            Aceasta aplicatie vizualizeaza <strong>ecosistemul de parteneriate</strong> ale Departamentului pentru
            Situatii de Urgenta (DSU). Exploreaza reteaua pentru a descoperi organizatiile partenere,
            domeniile de activitate si conexiunile dintre ele.
        </div>
        <div class="nav-help-subtitle">Cum navigati</div>
        <div class="nav-help-content">
            <div class="nav-help-item"><strong>Hover</strong> pe un nod &ndash; vezi conexiunile</div>
            <div class="nav-help-item"><strong>Click</strong> pe un nod &ndash; vezi detaliile partenerului</div>
            <div class="nav-help-item"><strong>Scroll</strong> &ndash; zoom in/out pe retea</div>
            <div class="nav-help-item"><strong>Drag</strong> &ndash; muta vizualizarea sau noduri individuale</div>
            <div class="nav-help-item"><strong>Filtre</strong> &ndash; foloseste bara de sus pentru a filtra parteneri</div>
        </div>
    `;
    page.appendChild(helpCard);

    // Create ? button (shown after dismissal) - in filter bar, left of search
    const helpBtn = document.createElement('button');
    helpBtn.id = 'nav-help-btn';
    helpBtn.className = 'nav-help-btn';
    helpBtn.innerHTML = '?';
    helpBtn.title = 'Cum navigati reteaua';
    helpBtn.style.display = 'none';
    const helpBtnContainer = document.getElementById('nav-help-btn-container');
    if (helpBtnContainer) {
        helpBtnContainer.appendChild(helpBtn);
    } else {
        page.appendChild(helpBtn);
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('dsu-nav-help-dismissed');
    if (dismissed) {
        helpCard.style.display = 'none';
        helpBtn.style.display = '';
    }

    // Close handler
    document.getElementById('nav-help-close').addEventListener('click', () => {
        helpCard.style.display = 'none';
        helpBtn.style.display = '';
        localStorage.setItem('dsu-nav-help-dismissed', '1');
    });

    // Reopen handler
    helpBtn.addEventListener('click', () => {
        helpCard.style.display = '';
        helpBtn.style.display = 'none';
    });
}

// ---- GRAPH TOOLBAR (Reset View + Export) ----

function setupGraphToolbar() {
    const container = document.getElementById('graph-container');
    if (!container) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'graph-toolbar';
    toolbar.innerHTML = `
        <button class="graph-toolbar-btn" id="reset-zoom-btn" title="Resetare zoom (Home)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
        <button class="graph-toolbar-btn" id="export-graph-btn" title="Descarcă graful (SVG)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
    `;
    container.appendChild(toolbar);

    document.getElementById('reset-zoom-btn').addEventListener('click', () => {
        deselectNode();
        zoomReset();
    });

    document.getElementById('export-graph-btn').addEventListener('click', exportGraph);
}

function exportGraph() {
    const svgEl = svg.node();
    const clone = svgEl.cloneNode(true);

    // Add background rect
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', width);
    bg.setAttribute('height', height);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    bg.setAttribute('fill', isDark ? '#0a0e1a' : '#f8fafc');
    clone.insertBefore(bg, clone.firstChild);

    // Inline font family on text elements
    clone.querySelectorAll('text').forEach(el => {
        if (!el.style.fontFamily) el.style.fontFamily = 'sans-serif';
    });

    // Serialize and download
    const serializer = new XMLSerializer();
    let svgString = '<?xml version="1.0" encoding="UTF-8"?>' + serializer.serializeToString(clone);

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'retea-parteneri-dsu.svg';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- KEYBOARD NAVIGATION ----

function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        // Only handle when on network page
        if (!document.getElementById('page-network')?.classList.contains('active')) return;

        // Don't capture when typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'Escape') {
            if (selectedNodeId) {
                deselectNode();
            }
            // Close search results and filter panels
            document.getElementById('search-results')?.classList.add('hidden');
            document.querySelectorAll('.fb-dropdown-panel').forEach(p => p.classList.add('hidden'));
        }

        if (e.key === 'Tab' && currentNodes.length > 0) {
            e.preventDefault();
            const partners = currentNodes.filter(n => n.type === 'Partner');
            if (partners.length === 0) return;

            if (e.shiftKey) {
                keyboardFocusIndex = keyboardFocusIndex <= 0 ? partners.length - 1 : keyboardFocusIndex - 1;
            } else {
                keyboardFocusIndex = (keyboardFocusIndex + 1) % partners.length;
            }

            selectNode(partners[keyboardFocusIndex]);
        }
    });
}

// ---- MOBILE SWIPE TO DISMISS ----

function setupSwipeDismiss() {
    const detail = document.getElementById('partner-detail');
    if (!detail) return;

    // Add swipe indicator for mobile
    const indicator = document.createElement('div');
    indicator.className = 'swipe-indicator';
    detail.insertBefore(indicator, detail.firstChild);

    let startY = 0;
    let currentTouchY = 0;
    let isDragging = false;

    detail.addEventListener('touchstart', (e) => {
        if (detail.scrollTop > 0) return;
        startY = e.touches[0].clientY;
        currentTouchY = startY;
        isDragging = true;
        detail.style.transition = 'none';
    }, { passive: true });

    detail.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentTouchY = e.touches[0].clientY;
        const dy = currentTouchY - startY;
        if (dy > 0) {
            detail.style.transform = `translateY(${dy}px)`;
        }
    }, { passive: true });

    detail.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        const dy = currentTouchY - startY;
        detail.style.transition = '';

        if (dy > 80) {
            detail.style.transform = `translateY(100%)`;
            setTimeout(() => deselectNode(), 250);
        } else {
            detail.style.transform = '';
        }
    });
}

// ---- LEGEND TOGGLE ----
const legendToggle = document.getElementById('legend-toggle');
const legendPanel = document.getElementById('legend-panel');
if (legendToggle && legendPanel) {
    legendToggle.addEventListener('click', () => {
        legendPanel.classList.toggle('hidden');
    });
}
