import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Raw data (subset representative + full unique entities) ───────────────
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
  CAPABILITY: {
    label: "Capabilitate",
    color: "#f59e0b",
    glow: "#f59e0b88",
    shape: "hexagon",
    size: 28,
    icon: "⬡"
  },
  AUTHORITY: {
    label: "Autoritate",
    color: "#38bdf8",
    glow: "#38bdf888",
    shape: "circle",
    size: 22,
    icon: "◉"
  },
  RISK: {
    label: "Tip Risc",
    color: "#f87171",
    glow: "#f8717188",
    shape: "diamond",
    size: 20,
    icon: "◈"
  },
  PHASE: {
    label: "Fază Ciclu",
    color: "#34d399",
    glow: "#34d39988",
    shape: "rect",
    size: 18,
    icon: "▣"
  }
};

// ─── Edge type configs ──────────────────────────────────────────────────────
const EDGE_TYPES = {
  CONDUCE: { label: "CONDUCE (Principal)", color: "#f97316", dash: "none", width: 2.5 },
  SPRIJINA: { label: "SPRIJINIT DE (Suport)", color: "#8b5cf6", dash: "6,3", width: 1.5 },
  SECUNDAR: { label: "SECUNDAR", color: "#3b82f6", dash: "3,3", width: 1.5 },
  ACOPERA: { label: "ACOPERĂ RISCUL", color: "#f87171", dash: "none", width: 1.2 },
  IN_FAZA: { label: "ÎN FAZA", color: "#34d399", dash: "2,4", width: 1 },
};

const RISK_ICONS = {
  "Cutremure de pământ": "🌍",
  "Alunecări de teren": "⛰️",
  "Prăbușiri construcții": "🏚️",
  "Incendii de construcții": "🔥",
  "Accidente industriale": "🏭",
  "Accidente nucleare/radiologice": "☢️",
  "Accidente industriale (CBRN)": "⚗️",
  "Transport materiale periculoase": "🚛",
  "Avalanșe": "🏔️",
  "Accidente transport": "🚗",
  "Temperaturi extreme": "🌡️",
};

// ─── Build graph ────────────────────────────────────────────────────────────
function buildGraph() {
  const nodesMap = new Map();
  const edges = [];
  const edgeSet = new Set();

  const addNode = (id, type, label) => {
    if (!nodesMap.has(id)) {
      nodesMap.set(id, {
        id, type, label,
        x: Math.random() * 800 + 100,
        y: Math.random() * 600 + 100,
        vx: 0, vy: 0, fx: null, fy: null
      });
    }
  };

  const addEdge = (src, tgt, type, label = "") => {
    const key = `${src}→${tgt}→${type}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ id: key, source: src, target: tgt, type, label });
    }
  };

  RAW.forEach(([cap, auth, rol, risk, phase]) => {
    addNode(`cap:${cap}`, "CAPABILITY", cap);
    addNode(`auth:${auth}`, "AUTHORITY", auth);
    addNode(`risk:${risk}`, "RISK", (RISK_ICONS[risk] || "⚠️") + " " + risk);
    addNode(`phase:${phase}`, "PHASE", phase);

    // Authority → Capability edges by role
    const roleEdge = rol === "P" ? "CONDUCE" : rol === "S" ? "SECUNDAR" : "SPRIJINA";
    addEdge(`auth:${auth}`, `cap:${cap}`, roleEdge, rol);

    // Capability → Risk
    addEdge(`cap:${cap}`, `risk:${risk}`, "ACOPERA");

    // Capability → Phase
    addEdge(`cap:${cap}`, `phase:${phase}`, "IN_FAZA");
  });

  return { nodes: [...nodesMap.values()], edges };
}

// ─── Force simulation (hand-rolled) ────────────────────────────────────────
function useForce(nodes, edges, width, height) {
  const simRef = useRef({ nodes: [], edges: [], running: false });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!nodes.length) return;
    simRef.current.nodes = nodes.map(n => ({ ...n }));
    simRef.current.edges = edges;
    simRef.current.running = true;

    let frame;
    let alpha = 1;

    const simulate = () => {
      if (!simRef.current.running || alpha < 0.005) {
        simRef.current.running = false;
        return;
      }
      const ns = simRef.current.nodes;
      const es = simRef.current.edges;
      const nodeById = new Map(ns.map(n => [n.id, n]));

      // Repulsion
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const a = ns[i], b = ns[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const strength = (3000 / (dist * dist)) * alpha;
          const fx = (dx / dist) * strength;
          const fy = (dy / dist) * strength;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }

      // Attraction (spring)
      es.forEach(e => {
        const a = nodeById.get(e.source), b = nodeById.get(e.target);
        if (!a || !b) return;
        let dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetLen = 160;
        const str = (dist - targetLen) * 0.035 * alpha;
        a.vx += (dx / dist) * str; a.vy += (dy / dist) * str;
        b.vx -= (dx / dist) * str; b.vy -= (dy / dist) * str;
      });

      // Center pull
      ns.forEach(n => {
        n.vx += ((width / 2) - n.x) * 0.002 * alpha;
        n.vy += ((height / 2) - n.y) * 0.002 * alpha;
      });

      // Integrate
      ns.forEach(n => {
        if (n.fx !== null) { n.x = n.fx; n.vx = 0; }
        if (n.fy !== null) { n.y = n.fy; n.vy = 0; }
        n.vx *= 0.75; n.vy *= 0.75;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(60, Math.min(width - 60, n.x));
        n.y = Math.max(60, Math.min(height - 60, n.y));
      });

      alpha *= 0.98;
      setTick(t => t + 1);
      frame = requestAnimationFrame(simulate);
    };

    frame = requestAnimationFrame(simulate);
    return () => { cancelAnimationFrame(frame); simRef.current.running = false; };
  }, [nodes.length, width, height]);

  return simRef.current.nodes;
}

// ─── Arrow marker defs ──────────────────────────────────────────────────────
function Markers() {
  return (
    <defs>
      {Object.entries(EDGE_TYPES).map(([type, cfg]) => (
        <marker key={type} id={`arrow-${type}`} markerWidth="10" markerHeight="7"
          refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={cfg.color} opacity="0.85" />
        </marker>
      ))}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}

// ─── Node shapes ────────────────────────────────────────────────────────────
function NodeShape({ type, size, color, glow, selected, hovered }) {
  const s = size;
  const brightness = selected ? 1.3 : hovered ? 1.15 : 1;
  const c = color;
  const glowFilter = selected ? "url(#glow-strong)" : hovered ? "url(#glow)" : "none";

  if (type === "CAPABILITY") {
    // Hexagon
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${s * Math.cos(a)},${s * Math.sin(a)}`;
    }).join(" ");
    return (
      <g filter={glowFilter}>
        <polygon points={pts} fill={`${c}22`} stroke={c} strokeWidth={selected ? 2.5 : 1.5} />
        <polygon points={pts} fill="none" stroke={`${c}55`} strokeWidth={6} />
      </g>
    );
  }
  if (type === "RISK") {
    const d = s * 1.2;
    return (
      <g filter={glowFilter}>
        <polygon points={`0,${-d} ${d},0 0,${d} ${-d},0`}
          fill={`${c}22`} stroke={c} strokeWidth={selected ? 2.5 : 1.5} />
      </g>
    );
  }
  if (type === "PHASE") {
    const r = s * 0.85;
    return (
      <g filter={glowFilter}>
        <rect x={-r} y={-r * 0.7} width={r * 2} height={r * 1.4} rx="5"
          fill={`${c}22`} stroke={c} strokeWidth={selected ? 2.5 : 1.5} />
      </g>
    );
  }
  // AUTHORITY → circle
  return (
    <g filter={glowFilter}>
      <circle r={s} fill={`${c}22`} stroke={c} strokeWidth={selected ? 2.5 : 1.5} />
    </g>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function DirectedKnowledgeGraph() {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 1200, h: 700 });
  const [graph] = useState(() => buildGraph());
  const [positions, setPositions] = useState(() =>
    graph.nodes.map(n => ({ ...n }))
  );
  const simRef = useRef({ nodes: [], running: false, alpha: 1 });
  const rafRef = useRef(null);

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hiddenEdgeTypes, setHiddenEdgeTypes] = useState(new Set());
  const [hiddenNodeTypes, setHiddenNodeTypes] = useState(new Set());
  const [dragging, setDragging] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.85);
  const [panStart, setPanStart] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  // Init simulation
  useEffect(() => {
    const w = dims.w, h = dims.h;
    simRef.current.nodes = graph.nodes.map((n, i) => ({
      ...n,
      x: w / 2 + Math.cos((i / graph.nodes.length) * Math.PI * 2) * 280 + (Math.random() - 0.5) * 100,
      y: h / 2 + Math.sin((i / graph.nodes.length) * Math.PI * 2) * 220 + (Math.random() - 0.5) * 100,
      vx: 0, vy: 0, fx: null, fy: null
    }));
    simRef.current.alpha = 1;
    simRef.current.running = true;
    runSim();
    return () => { simRef.current.running = false; cancelAnimationFrame(rafRef.current); };
  }, [graph, dims]);

  const runSim = useCallback(() => {
    const sim = simRef.current;
    if (!sim.running || sim.alpha < 0.003) { sim.running = false; return; }
    const ns = sim.nodes;
    const es = graph.edges;
    const nodeById = new Map(ns.map(n => [n.id, n]));
    const w = dims.w, h = dims.h;

    // Repulsion
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const a = ns[i], b = ns[j];
        let dx = b.x - a.x || 0.01, dy = b.y - a.y || 0.01;
        const dist2 = dx * dx + dy * dy;
        const dist = Math.sqrt(dist2) || 0.1;
        const str = (4500 / dist2) * sim.alpha;
        a.vx -= (dx / dist) * str; a.vy -= (dy / dist) * str;
        b.vx += (dx / dist) * str; b.vy += (dy / dist) * str;
      }
    }
    // Springs
    es.forEach(e => {
      const a = nodeById.get(e.source), b = nodeById.get(e.target);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const tgt = 170;
      const str = (dist - tgt) * 0.04 * sim.alpha;
      a.vx += (dx / dist) * str; a.vy += (dy / dist) * str;
      b.vx -= (dx / dist) * str; b.vy -= (dy / dist) * str;
    });
    // Center
    ns.forEach(n => {
      n.vx += (w / 2 - n.x) * 0.002 * sim.alpha;
      n.vy += (h / 2 - n.y) * 0.002 * sim.alpha;
    });
    // Integrate
    ns.forEach(n => {
      if (n.fx !== null) { n.x = n.fx; n.vx = 0; }
      if (n.fy !== null) { n.y = n.fy; n.vy = 0; }
      n.vx *= 0.72; n.vy *= 0.72;
      n.x += n.vx; n.y += n.vy;
      n.x = Math.max(50, Math.min(w - 50, n.x));
      n.y = Math.max(50, Math.min(h - 50, n.y));
    });
    sim.alpha *= 0.975;
    setPositions([...ns]);
    rafRef.current = requestAnimationFrame(runSim);
  }, [graph, dims]);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const e = entries[0];
      setDims({ w: e.contentRect.width, h: Math.max(600, e.contentRect.height) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const posMap = useMemo(() => new Map(positions.map(n => [n.id, n])), [positions]);

  // Connected edge/node detection
  const connectedIds = useMemo(() => {
    if (!selectedNode) return null;
    const nodeIds = new Set([selectedNode]);
    const edgeIds = new Set();
    graph.edges.forEach(e => {
      if (e.source === selectedNode || e.target === selectedNode) {
        nodeIds.add(e.source);
        nodeIds.add(e.target);
        edgeIds.add(e.id);
      }
    });
    return { nodeIds, edgeIds };
  }, [selectedNode, graph.edges]);

  // Drag handlers
  const onNodeMouseDown = useCallback((e, id) => {
    e.stopPropagation();
    setDragging(id);
    setSelectedNode(prev => prev === id ? null : id);
    const node = simRef.current.nodes.find(n => n.id === id);
    if (node) { node.fx = node.x; node.fy = node.y; }
    if (!simRef.current.running) {
      simRef.current.running = true;
      simRef.current.alpha = 0.3;
      runSim();
    }
  }, [runSim]);

  const onSvgMouseMove = useCallback((e) => {
    if (dragging) {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left - pan.x) / zoom;
      const my = (e.clientY - rect.top - pan.y) / zoom;
      const node = simRef.current.nodes.find(n => n.id === dragging);
      if (node) { node.fx = mx; node.fy = my; node.x = mx; node.y = my; }
      setPositions(prev => prev.map(n => n.id === dragging ? { ...n, x: mx, y: my } : n));
    } else if (panStart) {
      setPan({ x: panStart.px + e.clientX - panStart.mx, y: panStart.py + e.clientY - panStart.my });
    }
  }, [dragging, panStart, pan, zoom]);

  const onSvgMouseUp = useCallback(() => {
    if (dragging) {
      const node = simRef.current.nodes.find(n => n.id === dragging);
      if (node) { node.fx = null; node.fy = null; }
    }
    setDragging(null);
    setPanStart(null);
  }, [dragging]);

  const onSvgMouseDown = useCallback((e) => {
    if (e.target.tagName === "svg" || e.target.tagName === "rect") {
      setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y });
      setSelectedNode(null);
    }
  }, [pan]);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(2.5, z * (e.deltaY < 0 ? 1.1 : 0.9))));
  }, []);

  const visibleEdges = useMemo(() =>
    graph.edges.filter(e => !hiddenEdgeTypes.has(e.type) &&
      !hiddenNodeTypes.has(graph.nodes.find(n => n.id === e.source)?.type) &&
      !hiddenNodeTypes.has(graph.nodes.find(n => n.id === e.target)?.type)
    ), [graph, hiddenEdgeTypes, hiddenNodeTypes]);

  const visibleNodes = useMemo(() =>
    positions.filter(n => !hiddenNodeTypes.has(n.type)), [positions, hiddenNodeTypes]);

  const selectedInfo = selectedNode ? graph.nodes.find(n => n.id === selectedNode) : null;
  const relatedEdges = selectedNode ? graph.edges.filter(e => e.source === selectedNode || e.target === selectedNode) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#060b14", fontFamily: "'Rajdhani', 'Trebuchet MS', sans-serif", color: "#e2e8f0", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ background: "linear-gradient(90deg, #0c1322 0%, #0f1e3c 50%, #0c1322 100%)", borderBottom: "1px solid #1e3a5f", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#475569", textTransform: "uppercase" }}>SNMSU · UCPM</div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "1px" }}>
            ⟶ Graf Direcțional de Cunoaștere
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "10px", color: "#475569", marginRight: "4px" }}>NODURI:</span>
          {Object.entries(NODE_TYPES).map(([type, cfg]) => (
            <button key={type} onClick={() => setHiddenNodeTypes(s => { const n = new Set(s); n.has(type) ? n.delete(type) : n.add(type); return n; })}
              style={{ padding: "4px 10px", borderRadius: "4px", border: `1px solid ${hiddenNodeTypes.has(type) ? "#1e293b" : cfg.color + "88"}`, background: hiddenNodeTypes.has(type) ? "#0c1322" : cfg.color + "18", color: hiddenNodeTypes.has(type) ? "#334155" : cfg.color, fontSize: "10px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", fontWeight: "600" }}>
              {cfg.icon} {cfg.label}
            </button>
          ))}
          <div style={{ width: "1px", height: "24px", background: "#1e293b", margin: "0 4px" }} />
          <button onClick={() => { simRef.current.alpha = 1; simRef.current.running = true; runSim(); }}
            style={{ padding: "4px 12px", borderRadius: "4px", border: "1px solid #f59e0b44", background: "#f59e0b18", color: "#f59e0b", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}>
            ↺ Reinițializează
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden", cursor: dragging ? "grabbing" : panStart ? "grabbing" : "grab" }}>
          <svg width="100%" height="100%"
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseLeave={onSvgMouseUp}
            onMouseDown={onSvgMouseDown}
            onWheel={onWheel}
            style={{ display: "block" }}>
            <Markers />

            {/* Background grid */}
            <g opacity="0.06">
              {Array.from({ length: 30 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 40} x2={dims.w} y2={i * 40} stroke="#38bdf8" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 40 }, (_, i) => (
                <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2={dims.h} stroke="#38bdf8" strokeWidth="0.5" />
              ))}
            </g>

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {visibleEdges.map(e => {
                const src = posMap.get(e.source), tgt = posMap.get(e.target);
                if (!src || !tgt) return null;
                const cfg = EDGE_TYPES[e.type];
                const isHighlighted = connectedIds?.edgeIds.has(e.id);
                const isDimmed = connectedIds && !isHighlighted;

                const dx = tgt.x - src.x, dy = tgt.y - src.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const srcSize = NODE_TYPES[src.type]?.size || 20;
                const tgtSize = NODE_TYPES[tgt.type]?.size || 20;
                const x1 = src.x + (dx / len) * (srcSize + 4);
                const y1 = src.y + (dy / len) * (srcSize + 4);
                const x2 = tgt.x - (dx / len) * (tgtSize + 12);
                const y2 = tgt.y - (dy / len) * (tgtSize + 12);

                // Slight curve
                const cx = (x1 + x2) / 2 - (dy / len) * 20;
                const cy = (y1 + y2) / 2 + (dx / len) * 20;

                return (
                  <g key={e.id} opacity={isDimmed ? 0.08 : isHighlighted ? 1 : 0.45}>
                    <path d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`}
                      fill="none"
                      stroke={cfg.color}
                      strokeWidth={isHighlighted ? cfg.width * 2 : cfg.width}
                      strokeDasharray={cfg.dash}
                      markerEnd={`url(#arrow-${e.type})`}
                      filter={isHighlighted ? "url(#glow)" : "none"}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {visibleNodes.map(n => {
                const cfg = NODE_TYPES[n.type];
                const isSelected = selectedNode === n.id;
                const isHovered = hoveredNode === n.id;
                const isDimmed = connectedIds && !connectedIds.nodeIds.has(n.id);
                const shortLabel = n.label.length > 22 ? n.label.slice(0, 22) + "…" : n.label;

                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y})`}
                    style={{ cursor: "pointer" }}
                    opacity={isDimmed ? 0.12 : 1}
                    onMouseDown={ev => onNodeMouseDown(ev, n.id)}
                    onMouseEnter={() => setHoveredNode(n.id)}
                    onMouseLeave={() => setHoveredNode(null)}>
                    {/* Glow ring when selected */}
                    {isSelected && (
                      <circle r={cfg.size + 12} fill="none" stroke={cfg.color} strokeWidth="1" opacity="0.4" strokeDasharray="4,4">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <NodeShape type={n.type} size={cfg.size} color={cfg.color} glow={cfg.glow} selected={isSelected} hovered={isHovered} />
                    {/* Label */}
                    <text y={cfg.size + 14} textAnchor="middle" fontSize="9" fill={isSelected || isHovered ? cfg.color : "#94a3b8"}
                      style={{ pointerEvents: "none", userSelect: "none", fontFamily: "'Rajdhani','Trebuchet MS',sans-serif", fontWeight: isSelected ? "700" : "500", letterSpacing: "0.3px" }}>
                      {shortLabel}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Zoom hint */}
          <div style={{ position: "absolute", bottom: "12px", right: "12px", fontSize: "10px", color: "#334155", letterSpacing: "0.5px" }}>
            Scroll = zoom · Drag nod = mutare · Click = selecție · Drag fundal = pan
          </div>

          {/* Zoom level */}
          <div style={{ position: "absolute", bottom: "12px", left: "12px", fontSize: "11px", color: "#475569", fontFamily: "monospace" }}>
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: "280px", background: "#080d18", borderLeft: "1px solid #0f1e3c", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          {/* Edge type toggles */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #0f1e3c" }}>
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#334155", textTransform: "uppercase", marginBottom: "8px" }}>Tipuri relații</div>
            {Object.entries(EDGE_TYPES).map(([type, cfg]) => (
              <div key={type} onClick={() => setHiddenEdgeTypes(s => { const n = new Set(s); n.has(type) ? n.delete(type) : n.add(type); return n; })}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px", marginBottom: "3px", borderRadius: "5px", background: hiddenEdgeTypes.has(type) ? "transparent" : cfg.color + "12", border: `1px solid ${hiddenEdgeTypes.has(type) ? "#0f1e3c" : cfg.color + "33"}`, cursor: "pointer", transition: "all 0.2s" }}>
                <svg width="28" height="8">
                  <line x1="0" y1="4" x2="22" y2="4" stroke={hiddenEdgeTypes.has(type) ? "#1e293b" : cfg.color}
                    strokeWidth={cfg.width} strokeDasharray={cfg.dash} />
                  <polygon points="22,1 28,4 22,7" fill={hiddenEdgeTypes.has(type) ? "#1e293b" : cfg.color} />
                </svg>
                <span style={{ fontSize: "10px", color: hiddenEdgeTypes.has(type) ? "#334155" : cfg.color, flex: 1 }}>{cfg.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #0f1e3c" }}>
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#334155", textTransform: "uppercase", marginBottom: "8px" }}>Statistici graf</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                { l: "Noduri", v: graph.nodes.length, c: "#38bdf8" },
                { l: "Relații", v: graph.edges.length, c: "#f59e0b" },
                { l: "Vizibile", v: visibleNodes.length, c: "#34d399" },
                { l: "Rel. active", v: visibleEdges.length, c: "#f87171" },
              ].map(s => (
                <div key={s.l} style={{ background: "#0c1322", borderRadius: "6px", padding: "8px", border: `1px solid ${s.c}22` }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: "9px", color: "#334155", textTransform: "uppercase", letterSpacing: "1px" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Node detail */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
            {selectedInfo ? (
              <>
                <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#334155", textTransform: "uppercase", marginBottom: "10px" }}>
                  Nod selectat
                </div>
                <div style={{ background: NODE_TYPES[selectedInfo.type].color + "12", border: `1px solid ${NODE_TYPES[selectedInfo.type].color}44`, borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "9px", color: NODE_TYPES[selectedInfo.type].color, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                    {NODE_TYPES[selectedInfo.type].icon} {NODE_TYPES[selectedInfo.type].label}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#f1f5f9", lineHeight: "1.3" }}>
                    {selectedInfo.label}
                  </div>
                </div>

                <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                  Relații ({relatedEdges.length})
                </div>
                {relatedEdges.slice(0, 20).map((e, i) => {
                  const other = graph.nodes.find(n => n.id === (e.source === selectedInfo.id ? e.target : e.source));
                  const dir = e.source === selectedInfo.id ? "→" : "←";
                  const cfg = EDGE_TYPES[e.type];
                  return (
                    <div key={i} onClick={() => setSelectedNode(other?.id || null)}
                      style={{ display: "flex", alignItems: "flex-start", gap: "6px", padding: "6px 8px", marginBottom: "3px", background: "#0c1322", borderRadius: "5px", border: "1px solid #0f1e3c", cursor: "pointer", fontSize: "10px" }}>
                      <span style={{ color: cfg.color, fontWeight: "700", marginTop: "1px" }}>{dir}</span>
                      <div>
                        <div style={{ color: cfg.color, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{cfg.label}</div>
                        <div style={{ color: "#94a3b8", marginTop: "1px" }}>{other?.label || "?"}</div>
                      </div>
                    </div>
                  );
                })}
                {relatedEdges.length > 20 && <div style={{ fontSize: "10px", color: "#334155", textAlign: "center", padding: "4px" }}>+ {relatedEdges.length - 20} mai multe</div>}
              </>
            ) : (
              <div style={{ color: "#1e3a5f", fontSize: "11px", textAlign: "center", marginTop: "40px", lineHeight: "1.8" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>⬡</div>
                Click pe un nod<br />pentru detalii și relații
              </div>
            )}
          </div>

          {/* Legend bottom */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid #0f1e3c" }}>
            {Object.entries(NODE_TYPES).map(([type, cfg]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: type === "AUTHORITY" ? "50%" : type === "RISK" ? "2px" : "2px", background: cfg.color + "44", border: `1px solid ${cfg.color}`, transform: type === "RISK" ? "rotate(45deg)" : "none" }} />
                <span style={{ fontSize: "10px", color: "#475569" }}>{cfg.icon} {cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
