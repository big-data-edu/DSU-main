/* =========================================
   DATA LOADING & PROCESSING
   ========================================= */

// Domain groups — domains are now standardized directly in data.csv,
// so these only define how the standardized tokens are grouped in the filter UI.
export const DOMAIN_GROUPS = {
    "Intervenții, urgențe": ["Intervenție", "Reconstrucție"],
    "Educație, prevenire": ["Prevenire", "Pregătire", "Cercetare"]
};

// Entity type definitions
export const ENTITY_TYPES = {
    "Universitate": { color: "#8b5cf6", keywords: ["universitatea", "academia", "facultatea", "politehnica"] },
    "ONG": { color: "#10b981", keywords: ["asociația", "fundația", "organizația", "federația", "asociatia", "fundatia"] },
    "Instituție de stat": { color: "#3b82f6", keywords: ["serviciul", "autoritatea", "institutul național", "compania națională"] },
    "Companie privată": { color: "#f59e0b", keywords: ["s.a.", "srl", "autonom", "omv", "e-distribuție", "transelectrica"] },
    "Media": { color: "#ec4899", keywords: ["televiziune", "radiodifuziune", "srtv"] },
    "Organizație profesională": { color: "#14b8a6", keywords: ["colegiul", "consiliul", "societatea română", "unsar", "amcham"] }
};

export const FONSS_PARENT_NAME = "Federația Organizațiilor Neguvernamentale pentru Servicii Sociale (FONSS)";

// Classify entity type from name
export function classifyEntityType(name) {
    const lower = name.toLowerCase();
    for (const [type, config] of Object.entries(ENTITY_TYPES)) {
        for (const kw of config.keywords) {
            if (lower.includes(kw)) return type;
        }
    }
    return "ONG";
}

// Get color for entity
export function getEntityColor(name) {
    const type = classifyEntityType(name);
    return ENTITY_TYPES[type]?.color || ENTITY_TYPES["ONG"].color;
}

// Clean domain string into list
function cleanDomains(domainStr) {
    if (!domainStr || domainStr === "-" || domainStr.trim() === "") return [];
    return domainStr.replace(/\n/g, "/").replace(/\|/g, "/").replace(/\\/g, "/")
        .split("/").map(s => s.trim()).filter(Boolean);
}

// Parse CSV text into array of objects.
// Full tokenizer that correctly handles quoted fields containing commas,
// escaped quotes ("") and embedded newlines (used in retea2 descriptions).
function parseCSV(text) {
    const rows = [];
    let field = "";
    let record = [];
    let inQuotes = false;

    const pushRecord = () => {
        record.push(field);
        field = "";
        // Skip blank trailing lines
        if (record.length > 1 || record[0] !== "") rows.push(record);
        record = [];
    };

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') { field += '"'; i++; }
                else inQuotes = false;
            } else {
                field += ch;
            }
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === ',') {
            record.push(field);
            field = "";
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            pushRecord();
        } else {
            field += ch;
        }
    }
    if (field !== "" || record.length > 0) pushRecord();

    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.trim());
    return rows.slice(1).map(values => {
        const row = {};
        headers.forEach((h, idx) => { row[h] = (values[idx] ?? "").trim(); });
        return row;
    });
}

// Fetch and parse a CSV file
async function fetchCSV(path) {
    try {
        const resp = await fetch(path);
        if (!resp.ok) return [];
        const text = await resp.text();
        // Remove BOM if present
        const clean = text.replace(/^\uFEFF/, "");
        return parseCSV(clean);
    } catch {
        return [];
    }
}

// Load main partner network data
export async function loadNetworkData() {
    const [partnerRows, fonssRows] = await Promise.all([
        fetchCSV("data.csv"),
        fetchCSV("membrii_fonss.csv")
    ]);

    const nodes = {};  // id -> node data
    const edges = [];  // { source, target }
    const allDomains = new Set();
    let fonssId = null;

    // Process partners
    partnerRows.forEach((row, idx) => {
        const id = `p_${idx}`;
        const label = row.Partner || "";
        const ukraine = ["da", "true", "x", "1", "yes"].includes((row.Ukraine || "").toLowerCase());
        const strategic = ["da", "true", "x", "1", "yes"].includes((row.Strategic || "").toLowerCase());
        const description = row.Description || "Descriere indisponibilă.";

        if (label === FONSS_PARENT_NAME) fonssId = id;

        nodes[id] = {
            id,
            label,
            type: "Partner",
            entityType: classifyEntityType(label),
            color: getEntityColor(label),
            ukraine,
            strategic,
            description,
            rawDomain: row.Domain_Raw || "",
            parentId: null,
            isFonssMember: false
        };

        // Process domains (already standardized in data.csv — used as-is)
        const domainParts = cleanDomains(row.Domain_Raw);
        domainParts.forEach(cat => {
            allDomains.add(cat);
            const dId = `d_${cat}`;
            if (!nodes[dId]) {
                nodes[dId] = {
                    id: dId,
                    label: cat,
                    type: "Domain",
                    color: "#dc2626"
                };
            }
            edges.push({ source: id, target: dId });
        });
    });

    // Process FONSS members
    if (fonssId && fonssRows.length > 0) {
        fonssRows.forEach((row, idx) => {
            const mId = `m_fonss_${idx}`;
            const label = row.Nume || "";
            const desc = row.Descriere || "Membru FONSS";
            nodes[mId] = {
                id: mId,
                label,
                type: "Partner",
                entityType: classifyEntityType(label),
                color: getEntityColor(label),
                ukraine: false,
                strategic: false,
                description: desc,
                rawDomain: "Servicii sociale",
                parentId: fonssId,
                isFonssMember: true
            };
        });
    }

    return {
        nodes,
        edges,
        allDomains: [...allDomains].sort(),
        fonssId
    };
}

// ==========================================
// NETWORK 2 — bipartite ONG <-> ISU (operational collaborations)
// ==========================================

// Actor type ontology (branch 4) -> Romanian label + node color
export const ACTOR_TYPES = {
    "community_orgs":    { label: "Asociație locală",            color: "#3b82f6" },
    "humanitarian_ngos": { label: "ONG umanitar",               color: "#10b981" },
    "faith_based":       { label: "Organizație religioasă",     color: "#8b5cf6" },
    "private_sector":    { label: "Sector privat",              color: "#f59e0b" },
    "volunteer_groups":  { label: "Grup de voluntari",          color: "#ef4444" },
    "professional_assoc":{ label: "Asociație profesională",     color: "#14b8a6" },
    "international":      { label: "Organizație internațională", color: "#ec4899" },
    "diaspora_support":  { label: "Sprijin diasporă",           color: "#a3e635" },
    "academia":          { label: "Mediu academic",             color: "#f97316" }
};

export function getActorColor(tip) {
    return ACTOR_TYPES[tip]?.color || "#94a3b8";
}
export function getActorLabel(tip) {
    return ACTOR_TYPES[tip]?.label || tip || "Altele";
}

// Context (criza) -> Romanian label + color (used for the legend/filter)
export const NET2_CONTEXTS = {
    "Aflux refugiați": { label: "Aflux refugiați", color: "#3b82f6" },
    "Pandemie":        { label: "Pandemie",        color: "#f59e0b" },
    "Ambele":          { label: "Ambele",          color: "#a855f7" }
};

// Full county names for the 34 ISU hub codes (BIF = București-Ilfov)
export const ISU_CODE_TO_NAME = {
    "AB": "Alba", "AR": "Arad", "BC": "Bacău", "BH": "Bihor", "BIF": "București-Ilfov",
    "BN": "Bistrița-Năsăud", "BR": "Brăila", "BT": "Botoșani", "BV": "Brașov", "CJ": "Cluj",
    "CL": "Călărași", "CS": "Caraș-Severin", "CT": "Constanța", "CV": "Covasna", "DB": "Dâmbovița",
    "DJ": "Dolj", "GL": "Galați", "HD": "Hunedoara", "IL": "Ialomița", "IS": "Iași",
    "MH": "Mehedinți", "MM": "Maramureș", "MS": "Mureș", "NT": "Neamț", "OT": "Olt",
    "SB": "Sibiu", "SJ": "Sălaj", "SM": "Satu Mare", "SV": "Suceava", "TL": "Tulcea",
    "TM": "Timiș", "VL": "Vâlcea", "VN": "Vrancea", "VS": "Vaslui"
};

// Load network 2 data (ONG <-> ISU bipartite graph)
export async function loadNetwork2Data() {
    const ongRows = await fetchCSV("data_retea2_isu.csv");

    const nodes = {};          // id -> node
    const edges = [];          // { source, target }
    const isuIds = {};         // code -> node id
    const allActorTypes = new Set();
    const allContexts = new Set();
    let totalColaborari = 0;

    ongRows.forEach((row, idx) => {
        const label = (row.ONG || "").trim();
        if (!label) return;

        const tipActor = (row.Tip_actor || "").trim();
        const context = (row.Context || "").trim();
        const nrColaborari = parseInt(row.Nr_colaborari) || 1;
        const nrISU = parseInt(row.Nr_ISU) || 0;

        allActorTypes.add(tipActor);
        if (context) allContexts.add(context);
        totalColaborari += nrColaborari;

        const ongId = `o_${idx}`;
        nodes[ongId] = {
            id: ongId,
            label,
            type: "ONG",
            tipActor,
            context,
            nrColaborari,
            nrISU,
            color: getActorColor(tipActor),
            description: (row.Descriere || "").trim() || "Descriere indisponibilă."
        };

        // Split ISU codes -> hub nodes + edges
        const codes = (row.ISU || "").split("/").map(c => c.trim()).filter(Boolean);
        codes.forEach(code => {
            let isuId = isuIds[code];
            if (!isuId) {
                isuId = `i_${code}`;
                isuIds[code] = isuId;
                nodes[isuId] = {
                    id: isuId,
                    label: code,
                    fullName: ISU_CODE_TO_NAME[code] || code,
                    type: "ISU",
                    color: "#dc2626"
                };
            }
            edges.push({ source: ongId, target: isuId });
        });
    });

    return {
        nodes,
        edges,
        allActorTypes: [...allActorTypes].filter(Boolean),
        allContexts: [...allContexts],
        stats: {
            ongCount: Object.values(nodes).filter(n => n.type === "ONG").length,
            isuCount: Object.keys(isuIds).length,
            colaborari: totalColaborari,
            conexiuni: edges.length
        }
    };
}

// Load all statistics data (only the files actually rendered in statistics.js)
export async function loadStatsData() {
    const files = {
        interv: "data/interventii_ambulanta.csv",
        apeluri: "data/apeluri_urgenta.csv",
        timp: "data/timp_raspuns.csv",
        igsu: "data/situatii_igsu.csv",
        zbor: "data/ore_zbor.csv",
        upu: "data/prezentari_upu.csv",
        instruire: "data/instruire_persoane.csv",
        protocoale: "data/protocoale.csv",
        expertiza: "data/arii_expertiza.csv",
        flux: "data/flux_interventie.csv",
        timpi: "data/detaliere_timpi.csv",
        sanctiuni: "data/sanctiuni.csv",
        comanda: "data/lant_comanda.csv",
        timeline: "data/timeline_dsu.csv"
    };

    const entries = Object.entries(files);
    const results = await Promise.all(entries.map(([, path]) => fetchCSV(path)));

    const data = {};
    entries.forEach(([key], i) => {
        data[key] = results[i].length > 0 ? results[i] : null;
    });

    return data;
}

// County code mapping for choropleth
export const ISU_TO_JUDET = {
    "AB": "Alba", "AR": "Arad", "AG": "Arges", "BC": "Bacau", "BH": "Bihor",
    "BN": "Bistrita-Nasaud", "BT": "Botosani", "BV": "Brasov", "BR": "Braila", "BZ": "Buzau",
    "CS": "Caras-Severin", "CL": "Calarasi", "CJ": "Cluj", "CT": "Constanta", "CV": "Covasna",
    "DB": "Dambovita", "DJ": "Dolj", "GL": "Galati", "GR": "Giurgiu", "GJ": "Gorj",
    "HR": "Harghita", "HD": "Hunedoara", "IL": "Ialomita", "IS": "Iasi", "IF": "Ilfov",
    "MM": "Maramures", "MH": "Mehedinti", "MS": "Mures", "NT": "Neamt", "OT": "Olt",
    "PH": "Prahova", "SM": "Satu Mare", "SJ": "Salaj", "SB": "Sibiu", "SV": "Suceava",
    "TR": "Teleorman", "TM": "Timis", "TL": "Tulcea", "VS": "Vaslui", "VL": "Valcea",
    "VN": "Vrancea", "B": "Bucuresti", "BIF": "Bucuresti"
};
