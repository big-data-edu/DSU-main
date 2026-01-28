/* =========================================
   D3.js FORCE-DIRECTED NETWORK GRAPH
   Inspired by costico.eu - hover highlights,
   click shows detail card
   ========================================= */

import {
    DOMAIN_GROUPS, ENTITY_TYPES, FONSS_PARENT_NAME,
    classifyEntityType, getEntityColor
} from './data.js';

let simulation = null;
let svg, g, linkGroup, nodeGroup, labelGroup;
let width, height;
let currentNodes = [];
let currentLinks = [];
let allNetworkData = null;
let selectedNodeId = null;
let hoveredNodeId = null;

// Filter state
let filterState = {
    domains: [],        // active domain labels
    entityType: null,   // active entity type filter
    specialFilter: null // 'strategic' | 'ukraine' | null
};

// ---- PUBLIC API ----

export function initNetwork(networkData) {
    allNetworkData = networkData;
    filterState.domains = [...networkData.allDomains];

    setupSVG();
    buildFilters(networkData);
    updateStats(networkData);
    rebuildGraph();

    window.addEventListener('resize', () => {
        resizeSVG();
        if (simulation) simulation.alpha(0.3).restart();
    });
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

    // Clear existing
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

    // Sub-groups (order matters: links under nodes under labels)
    linkGroup = g.append('g').attr('class', 'links');
    nodeGroup = g.append('g').attr('class', 'nodes');
    labelGroup = g.append('g').attr('class', 'labels');

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.2, 5])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

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
    const { domains, entityType, specialFilter } = filterState;

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
        if (!partner || partner.parentId !== null) continue; // skip FONSS children

        // Apply entity type filter
        if (entityType && classifyEntityType(partner.label) !== entityType) continue;

        // Apply special filter
        if (specialFilter === 'strategic' && !partner.strategic) continue;
        if (specialFilter === 'ukraine' && !partner.ukraine) continue;

        visiblePartners.add(edge.source);
        activeEdges.push(edge);
    }

    // If special/entity filter active, only show domains that have connections
    let finalDomainIds = visibleDomainIds;
    if (entityType || specialFilter) {
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

    currentNodes = d3Nodes;
    currentLinks = d3Links;

    renderGraph(d3Nodes, d3Links);
}

function renderGraph(nodes, links) {
    // Stop previous simulation
    if (simulation) simulation.stop();

    // Clear groups
    linkGroup.selectAll('*').remove();
    nodeGroup.selectAll('*').remove();
    labelGroup.selectAll('*').remove();

    if (nodes.length === 0) return;

    // Create links
    const linkSel = linkGroup.selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', 'rgba(220, 38, 38, 0.15)')
        .attr('stroke-width', 1.5);

    // Create nodes
    const nodeSel = nodeGroup.selectAll('g')
        .data(nodes, d => d.id)
        .join('g')
        .attr('class', 'node-group')
        .style('cursor', 'pointer');

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

    // Interaction
    const tooltip = document.getElementById('tooltip');

    nodeSel.on('mouseenter', function(event, d) {
        hoveredNodeId = d.id;
        highlightConnections(d, linkSel, nodeSel, labelSel);
        showTooltip(event, d, tooltip);
    })
    .on('mousemove', function(event) {
        moveTooltip(event, tooltip);
    })
    .on('mouseleave', function() {
        hoveredNodeId = null;
        resetHighlight(linkSel, nodeSel, labelSel);
        hideTooltip(tooltip);
    })
    .on('click', function(event, d) {
        event.stopPropagation();
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

// ---- HOVER HIGHLIGHT (costico.eu style) ----

function highlightConnections(d, linkSel, nodeSel, labelSel) {
    // Find connected node IDs
    const connectedIds = new Set([d.id]);
    currentLinks.forEach(l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sId === d.id) connectedIds.add(tId);
        if (tId === d.id) connectedIds.add(sId);
    });

    // Fade unconnected
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

    // Highlight the hovered node
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

// ---- TOOLTIP ----

function showTooltip(event, d, el) {
    const { nodes, edges } = allNetworkData;
    let html = `<div class="tooltip-name">${d.data.label}</div>`;

    if (d.type === 'Partner') {
        html += `<div class="tooltip-type">${d.entityType}</div>`;
        // Count connections
        const domainCount = edges.filter(e => e.source === d.id).length;
        html += `<div class="tooltip-connections">${domainCount} domenii conectate</div>`;
        if (d.data.strategic) html += `<div style="color:#f59e0b;font-size:0.72rem">⭐ Partener strategic</div>`;
        if (d.data.ukraine) html += `<div style="color:#3b82f6;font-size:0.72rem">🇺🇦 Sprijin Ucraina</div>`;
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

    // Keep within bounds
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
    selectedNodeId = d.id;
    showDetailCard(d);
    updateSidebarSelection(d);
}

function deselectNode() {
    selectedNodeId = null;
    document.getElementById('partner-detail').classList.add('hidden');
    resetSidebarInfo();
}

function showDetailCard(d) {
    const detail = document.getElementById('partner-detail');
    const content = document.getElementById('detail-content');
    const { nodes, edges } = allNetworkData;

    let html = '';

    if (d.type === 'Partner') {
        html += `<div class="detail-name">${d.data.label}</div>`;
        html += `<div class="detail-type">${d.entityType}</div>`;

        // Badges
        let badges = '';
        if (d.data.strategic) badges += '<span class="badge badge-strategic">Strategic</span>';
        if (d.data.ukraine) badges += '<span class="badge badge-ukraine">Ucraina</span>';
        if (d.data.isFonssMember) badges += '<span class="badge badge-fonss">FONSS</span>';
        if (badges) html += `<div class="detail-badges">${badges}</div>`;

        html += `<div class="detail-desc">${d.data.description}</div>`;

        // Domains
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
        // Domain node
        const linkedPartners = edges
            .filter(e => e.target === d.id)
            .map(e => nodes[e.source]?.label)
            .filter(Boolean);

        html += `<div class="detail-name">${d.data.label}</div>`;
        html += `<div class="detail-type">Domeniu de activitate</div>`;
        html += `<div class="domain-partner-count">Acest domeniu conectează <strong>${linkedPartners.length}</strong> parteneri.</div>`;

        if (linkedPartners.length > 0) {
            html += `<div class="detail-domains-label" style="margin-top:12px">Parteneri conectați</div>`;
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

// Update sidebar with selected partner info
function updateSidebarSelection(d) {
    const sidebarInfo = document.getElementById('sidebar-info');
    const { nodes, edges } = allNetworkData;

    let html = '';

    if (d.type === 'Partner') {
        html += `<div class="partner-card-sidebar">`;
        html += `<div class="partner-name">${d.data.label}</div>`;
        html += `<div class="entity-type-label">${d.entityType}</div>`;

        let badges = '';
        if (d.data.strategic) badges += '<span class="badge badge-strategic">Strategic</span> ';
        if (d.data.ukraine) badges += '<span class="badge badge-ukraine">Ucraina</span> ';
        if (d.data.isFonssMember) badges += '<span class="badge badge-fonss">FONSS</span>';
        if (badges) html += `<div style="margin-bottom:8px">${badges}</div>`;

        html += `<div class="partner-desc">${d.data.description}</div>`;
        html += `<div class="domains-label">Domenii de activitate</div>`;
        html += `<div style="display:flex;flex-wrap:wrap;gap:4px">`;

        if (d.data.isFonssMember) {
            html += `<span class="tag-domain">Servicii sociale</span>`;
        } else {
            const myDomains = edges.filter(e => e.source === d.id).map(e => nodes[e.target]?.label).filter(Boolean);
            [...new Set(myDomains)].sort().forEach(dom => {
                html += `<span class="tag-domain">${dom}</span>`;
            });
        }

        html += `</div></div>`;
        html += `<button class="back-btn" onclick="document.dispatchEvent(new CustomEvent('deselect-node'))">← Înapoi la rețea</button>`;

    } else {
        const count = edges.filter(e => e.target === d.id).length;
        html += `<div class="partner-card-sidebar">`;
        html += `<div class="partner-name">${d.data.label}</div>`;
        html += `<div class="partner-desc">Domeniu cu <strong>${count}</strong> parteneri conectați.</div>`;
        html += `</div>`;
        html += `<button class="back-btn" onclick="document.dispatchEvent(new CustomEvent('deselect-node'))">← Înapoi la rețea</button>`;
    }

    sidebarInfo.innerHTML = html;
}

function resetSidebarInfo() {
    const sidebarInfo = document.getElementById('sidebar-info');
    sidebarInfo.innerHTML = `
        <div class="glass-card sidebar-welcome">
            <div class="welcome-title">Rețeaua de Parteneri DSU</div>
            <p class="welcome-text">Vizualizare interactivă a parteneriatelor dintre Departamentul pentru Situații de Urgență și organizațiile care contribuie la răspunsul național în caz de urgență.</p>
            <div class="welcome-hints">
                <strong>Ce puteți afla?</strong><br>
                &bull; Cine sunt partenerii DSU<br>
                &bull; În ce domenii activează<br>
                &bull; Care sunt partenerii strategici<br>
                &bull; Cine ajută în criza din Ucraina
            </div>
        </div>
        <div class="info-box">
            <div class="info-title">Cum navigați</div>
            <div class="info-text">
                <b>Hover</b> pe un nod pentru conexiuni<br>
                <b>Click</b> pe un nod pentru detalii<br>
                <b>Scroll</b> pentru zoom<br>
                <b>Drag</b> pentru a muta vizualizarea
            </div>
        </div>
    `;
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
}

function buildEntityFilters(networkData) {
    const { nodes } = networkData;
    const container = document.getElementById('entity-filters');

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
        html += `<button class="entity-btn" data-type="${type}">
            <span class="entity-dot" style="background:${config.color}"></span>
            <span>${type}</span>
            <span class="entity-count">${count}</span>
        </button>`;
    }
    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll('.entity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const isActive = btn.classList.contains('active');

            // Reset all
            container.querySelectorAll('.entity-btn').forEach(b => b.classList.remove('active'));

            if (isActive) {
                filterState.entityType = null;
                document.getElementById('reset-entity-btn').classList.add('hidden');
            } else {
                btn.classList.add('active');
                filterState.entityType = type;
                document.getElementById('reset-entity-btn').classList.remove('hidden');
            }

            deselectNode();
            rebuildGraph();
        });
    });

    // Reset button
    document.getElementById('reset-entity-btn').addEventListener('click', () => {
        filterState.entityType = null;
        container.querySelectorAll('.entity-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('reset-entity-btn').classList.add('hidden');
        rebuildGraph();
    });
}

function buildDomainFilters(networkData) {
    const container = document.getElementById('domain-filters');
    const allDomains = networkData.allDomains;

    let html = '';
    for (const [groupName, groupDomains] of Object.entries(DOMAIN_GROUPS)) {
        const available = groupDomains.filter(d => allDomains.includes(d));
        if (available.length === 0) continue;

        html += `<div class="domain-group expanded" data-group="${groupName}">`;
        html += `<div class="domain-group-header">
            <span class="domain-group-arrow">▶</span>
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
        });
    });

    // Select all / none
    document.getElementById('select-all-domains').addEventListener('click', () => {
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        updateDomainFilter();
        rebuildGraph();
    });

    document.getElementById('select-no-domains').addEventListener('click', () => {
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        updateDomainFilter();
        rebuildGraph();
    });
}

function updateDomainFilter() {
    const container = document.getElementById('domain-filters');
    const checked = [...container.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);
    filterState.domains = checked;
}

function buildSpecialFilters(networkData) {
    const { nodes } = networkData;
    const container = document.getElementById('special-filters');

    let strategicCount = 0, ukraineCount = 0;
    for (const [, node] of Object.entries(nodes)) {
        if (node.strategic) strategicCount++;
        if (node.ukraine) ukraineCount++;
    }

    container.innerHTML = `
        <button class="special-btn" data-filter="strategic">⭐ Parteneri strategici (${strategicCount})</button>
        <button class="special-btn" data-filter="ukraine">🇺🇦 Sprijin Ucraina (${ukraineCount})</button>
    `;

    container.querySelectorAll('.special-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            const isActive = btn.classList.contains('active');

            container.querySelectorAll('.special-btn').forEach(b => b.classList.remove('active'));

            if (isActive) {
                filterState.specialFilter = null;
            } else {
                btn.classList.add('active');
                filterState.specialFilter = filter;
            }

            deselectNode();
            rebuildGraph();
        });
    });
}

function buildSearch(networkData) {
    const { nodes } = networkData;
    const input = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');

    // Build partner name list
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
            resultsEl.classList.add('hidden');
            return;
        }

        resultsEl.innerHTML = matches.map(m =>
            `<div class="search-result-item" data-id="${m.id}">${m.label}</div>`
        ).join('');
        resultsEl.classList.remove('hidden');

        resultsEl.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const node = currentNodes.find(n => n.id === id);
                if (node) {
                    selectNode(node);
                    // Center on selected node
                    if (node.x !== undefined) {
                        const transform = d3.zoomTransform(svg.node());
                        const tx = width / 2 - node.x * transform.k;
                        const ty = height / 2 - node.y * transform.k;
                        svg.transition().duration(500).call(
                            d3.zoom().transform,
                            d3.zoomIdentity.translate(tx, ty).scale(transform.k)
                        );
                    }
                }
                input.value = '';
                resultsEl.classList.add('hidden');
            });
        });
    });

    // Close results on outside click
    document.addEventListener('click', (e) => {
        if (!resultsEl.contains(e.target) && e.target !== input) {
            resultsEl.classList.add('hidden');
        }
    });
}

// ---- STATS OVERLAY ----

function updateStats(networkData) {
    const { nodes, edges } = networkData;
    const partnerCount = Object.values(nodes).filter(n => n.type === 'Partner' && n.parentId === null).length;
    const domainCount = Object.values(nodes).filter(n => n.type === 'Domain').length;

    document.getElementById('stat-partners').textContent = partnerCount;
    document.getElementById('stat-domains').textContent = domainCount;
    document.getElementById('stat-connections').textContent = edges.length;
}
