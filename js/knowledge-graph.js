/* =========================================
   DIRECTED KNOWLEDGE GRAPH (D3.js)
   Converted from directed_knowledge_graph.jsx
   ========================================= */

// ─── Raw data ───────────────────────────────────────────────────────────────
const RAW = [
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Cutremure de pământ","Pregătire"],
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Cutremure de pământ","Răspuns"],
  ["LIGHT USAR","Autorități locale (SVSU)","Sp","Cutremure de pământ","Pregătire"],
  ["LIGHT USAR","Autorități locale (SVSU)","Sp","Cutremure de pământ","Răspuns"],
  ["LIGHT USAR","MApN","Sp","Cutremure de pământ","Pregătire"],
  ["LIGHT USAR","MApN","Sp","Cutremure de pământ","Răspuns"],
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Alunecări de teren","Pregătire"],
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Alunecări de teren","Răspuns"],
  ["LIGHT USAR","Autorități locale (SVSU)","Sp","Alunecări de teren","Pregătire"],
  ["LIGHT USAR","MApN","Sp","Alunecări de teren","Răspuns"],
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Prăbușiri construcții","Pregătire"],
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Prăbușiri construcții","Răspuns"],
  ["LIGHT USAR","Autorități locale (SVSU)","Sp","Prăbușiri construcții","Pregătire"],
  ["LIGHT USAR","MApN","Sp","Prăbușiri construcții","Răspuns"],
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Incendii de construcții","Pregătire"],
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Incendii de construcții","Răspuns"],
  ["LIGHT USAR","Autorități locale (SVSU)","Sp","Incendii de construcții","Pregătire"],
  ["LIGHT USAR","MApN","Sp","Accidente industriale","Răspuns"],
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Accidente industriale","Pregătire"],
  ["LIGHT USAR","MAI/IGSU (ISU-uri județene)","P","Accidente industriale","Răspuns"],
  ["MUSAR","MAI/IGSU (ISU-uri + USISU)","P","Cutremure de pământ","Pregătire"],
  ["MUSAR","MAI/IGSU (ISU-uri + USISU)","P","Cutremure de pământ","Răspuns"],
  ["MUSAR","MApN","S","Cutremure de pământ","Pregătire"],
  ["MUSAR","MApN","S","Cutremure de pământ","Răspuns"],
  ["MUSAR","MS (SMURD)","Sp","Cutremure de pământ","Pregătire"],
  ["MUSAR","MS (SMURD)","Sp","Cutremure de pământ","Răspuns"],
  ["MUSAR","Autorități locale","Sp","Cutremure de pământ","Pregătire"],
  ["MUSAR","MAI/IGSU (ISU-uri + USISU)","P","Alunecări de teren","Pregătire"],
  ["MUSAR","MAI/IGSU (ISU-uri + USISU)","P","Alunecări de teren","Răspuns"],
  ["MUSAR","MApN","S","Alunecări de teren","Răspuns"],
  ["MUSAR","MS (SMURD)","Sp","Alunecări de teren","Pregătire"],
  ["MUSAR","MAI/IGSU (ISU-uri + USISU)","P","Prăbușiri construcții","Pregătire"],
  ["MUSAR","MAI/IGSU (ISU-uri + USISU)","P","Prăbușiri construcții","Răspuns"],
  ["MUSAR","MApN","S","Prăbușiri construcții","Pregătire"],
  ["MUSAR","MS (SMURD)","Sp","Prăbușiri construcții","Răspuns"],
  ["HUSAR","MAI/IGSU – USISU (RO-USAR)","P","Cutremure de pământ","Pregătire"],
  ["HUSAR","MAI/IGSU – USISU (RO-USAR)","P","Cutremure de pământ","Răspuns"],
  ["HUSAR","ISU Argeș/Dolj/Constanța","S","Cutremure de pământ","Pregătire"],
  ["HUSAR","ISU Argeș/Dolj/Constanța","S","Cutremure de pământ","Răspuns"],
  ["HUSAR","MApN","Sp","Cutremure de pământ","Pregătire"],
  ["HUSAR","MS (SMURD)","Sp","Cutremure de pământ","Răspuns"],
  ["HUSAR","MAI/IGSU – USISU (RO-USAR)","P","Prăbușiri construcții","Pregătire"],
  ["HUSAR","MAI/IGSU – USISU (RO-USAR)","P","Prăbușiri construcții","Răspuns"],
  ["HUSAR","ISU Argeș/Dolj/Constanța","S","Prăbușiri construcții","Pregătire"],
  ["HUSAR","MApN","Sp","Prăbușiri construcții","Răspuns"],
  ["HUSAR","MAI/IGSU – USISU (RO-USAR)","P","Accidente industriale","Pregătire"],
  ["HUSAR","ISU Argeș/Dolj/Constanța","S","Accidente industriale","Răspuns"],
  ["HUSAR","MS (SMURD)","Sp","Accidente industriale","Pregătire"],
  ["HUSAR","MAI/IGSU – USISU (RO-USAR)","P","Accidente transport","Pregătire"],
  ["HUSAR","MAI/IGSU – USISU (RO-USAR)","P","Accidente transport","Răspuns"],
  ["HUSAR","ISU Argeș/Dolj/Constanța","S","Accidente transport","Pregătire"],
  ["HUSAR","MApN","Sp","Accidente transport","Răspuns"],
  ["HUSAR","MS (SMURD)","Sp","Accidente transport","Pregătire"],
  ["CBRNUSAR","MAI/IGSU – USISU (Modul CBRN)","P","Accidente nucleare/radiologice","Pregătire"],
  ["CBRNUSAR","MAI/IGSU – USISU (Modul CBRN)","P","Accidente nucleare/radiologice","Răspuns"],
  ["CBRNUSAR","MApN (unități CBRN)","S","Accidente nucleare/radiologice","Pregătire"],
  ["CBRNUSAR","MApN (unități CBRN)","S","Accidente nucleare/radiologice","Răspuns"],
  ["CBRNUSAR","CNCAN","Sp","Accidente nucleare/radiologice","Pregătire"],
  ["CBRNUSAR","MS","Sp","Accidente nucleare/radiologice","Răspuns"],
  ["CBRNUSAR","MAI/IGSU – USISU (Modul CBRN)","P","Accidente industriale (CBRN)","Pregătire"],
  ["CBRNUSAR","MApN (unități CBRN)","S","Accidente industriale (CBRN)","Răspuns"],
  ["CBRNUSAR","CNCAN","Sp","Accidente industriale (CBRN)","Pregătire"],
  ["CBRNUSAR","MS","Sp","Accidente industriale (CBRN)","Răspuns"],
  ["CBRNUSAR","MAI/IGSU – USISU (Modul CBRN)","P","Transport materiale periculoase","Pregătire"],
  ["CBRNUSAR","MAI/IGSU – USISU (Modul CBRN)","P","Transport materiale periculoase","Răspuns"],
  ["CBRNUSAR","MApN (unități CBRN)","S","Transport materiale periculoase","Pregătire"],
  ["CBRNUSAR","CNCAN","Sp","Transport materiale periculoase","Răspuns"],
  ["Căutare-salvare montană","Salvamont","P","Avalanșe","Pregătire"],
  ["Căutare-salvare montană","Salvamont","P","Avalanșe","Răspuns"],
  ["Căutare-salvare montană","MAI/IGSU (ISU județe montane)","S","Avalanșe","Pregătire"],
  ["Căutare-salvare montană","MAI/IGSU (ISU județe montane)","S","Avalanșe","Răspuns"],
  ["Căutare-salvare montană","MApN","Sp","Avalanșe","Pregătire"],
  ["Căutare-salvare montană","MS (SMURD)","Sp","Avalanșe","Răspuns"],
  ["Căutare-salvare montană","IGAV (elicoptere)","Sp","Avalanșe","Pregătire"],
  ["Căutare-salvare montană","Salvamont","P","Temperaturi extreme","Pregătire"],
  ["Căutare-salvare montană","MAI/IGSU (ISU județe montane)","S","Temperaturi extreme","Răspuns"],
  ["Căutare-salvare montană","MS (SMURD)","Sp","Temperaturi extreme","Pregătire"],
  ["Căutare-salvare montană","IGAV (elicoptere)","Sp","Temperaturi extreme","Răspuns"],
];

// ─── Node type configs ──────────────────────────────────────────────────────
const NODE_TYPES = {
  CAPABILITY: { label: "Capabilitate", color: "#f59e0b", shape: "hexagon", size: 28 },
  AUTHORITY:  { label: "Autoritate",   color: "#38bdf8", shape: "circle",  size: 22 },
  RISK:       { label: "Tip Risc",     color: "#f87171", shape: "diamond", size: 20 },
  PHASE:      { label: "Fază Ciclu",   color: "#34d399", shape: "rect",    size: 18 },
};

// ─── Edge type configs ──────────────────────────────────────────────────────
const EDGE_TYPES = {
  CONDUCE:  { label: "CONDUCE (Principal)", color: "#f97316", dash: "",    width: 2.5 },
  SPRIJINA: { label: "SPRIJINIT DE (Suport)", color: "#8b5cf6", dash: "6,3", width: 1.5 },
  SECUNDAR: { label: "SECUNDAR",            color: "#3b82f6", dash: "3,3", width: 1.5 },
  ACOPERA:  { label: "ACOPERĂ RISCUL",      color: "#f87171", dash: "",    width: 1.2 },
  IN_FAZA:  { label: "ÎN FAZA",             color: "#34d399", dash: "2,4", width: 1   },
};

const RISK_ICONS = {
  "Cutremure de pământ": "\u{1F30D}",
  "Alunecări de teren": "\u26F0\uFE0F",
  "Prăbușiri construcții": "\u{1F3DA}\uFE0F",
  "Incendii de construcții": "\u{1F525}",
  "Accidente industriale": "\u{1F3ED}",
  "Accidente nucleare/radiologice": "\u2622\uFE0F",
  "Accidente industriale (CBRN)": "\u2697\uFE0F",
  "Transport materiale periculoase": "\u{1F69B}",
  "Avalanșe": "\u{1F3D4}\uFE0F",
  "Accidente transport": "\u{1F697}",
  "Temperaturi extreme": "\u{1F321}\uFE0F",
};

// ─── Spatial zone targets for each node type ────────────────────────────────
// Expressed as fractions of canvas width/height so they adapt to viewport size
const TYPE_ZONES = {
  AUTHORITY:  { fx: 0.18, fy: 0.50 },  // left
  CAPABILITY: { fx: 0.50, fy: 0.45 },  // center
  RISK:       { fx: 0.82, fy: 0.50 },  // right
  PHASE:      { fx: 0.50, fy: 0.92 },  // bottom center
};

// ─── Build graph from raw data ──────────────────────────────────────────────
function buildGraph() {
  const nodesMap = new Map();
  const edges = [];
  const edgeSet = new Set();

  const addNode = (id, type, label) => {
    if (!nodesMap.has(id)) {
      nodesMap.set(id, { id, type, label, degree: 0 });
    }
  };

  const addEdge = (src, tgt, type) => {
    const key = `${src}\u2192${tgt}\u2192${type}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ id: key, source: src, target: tgt, type });
    }
  };

  RAW.forEach(([cap, auth, rol, risk, phase]) => {
    addNode(`cap:${cap}`, "CAPABILITY", cap);
    addNode(`auth:${auth}`, "AUTHORITY", auth);
    addNode(`risk:${risk}`, "RISK", (RISK_ICONS[risk] || "\u26A0\uFE0F") + " " + risk);
    addNode(`phase:${phase}`, "PHASE", phase);

    const roleEdge = rol === "P" ? "CONDUCE" : rol === "S" ? "SECUNDAR" : "SPRIJINA";
    addEdge(`auth:${auth}`, `cap:${cap}`, roleEdge);
    addEdge(`cap:${cap}`, `risk:${risk}`, "ACOPERA");
    addEdge(`cap:${cap}`, `phase:${phase}`, "IN_FAZA");
  });

  // Compute degree for each node (for sizing)
  const nodes = [...nodesMap.values()];
  edges.forEach(e => {
    const src = nodesMap.get(e.source);
    const tgt = nodesMap.get(e.target);
    if (src) src.degree++;
    if (tgt) tgt.degree++;
  });

  return { nodes, edges };
}

// ─── State ──────────────────────────────────────────────────────────────────
let kgSvg, kgGroup, kgSimulation;
let kgGraph = null;
let kgSelectedNode = null;
let kgHoveredNode = null;
let kgHiddenEdgeTypes = new Set(["IN_FAZA"]);
let kgHiddenNodeTypes = new Set(["PHASE"]);
let kgInitialized = false;

// ─── Public API ─────────────────────────────────────────────────────────────
export function initKnowledgeGraph() {
  if (kgInitialized) return;
  kgInitialized = true;

  kgGraph = buildGraph();
  setupKgSVG();
  setupKgControls();
  renderGraph();
}

// ─── Get container dimensions ───────────────────────────────────────────────
function getKgDims() {
  const container = document.getElementById("kg-container");
  if (!container) return { w: 1200, h: 700 };
  const rect = container.getBoundingClientRect();
  return { w: rect.width || 1200, h: rect.height || 700 };
}

// ─── SVG Setup ──────────────────────────────────────────────────────────────
function setupKgSVG() {
  const container = document.getElementById("kg-container");
  if (!container) return;

  const { w, h } = getKgDims();

  kgSvg = d3.select("#kg-svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Clear any existing content
  kgSvg.selectAll("*").remove();

  // Defs for markers and filters
  const defs = kgSvg.append("defs");

  // Arrow markers for each edge type
  Object.entries(EDGE_TYPES).forEach(([type, cfg]) => {
    defs.append("marker")
      .attr("id", `kg-arrow-${type}`)
      .attr("markerWidth", 10)
      .attr("markerHeight", 7)
      .attr("refX", 9)
      .attr("refY", 3.5)
      .attr("orient", "auto")
      .append("polygon")
        .attr("points", "0 0, 10 3.5, 0 7")
        .attr("fill", cfg.color)
        .attr("opacity", 0.85);
  });

  // Glow filters
  const glow = defs.append("filter")
    .attr("id", "kg-glow")
    .attr("x", "-50%").attr("y", "-50%")
    .attr("width", "200%").attr("height", "200%");
  glow.append("feGaussianBlur").attr("stdDeviation", 4).attr("result", "blur");
  const glowMerge = glow.append("feMerge");
  glowMerge.append("feMergeNode").attr("in", "blur");
  glowMerge.append("feMergeNode").attr("in", "SourceGraphic");

  const glowStrong = defs.append("filter")
    .attr("id", "kg-glow-strong")
    .attr("x", "-100%").attr("y", "-100%")
    .attr("width", "300%").attr("height", "300%");
  glowStrong.append("feGaussianBlur").attr("stdDeviation", 8).attr("result", "blur");
  const glowStrongMerge = glowStrong.append("feMerge");
  glowStrongMerge.append("feMergeNode").attr("in", "blur");
  glowStrongMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // Background grid
  const gridGroup = kgSvg.append("g").attr("opacity", 0.06);
  for (let i = 0; i < 30; i++) {
    gridGroup.append("line")
      .attr("x1", 0).attr("y1", i * 40)
      .attr("x2", w).attr("y2", i * 40)
      .attr("stroke", "#38bdf8").attr("stroke-width", 0.5);
  }
  for (let i = 0; i < 40; i++) {
    gridGroup.append("line")
      .attr("x1", i * 40).attr("y1", 0)
      .attr("x2", i * 40).attr("y2", h)
      .attr("stroke", "#38bdf8").attr("stroke-width", 0.5);
  }

  // Main group with zoom/pan
  kgGroup = kgSvg.append("g");

  const zoom = d3.zoom()
    .scaleExtent([0.3, 2.5])
    .on("zoom", (event) => {
      kgGroup.attr("transform", event.transform);
      const pct = document.getElementById("kg-zoom-pct");
      if (pct) pct.textContent = Math.round(event.transform.k * 100) + "%";
    });

  kgSvg.call(zoom);

  // Set initial zoom
  const initialTransform = d3.zoomIdentity.translate(w * 0.08, h * 0.08).scale(0.85);
  kgSvg.call(zoom.transform, initialTransform);

  // Click on background deselects
  kgSvg.on("click", (event) => {
    if (event.target === kgSvg.node()) {
      selectKgNode(null);
    }
  });

  // Handle resize
  window.addEventListener("resize", () => {
    if (!document.getElementById("page-knowledgegraph")?.classList.contains("active")) return;
    const { w: nw, h: nh } = getKgDims();
    kgSvg.attr("viewBox", `0 0 ${nw} ${nh}`);
  });
}

// ─── Compute visual node size based on degree ───────────────────────────────
function nodeRadius(d) {
  const base = NODE_TYPES[d.type]?.size || 20;
  const degreeBoost = Math.min(d.degree || 0, 30) * 0.35;
  return base + degreeBoost;
}

// ─── Render graph ───────────────────────────────────────────────────────────
function renderGraph() {
  if (!kgGraph || !kgGroup) return;

  // Clear previous render
  kgGroup.selectAll(".kg-edges, .kg-nodes, .kg-zone-labels").remove();

  const { w, h } = getKgDims();

  // Filter visible
  const visibleNodeIds = new Set(
    kgGraph.nodes
      .filter(n => !kgHiddenNodeTypes.has(n.type))
      .map(n => n.id)
  );

  const visibleEdges = kgGraph.edges.filter(e => {
    if (kgHiddenEdgeTypes.has(e.type)) return false;
    const srcNode = kgGraph.nodes.find(n => n.id === e.source);
    const tgtNode = kgGraph.nodes.find(n => n.id === e.target);
    if (!srcNode || !tgtNode) return false;
    return visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target);
  });

  const visibleNodes = kgGraph.nodes.filter(n => visibleNodeIds.has(n.id));

  // Build D3 force simulation with spatial clustering
  if (kgSimulation) kgSimulation.stop();

  // Custom clustering force: gently pull nodes toward their type's zone
  function clusterForce(alpha) {
    visibleNodes.forEach(d => {
      const zone = TYPE_ZONES[d.type];
      if (!zone) return;
      const tx = zone.fx * w;
      const ty = zone.fy * h;
      const strength = 0.12 * alpha;
      d.vx += (tx - d.x) * strength;
      d.vy += (ty - d.y) * strength;
    });
  }

  kgSimulation = d3.forceSimulation(visibleNodes)
    .force("charge", d3.forceManyBody().strength(-350))
    .force("link", d3.forceLink(visibleEdges)
      .id(d => d.id)
      .distance(d => {
        // Shorter links within same type-zone, longer across zones
        const srcType = (typeof d.source === "object" ? d.source : visibleNodes.find(n => n.id === d.source))?.type;
        const tgtType = (typeof d.target === "object" ? d.target : visibleNodes.find(n => n.id === d.target))?.type;
        return srcType === tgtType ? 100 : 200;
      })
      .strength(0.3))
    .force("collide", d3.forceCollide().radius(d => nodeRadius(d) + 18))
    .force("cluster", clusterForce)
    .alphaDecay(0.02)
    .velocityDecay(0.35);

  // Zone labels (subtle background labels showing where each type group lives)
  const zoneLabels = kgGroup.append("g").attr("class", "kg-zone-labels");
  const visibleTypes = new Set(visibleNodes.map(n => n.type));
  Object.entries(TYPE_ZONES).forEach(([type, zone]) => {
    if (!visibleTypes.has(type)) return;
    const cfg = NODE_TYPES[type];
    zoneLabels.append("text")
      .attr("x", zone.fx * w)
      .attr("y", zone.fy * h - (type === "PHASE" ? 30 : 0))
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("fill", cfg.color)
      .attr("opacity", 0.12)
      .attr("font-weight", "800")
      .attr("letter-spacing", "4px")
      .style("text-transform", "uppercase")
      .style("font-family", "'Inter', sans-serif")
      .style("pointer-events", "none")
      .text(cfg.label);
  });

  // Edge group
  const edgeGroup = kgGroup.append("g").attr("class", "kg-edges");

  const edgePaths = edgeGroup.selectAll("path")
    .data(visibleEdges, d => d.id)
    .join("path")
      .attr("fill", "none")
      .attr("stroke", d => EDGE_TYPES[d.type].color)
      .attr("stroke-width", d => EDGE_TYPES[d.type].width)
      .attr("stroke-dasharray", d => EDGE_TYPES[d.type].dash)
      .attr("marker-end", d => `url(#kg-arrow-${d.type})`)
      .attr("opacity", 0.35);

  // Node group
  const nodeGroupSel = kgGroup.append("g").attr("class", "kg-nodes");

  const nodeGroups = nodeGroupSel.selectAll("g")
    .data(visibleNodes, d => d.id)
    .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) kgSimulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) kgSimulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }))
      .on("click", (event, d) => {
        event.stopPropagation();
        selectKgNode(kgSelectedNode === d.id ? null : d.id);
      })
      .on("mouseenter", (event, d) => {
        kgHoveredNode = d.id;
        updateNodeAppearance(nodeGroups, edgePaths);
        showKgTooltip(event, d);
      })
      .on("mousemove", (event, d) => {
        moveKgTooltip(event);
      })
      .on("mouseleave", () => {
        kgHoveredNode = null;
        updateNodeAppearance(nodeGroups, edgePaths);
        hideKgTooltip();
      });

  // Draw shapes for each node (degree-scaled)
  nodeGroups.each(function(d) {
    const g = d3.select(this);
    const cfg = NODE_TYPES[d.type];
    const s = nodeRadius(d);

    if (d.type === "CAPABILITY") {
      // Hexagon
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return `${s * Math.cos(a)},${s * Math.sin(a)}`;
      }).join(" ");
      g.append("polygon")
        .attr("points", pts)
        .attr("fill", cfg.color + "22")
        .attr("stroke", cfg.color)
        .attr("stroke-width", 1.5)
        .attr("class", "kg-shape");
    } else if (d.type === "RISK") {
      // Diamond
      const r = s * 1.2;
      g.append("polygon")
        .attr("points", `0,${-r} ${r},0 0,${r} ${-r},0`)
        .attr("fill", cfg.color + "22")
        .attr("stroke", cfg.color)
        .attr("stroke-width", 1.5)
        .attr("class", "kg-shape");
    } else if (d.type === "PHASE") {
      // Rounded rect
      const r = s * 0.85;
      g.append("rect")
        .attr("x", -r).attr("y", -r * 0.7)
        .attr("width", r * 2).attr("height", r * 1.4)
        .attr("rx", 5)
        .attr("fill", cfg.color + "22")
        .attr("stroke", cfg.color)
        .attr("stroke-width", 1.5)
        .attr("class", "kg-shape");
    } else {
      // Circle (AUTHORITY)
      g.append("circle")
        .attr("r", s)
        .attr("fill", cfg.color + "22")
        .attr("stroke", cfg.color)
        .attr("stroke-width", 1.5)
        .attr("class", "kg-shape");
    }

    // Label — bigger, full text for shorter names, wrap for longer ones
    const maxLen = d.type === "CAPABILITY" ? 28 : 24;
    const shortLabel = d.label.length > maxLen ? d.label.slice(0, maxLen) + "\u2026" : d.label;
    const fontSize = d.type === "CAPABILITY" ? "11px" : "10px";
    g.append("text")
      .attr("y", s + 16)
      .attr("text-anchor", "middle")
      .attr("font-size", fontSize)
      .attr("fill", cfg.color + "cc")
      .attr("pointer-events", "none")
      .attr("class", "kg-label")
      .style("user-select", "none")
      .style("font-family", "'Inter', 'Nunito', sans-serif")
      .style("font-weight", "600")
      .style("letter-spacing", "0.3px")
      .text(shortLabel);
  });

  // Tick handler
  kgSimulation.on("tick", () => {
    edgePaths.attr("d", d => {
      const sx = d.source.x, sy = d.source.y;
      const tx = d.target.x, ty = d.target.y;
      const dx = tx - sx, dy = ty - sy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const srcSize = nodeRadius(d.source);
      const tgtSize = nodeRadius(d.target);
      const x1 = sx + (dx / len) * (srcSize + 4);
      const y1 = sy + (dy / len) * (srcSize + 4);
      const x2 = tx - (dx / len) * (tgtSize + 12);
      const y2 = ty - (dy / len) * (tgtSize + 12);
      // Slight curve
      const cx = (x1 + x2) / 2 - (dy / len) * 20;
      const cy = (y1 + y2) / 2 + (dx / len) * 20;
      return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
    });

    nodeGroups.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  // Store references for updates
  kgGroup._nodeGroups = nodeGroups;
  kgGroup._edgePaths = edgePaths;

  // Update stats
  updateKgStats(visibleNodes.length, visibleEdges.length);
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function ensureTooltip() {
  let tip = document.getElementById("kg-tooltip");
  if (!tip) {
    tip = document.createElement("div");
    tip.id = "kg-tooltip";
    tip.className = "kg-tooltip";
    document.body.appendChild(tip);
  }
  return tip;
}

function showKgTooltip(event, d) {
  const tip = ensureTooltip();
  const cfg = NODE_TYPES[d.type];
  const connections = kgGraph.edges.filter(e => {
    const srcId = typeof e.source === "object" ? e.source.id : e.source;
    const tgtId = typeof e.target === "object" ? e.target.id : e.target;
    return srcId === d.id || tgtId === d.id;
  }).length;
  tip.innerHTML = `
    <div style="color:${cfg.color}; font-size:10px; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">${cfg.label}</div>
    <div style="font-size:13px; font-weight:700; color:#f1f5f9; margin-bottom:4px;">${d.label}</div>
    <div style="font-size:10px; color:#64748b;">${connections} conexiuni</div>`;
  tip.style.display = "block";
  moveKgTooltip(event);
}

function moveKgTooltip(event) {
  const tip = ensureTooltip();
  tip.style.left = (event.pageX + 14) + "px";
  tip.style.top = (event.pageY - 14) + "px";
}

function hideKgTooltip() {
  const tip = document.getElementById("kg-tooltip");
  if (tip) tip.style.display = "none";
}

// ─── Node selection ─────────────────────────────────────────────────────────
function selectKgNode(nodeId) {
  kgSelectedNode = nodeId;

  const nodeGroups = kgGroup._nodeGroups;
  const edgePaths = kgGroup._edgePaths;
  if (nodeGroups && edgePaths) {
    updateNodeAppearance(nodeGroups, edgePaths);
  }

  updateKgDetailPanel();
}

function updateNodeAppearance(nodeGroups, edgePaths) {
  // Determine connected nodes/edges
  let connectedNodeIds = null;
  let connectedEdgeIds = null;

  if (kgSelectedNode) {
    connectedNodeIds = new Set([kgSelectedNode]);
    connectedEdgeIds = new Set();
    kgGraph.edges.forEach(e => {
      const srcId = typeof e.source === "object" ? e.source.id : e.source;
      const tgtId = typeof e.target === "object" ? e.target.id : e.target;
      if (srcId === kgSelectedNode || tgtId === kgSelectedNode) {
        connectedNodeIds.add(srcId);
        connectedNodeIds.add(tgtId);
        connectedEdgeIds.add(e.id);
      }
    });
  }

  // Update edges
  edgePaths
    .attr("opacity", d => {
      if (!connectedEdgeIds) return 0.35;
      return connectedEdgeIds.has(d.id) ? 0.9 : 0.06;
    })
    .attr("stroke-width", d => {
      const base = EDGE_TYPES[d.type].width;
      if (!connectedEdgeIds) return base;
      return connectedEdgeIds.has(d.id) ? base * 2 : base;
    })
    .attr("filter", d => {
      if (!connectedEdgeIds) return "none";
      return connectedEdgeIds.has(d.id) ? "url(#kg-glow)" : "none";
    });

  // Update nodes
  nodeGroups
    .attr("opacity", d => {
      if (!connectedNodeIds) return 1;
      return connectedNodeIds.has(d.id) ? 1 : 0.12;
    });

  nodeGroups.select(".kg-shape")
    .attr("stroke-width", d => {
      if (kgSelectedNode === d.id) return 2.5;
      if (kgHoveredNode === d.id) return 2;
      return 1.5;
    })
    .attr("filter", d => {
      if (kgSelectedNode === d.id) return "url(#kg-glow-strong)";
      if (kgHoveredNode === d.id) return "url(#kg-glow)";
      return "none";
    });

  nodeGroups.select(".kg-label")
    .attr("fill", d => {
      const cfg = NODE_TYPES[d.type];
      if (kgSelectedNode === d.id || kgHoveredNode === d.id) return cfg.color;
      return "#94a3b8";
    })
    .attr("font-weight", d => kgSelectedNode === d.id ? "700" : "500");
}

// ─── Detail panel ───────────────────────────────────────────────────────────
function updateKgDetailPanel() {
  const panel = document.getElementById("kg-detail-panel");
  if (!panel) return;

  if (!kgSelectedNode) {
    panel.innerHTML = `
      <div class="kg-detail-empty">
        <div class="kg-detail-empty-icon">\u2B21</div>
        Click pe un nod<br>pentru detalii și relații
      </div>`;
    return;
  }

  const node = kgGraph.nodes.find(n => n.id === kgSelectedNode);
  if (!node) return;

  const cfg = NODE_TYPES[node.type];
  const relatedEdges = kgGraph.edges.filter(e => {
    const srcId = typeof e.source === "object" ? e.source.id : e.source;
    const tgtId = typeof e.target === "object" ? e.target.id : e.target;
    return srcId === kgSelectedNode || tgtId === kgSelectedNode;
  });

  let html = `
    <div class="kg-detail-section-title">Nod selectat</div>
    <div class="kg-detail-card" style="background:${cfg.color}12; border-color:${cfg.color}44;">
      <div class="kg-detail-type" style="color:${cfg.color}">${cfg.label}</div>
      <div class="kg-detail-name">${node.label}</div>
    </div>
    <div class="kg-detail-section-title">Relații (${relatedEdges.length})</div>`;

  relatedEdges.slice(0, 20).forEach(e => {
    const srcId = typeof e.source === "object" ? e.source.id : e.source;
    const tgtId = typeof e.target === "object" ? e.target.id : e.target;
    const otherId = srcId === kgSelectedNode ? tgtId : srcId;
    const other = kgGraph.nodes.find(n => n.id === otherId);
    const dir = srcId === kgSelectedNode ? "\u2192" : "\u2190";
    const eCfg = EDGE_TYPES[e.type];

    html += `
      <div class="kg-relation-item" data-node-id="${otherId}">
        <span class="kg-relation-dir" style="color:${eCfg.color}">${dir}</span>
        <div>
          <div class="kg-relation-type" style="color:${eCfg.color}">${eCfg.label}</div>
          <div class="kg-relation-name">${other?.label || "?"}</div>
        </div>
      </div>`;
  });

  if (relatedEdges.length > 20) {
    html += `<div class="kg-relation-more">+ ${relatedEdges.length - 20} mai multe</div>`;
  }

  panel.innerHTML = html;

  // Add click handlers for relation items
  panel.querySelectorAll(".kg-relation-item").forEach(el => {
    el.addEventListener("click", () => {
      selectKgNode(el.dataset.nodeId);
    });
  });
}

// ─── Controls setup ─────────────────────────────────────────────────────────
function setupKgControls() {
  // Node type toggle buttons
  const nodeToggles = document.getElementById("kg-node-toggles");
  if (nodeToggles) {
    nodeToggles.innerHTML = "";
    Object.entries(NODE_TYPES).forEach(([type, cfg]) => {
      const btn = document.createElement("button");
      btn.className = "kg-toggle-btn";
      btn.dataset.type = type;
      const hidden = kgHiddenNodeTypes.has(type);
      btn.style.borderColor = hidden ? "#1e293b" : cfg.color + "88";
      btn.style.background = hidden ? "#0c1322" : cfg.color + "18";
      btn.style.color = hidden ? "#334155" : cfg.color;
      btn.textContent = cfg.label;
      btn.addEventListener("click", () => {
        if (kgHiddenNodeTypes.has(type)) {
          kgHiddenNodeTypes.delete(type);
          btn.style.borderColor = cfg.color + "88";
          btn.style.background = cfg.color + "18";
          btn.style.color = cfg.color;
        } else {
          kgHiddenNodeTypes.add(type);
          btn.style.borderColor = "#1e293b";
          btn.style.background = "#0c1322";
          btn.style.color = "#334155";
        }
        renderGraph();
      });
      nodeToggles.appendChild(btn);
    });
  }

  // Reset button
  const resetBtn = document.getElementById("kg-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      kgSelectedNode = null;
      kgHoveredNode = null;
      if (kgSimulation) {
        kgSimulation.alpha(1).restart();
      }
      updateKgDetailPanel();
    });
  }

  // Edge type toggles in sidebar
  const edgeToggles = document.getElementById("kg-edge-toggles");
  if (edgeToggles) {
    edgeToggles.innerHTML = "";
    Object.entries(EDGE_TYPES).forEach(([type, cfg]) => {
      const hidden = kgHiddenEdgeTypes.has(type);
      const row = document.createElement("div");
      row.className = "kg-edge-toggle";
      row.style.background = hidden ? "transparent" : cfg.color + "12";
      row.style.borderColor = hidden ? "#0f1e3c" : cfg.color + "33";
      const lineColor = hidden ? "#1e293b" : cfg.color;
      const spanColor = hidden ? "#334155" : cfg.color;
      row.innerHTML = `
        <svg width="28" height="8">
          <line x1="0" y1="4" x2="22" y2="4" stroke="${lineColor}"
            stroke-width="${cfg.width}" stroke-dasharray="${cfg.dash}" />
          <polygon points="22,1 28,4 22,7" fill="${lineColor}" />
        </svg>
        <span style="color:${spanColor}">${cfg.label}</span>`;
      row.addEventListener("click", () => {
        if (kgHiddenEdgeTypes.has(type)) {
          kgHiddenEdgeTypes.delete(type);
          row.style.background = cfg.color + "12";
          row.style.borderColor = cfg.color + "33";
          row.querySelector("line").setAttribute("stroke", cfg.color);
          row.querySelector("polygon").setAttribute("fill", cfg.color);
          row.querySelector("span").style.color = cfg.color;
        } else {
          kgHiddenEdgeTypes.add(type);
          row.style.background = "transparent";
          row.style.borderColor = "#0f1e3c";
          row.querySelector("line").setAttribute("stroke", "#1e293b");
          row.querySelector("polygon").setAttribute("fill", "#1e293b");
          row.querySelector("span").style.color = "#334155";
        }
        renderGraph();
      });
      edgeToggles.appendChild(row);
    });
  }

  // Initial stats
  updateKgStats(kgGraph.nodes.length, kgGraph.edges.length);

  // Initial detail panel
  updateKgDetailPanel();

  // Build legend
  const legend = document.getElementById("kg-legend");
  if (legend) {
    legend.innerHTML = "";
    Object.entries(NODE_TYPES).forEach(([type, cfg]) => {
      const item = document.createElement("div");
      item.className = "kg-legend-item";
      const dot = document.createElement("div");
      dot.className = "kg-legend-dot";
      dot.style.background = cfg.color + "44";
      dot.style.borderColor = cfg.color;
      if (type === "RISK") dot.style.transform = "rotate(45deg)";
      if (type === "AUTHORITY") dot.style.borderRadius = "50%";
      const span = document.createElement("span");
      span.textContent = cfg.label;
      item.appendChild(dot);
      item.appendChild(span);
      legend.appendChild(item);
    });
  }
}

// ─── Stats update ───────────────────────────────────────────────────────────
function updateKgStats(visNodes, visEdges) {
  const el = (id, val) => {
    const e = document.getElementById(id);
    if (e) e.textContent = val;
  };
  el("kg-stat-nodes", kgGraph ? kgGraph.nodes.length : 0);
  el("kg-stat-edges", kgGraph ? kgGraph.edges.length : 0);
  el("kg-stat-visible", visNodes);
  el("kg-stat-active", visEdges);
}
