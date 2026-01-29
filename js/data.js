/* =========================================
   DATA LOADING & PROCESSING
   ========================================= */

// Domain groups (matches original Streamlit app)
export const DOMAIN_GROUPS = {
    "Intervenții, urgențe": ["Intervenție", "Căutare-salvare", "Dezastre chimice", "Răspuns"],
    "Educație, prevenire": ["Prevenire", "Pregătire", "Cercetare", "Prevenirea si combaterea dezinformării"],
    "Logistică, tehnologie": ["IT & C", "Sprijin logistic", "Restabilirea stării de normalitate", "Sprijin tehnic logistic"],
    "Social, medical": ["Servicii sociale", "Prevenire (trafic persoane)"]
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

// Map raw domain text to category
function mapDomainCategory(raw) {
    const t = raw.toLowerCase();
    if (t.includes("dezastre chimice")) return "Dezastre chimice";
    if (t.includes("smart city") || t.includes("it & c")) return "IT & C";
    if (t.includes("căutare") || t.includes("caini") || t.includes("câini")) return "Căutare-salvare";
    if (t.includes("restabilirea")) return "Restabilirea stării de normalitate";
    if (t.includes("sociale")) return "Servicii sociale";
    if (t.includes("logistic")) return "Sprijin logistic";
    if (t.includes("răspuns") || t.includes("traum") || t.includes("psiholog")) return "Răspuns";
    if (t.includes("trafic")) return "Prevenire (trafic persoane)";
    if (t.includes("prevenire")) return "Prevenire";
    if (t.includes("pregătire") || t.includes("practică") || t.includes("training")) return "Pregătire";
    if (t.includes("cercetare")) return "Cercetare";
    if (t.includes("intervenție")) return "Intervenție";
    return raw.trim();
}

// Parse CSV text into array of objects
function parseCSV(text) {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((h, idx) => {
            row[h.trim()] = values[idx]?.trim() || "";
        });
        rows.push(row);
    }
    return rows;
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
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

        // Process domains
        const domainParts = cleanDomains(row.Domain_Raw);
        domainParts.forEach(raw => {
            const cat = mapDomainCategory(raw);
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

// Load all statistics data
export async function loadStatsData() {
    const files = {
        interv: "data/interventii_ambulanta.csv",
        apeluri: "data/apeluri_urgenta.csv",
        timp: "data/timp_raspuns.csv",
        igsu: "data/situatii_igsu.csv",
        risc: "data/categorii_risc.csv",
        zbor: "data/ore_zbor.csv",
        upu: "data/prezentari_upu.csv",
        instruire: "data/instruire_persoane.csv",
        protocoale: "data/protocoale.csv",
        actiuni: "data/tipuri_actiuni.csv",
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
