import streamlit as st
import pandas as pd
import os
import math
import random
import base64
import plotly.express as px
import plotly.graph_objects as go
from streamlit_agraph import agraph, Node, Edge, Config

def get_base64_image(image_path):
    """Convert image to base64 string for embedding in HTML."""
    try:
        with open(image_path, "rb") as f:
            data = f.read()
        return base64.b64encode(data).decode()
    except:
        return None

# ---------------------------------
# 0. CONFIGURARE PAGINĂ
# ---------------------------------

st.set_page_config(
    layout="wide",
    page_title="Ecosistem DSU",
    initial_sidebar_state="collapsed"
)

# ---------------------------------
# 1. MODERN CSS STYLING
# ---------------------------------

st.markdown(
    """
    <style>
    /* GLOBAL RESET */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    .stApp {
        background: linear-gradient(135deg, #0a0e1a 0%, #1a0f0f 100%);
        font-family: 'Inter', sans-serif;
    }
    
    .block-container {
        padding-top: 0rem !important;
        padding-bottom: 2rem !important;
        max-width: 95% !important;
        padding-left: 2rem !important;
        padding-right: 2rem !important;
        margin-top: -30px !important; /* Pulls content up into the empty header space */
    }
    
    /* REMOVE the ".main .block-container" rule that was here previously */
    
    header[data-testid="stHeader"] { 
        display: none !important;
    }
    
    div[data-testid="stToolbar"] {
        display: none !important;
    }
    
    #MainMenu { visibility: hidden; }
    footer { visibility: hidden; }
    
    /* Remove ghost spacing */
    .main .block-container {
        padding-top: 1rem !important;
    }
    
    section[data-testid="stSidebar"] {
        display: none !important;
    }
    
    /* STICKY HEADER */
    .sticky-header-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999999;
        background: linear-gradient(135deg, #0a0e1a 0%, #1a0f0f 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        padding: 10px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .sticky-header-spacer {
        height: 65px;
        margin-bottom: 10px;
    }

    .header-logo {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .header-logo-box {
        width: 45px;
        height: 45px;
        background: rgba(220, 38, 38, 0.2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #dc2626;
        font-weight: bold;
        font-size: 0.9rem;
    }

    .header-title {
        color: #ffffff;
        font-size: 1.1rem;
        font-weight: 700;
    }

    .header-nav {
        display: flex;
        gap: 8px;
    }

    .header-nav-btn {
        background: transparent;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 8px 20px;
        color: #94a3b8;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
    }

    .header-nav-btn:hover {
        background: rgba(220, 38, 38, 0.1);
        border-color: rgba(220, 38, 38, 0.5);
    }

    .header-nav-btn.active {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        border-color: transparent;
        color: #ffffff;
    }

    .header-logos {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .header-logo-placeholder {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
    }

    /* Radio buttons - position in sticky header */
    .stRadio {
        position: fixed !important;
        top: 12px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 9999999 !important;
    }

    div[role="radiogroup"] {
        flex-direction: row;
        gap: 8px;
        justify-content: center;
        background: transparent;
    }

    div[role="radiogroup"] label {
        background: transparent !important;
        border: 2px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 10px !important;
        padding: 8px 20px !important;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    div[role="radiogroup"] label:hover {
        background: rgba(220, 38, 38, 0.1) !important;
        border-color: rgba(220, 38, 38, 0.5) !important;
    }

    div[role="radiogroup"] label p {
        font-size: 0.9rem !important;
        font-weight: 600 !important;
        color: #94a3b8 !important;
        margin: 0 !important;
    }

    div[role="radiogroup"] label > div:first-child {
        display: none !important;
    }

    div[data-baseweb="radio"] div[aria-checked="true"] + div {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
        border-color: transparent !important;
    }

    div[data-baseweb="radio"] div[aria-checked="true"] + div p {
        color: #ffffff !important;
        font-weight: 700 !important;
    }

    /* Remove all bottom borders and padding from graph container */
    iframe {
        border: none !important;
    }

    /* Fix empty space under graph */
    .element-container:has(iframe) {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
    }

    div[data-testid="stVerticalBlock"] > div:has(iframe) {
        margin-bottom: 0 !important;
    }

    /* Graph container zoom animation */
    @keyframes zoomIn {
        from {
            transform: scale(0.85);
            opacity: 0.5;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .stApp iframe {
        animation: zoomIn 0.8s ease-out forwards;
    }

    /* Graph iframe - fill available space */
    iframe {
        height: calc(100vh - 100px) !important;
        min-height: 600px !important;
    }
    
    /* CARDS */
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    }
    
    .glass-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 48px rgba(220, 38, 38, 0.2);
        border-color: rgba(220, 38, 38, 0.3);
    }
    
    .partner-card {
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(153, 27, 27, 0.1) 100%);
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: 20px;
        padding: 28px;
        margin-bottom: 24px;
        box-shadow: 0 8px 32px rgba(220, 38, 38, 0.15);
    }
    
    .partner-title {
        font-size: 1.75rem;
        font-weight: 700;
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid rgba(220, 38, 38, 0.2);
    }
    
    .partner-desc {
        font-size: 1.05rem;
        color: #cbd5e1;
        line-height: 1.7;
        margin-bottom: 20px;
    }
    
    /* INFO BOXES */
    .info-box {
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(153, 27, 27, 0.1) 100%);
        border-left: 4px solid #dc2626;
        padding: 20px;
        margin-bottom: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(220, 38, 38, 0.1);
    }
    
    .info-title {
        font-weight: 700;
        color: #f87171;
        font-size: 1.1rem;
        margin-bottom: 8px;
    }
    
    .info-text {
        color: #cbd5e1;
        font-size: 0.95rem;
        line-height: 1.6;
    }
    
    /* METRICS */
    div[data-testid="stMetric"] {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    }
    
    div[data-testid="stMetric"]:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(220, 38, 38, 0.2);
        border-color: rgba(220, 38, 38, 0.4);
    }
    
    div[data-testid="stMetricLabel"] {
        color: #94a3b8;
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    div[data-testid="stMetricValue"] {
        color: #ffffff;
        font-size: 2.25rem;
        font-weight: 700;
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    /* BADGES */
    .badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-right: 8px;
        margin-bottom: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
    }
    
    .badge:hover {
        transform: scale(1.05);
    }
    
    .badge-strategic {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #ffffff;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }
    
    .badge-ukraine {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: #ffffff;
        border: 1px solid rgba(59, 130, 246, 0.3);
    }
    
    .badge-fonss {
        background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
        color: #ffffff;
        border: 1px solid rgba(236, 72, 153, 0.3);
    }
    
    .tag-domain {
        display: inline-block;
        background: rgba(220, 38, 38, 0.15);
        color: #fca5a5;
        border: 1px solid rgba(220, 38, 38, 0.3);
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 0.85rem;
        margin-right: 6px;
        margin-bottom: 6px;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .tag-domain:hover {
        background: rgba(220, 38, 38, 0.25);
        border-color: rgba(220, 38, 38, 0.5);
    }
    
    /* SEARCH BOX */
    div[data-baseweb="select"] > div {
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 12px !important;
        color: #ffffff !important;
    }
    
    /* BUTTONS */
    .stButton > button {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(220, 38, 38, 0.4);
    }
    
    /* EXPANDER */
    .streamlit-expanderHeader {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        color: #cbd5e1 !important;
        font-weight: 600;
    }
    
    .streamlit-expanderHeader:hover {
        background: rgba(220, 38, 38, 0.1);
    }
    
    /* SECTION HEADERS */
    h3 {
        color: #ffffff;
        font-weight: 700;
        margin-bottom: 24px;
        font-size: 1.5rem;
    }
    
    h4 {
        color: #e2e8f0;
        font-weight: 600;
        margin-bottom: 16px;
    }
    
    /* DIVIDER */
    hr {
        border-color: rgba(255, 255, 255, 0.1);
        margin: 32px 0;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------
# 2. DATA LOGIC (UNCHANGED)
# ---------------------------------

DOMAIN_GROUPS = {
    "Intervenții, urgențe": ["Intervenție", "Căutare-salvare", "Dezastre chimice", "Răspuns"],
    "Educație, prevenire": ["Prevenire", "Pregătire", "Cercetare", "Prevenirea si combaterea dezinformării"],
    "Logistică, tehnologie": ["IT & C", "Sprijin logistic", "Restabilirea stării de normalitate", "Sprijin tehnic logistic"],
    "Social, medical": ["Servicii sociale", "Prevenire (trafic persoane)"]
}

# Entity type classification and colors
ENTITY_TYPES = {
    "Universitate": {"color": "#8b5cf6", "keywords": ["universitatea", "academia", "facultatea", "politehnica"]},
    "ONG": {"color": "#10b981", "keywords": ["asociația", "fundația", "organizația", "federația"]},
    "Instituție de stat": {"color": "#3b82f6", "keywords": ["serviciul", "autoritatea", "institutul național", "compania națională"]},
    "Companie privată": {"color": "#f59e0b", "keywords": ["s.a.", "srl", "autonom", "omv", "e-distribuție", "transelectrica"]},
    "Media": {"color": "#ec4899", "keywords": ["televiziune", "radiodifuziune", "srtv"]},
    "Organizație profesională": {"color": "#14b8a6", "keywords": ["colegiul", "consiliul", "societatea română", "unsar", "amcham"]},
}

def classify_entity_type(name: str) -> str:
    """Classify a partner into an entity type based on name patterns."""
    name_lower = name.lower()

    # Check each entity type's keywords
    for entity_type, config in ENTITY_TYPES.items():
        for keyword in config["keywords"]:
            if keyword in name_lower:
                return entity_type

    # Default to ONG if no match
    return "ONG"

def get_entity_color(name: str) -> str:
    """Get the color for an entity based on its type."""
    entity_type = classify_entity_type(name)
    return ENTITY_TYPES.get(entity_type, ENTITY_TYPES["ONG"])["color"]

FONSS_PARENT_NAME = "Federația Organizațiilor Neguvernamentale pentru Servicii Sociale (FONSS)"

def clean_domains(domain_str: str) -> list[str]:
    if pd.isna(domain_str): return []
    text = str(domain_str).strip()
    if text in ["", "-"]: return []
    text = text.replace("\n", "/").replace("|", "/").replace("\\", "/")
    return [p.strip() for p in text.split("/") if p.strip()]

def map_domain_category(raw_piece: str) -> str:
    t = raw_piece.lower()
    if "dezastre chimice" in t: return "Dezastre chimice"
    if "smart city" in t or "it & c" in t: return "IT & C"
    if "căutare" in t or "caini" in t or "câini" in t: return "Căutare-salvare"
    if "restabilirea" in t: return "Restabilirea stării de normalitate"
    if "sociale" in t: return "Servicii sociale"
    if "logistic" in t: return "Sprijin logistic"
    if "răspuns" in t or "traum" in t or "psiholog" in t: return "Răspuns"
    if "trafic" in t: return "Prevenire (trafic persoane)"
    if "prevenire" in t: return "Prevenire"
    if "pregătire" in t or "practică" in t or "training" in t: return "Pregătire"
    if "cercetare" in t: return "Cercetare"
    if "intervenție" in t: return "Intervenție"
    return raw_piece.strip()

@st.cache_data
def load_data():
    nodes_dict = {}
    edges_list = []
    all_domains_set = set()
    
    try:
        df = pd.read_csv("data.csv", on_bad_lines='skip')
    except FileNotFoundError:
        return {}, [], pd.DataFrame(), [], None

    df.columns = [c.strip() for c in df.columns]
    if "Ukraine" not in df.columns: df["Ukraine"] = False
    if "Strategic" not in df.columns: df["Strategic"] = False
    if "Description" not in df.columns: df["Description"] = ""

    def normalize_bool(val):
        return str(val).strip().lower() in ["da", "true", "x", "1", "yes"]

    df["Ukraine"] = df["Ukraine"].apply(normalize_bool)
    df["Strategic"] = df["Strategic"].apply(normalize_bool)
    df["Domains_List"] = df["Domain_Raw"].apply(clean_domains)

    fonss_id = None

    for idx, row in df.iterrows():
        p_id = f"p_{idx}"
        partner_label = str(row["Partner"]).strip()
        
        if partner_label == FONSS_PARENT_NAME:
            fonss_id = p_id

        nodes_dict[p_id] = {
            "label": partner_label,
            "type": "Partner",
            "ukraine": row["Ukraine"],
            "strategic": row["Strategic"],
            "description": str(row["Description"]) if not pd.isna(row["Description"]) else "Descriere indisponibilă.",
            "raw_domain": str(row["Domain_Raw"]),
            "parent_id": None
        }

        for raw_dom in row["Domains_List"]:
            dom_cat = map_domain_category(raw_dom)
            all_domains_set.add(dom_cat)
            d_id = f"d_{dom_cat}"
            if d_id not in nodes_dict:
                nodes_dict[d_id] = {
                    "label": dom_cat,
                    "type": "Domain",
                }
            edges_list.append((p_id, d_id))

    if fonss_id and os.path.exists("membrii_fonss.csv"):
        try:
            df_fonss = pd.read_csv("membrii_fonss.csv", on_bad_lines='skip')
            if "Nume" in df_fonss.columns:
                for idx, row in df_fonss.iterrows():
                    m_id = f"m_fonss_{idx}"
                    label = str(row["Nume"]).strip()
                    desc = row["Descriere"] if "Descriere" in row else "Membru FONSS"
                    nodes_dict[m_id] = {
                        "label": label,
                        "type": "Partner",
                        "ukraine": False,
                        "strategic": False,
                        "description": str(desc),
                        "raw_domain": "Servicii sociale",
                        "parent_id": fonss_id,
                        "is_fonss_member": True
                    }
        except Exception:
            pass

    return nodes_dict, edges_list, df, sorted(list(all_domains_set)), fonss_id

nodes_data, edges_data, df, all_domain_labels, fonss_id = load_data()

# ---------------------------------
# 3. NAVIGATION - Sticky Header with Navigation
# ---------------------------------

# Initialize page state
if "current_page" not in st.session_state:
    st.session_state["current_page"] = "Ecosistem parteneri"

# Load logos as base64
dsu_logo = get_base64_image("logos/dsu.png")
uvt_logo = get_base64_image("logos/uvt.png")
fsgc_logo = get_base64_image("logos/fsgc.png")

# Render sticky header with HTML and logos
st.markdown(f"""
<div class="sticky-header-container">
    <div class="header-logo">
        <a href="https://www.dsu.mai.gov.ro/" target="_blank" style="display: flex; align-items: center;">
            <img src="data:image/png;base64,{dsu_logo}" alt="DSU" style="height: 50px; width: auto; border-radius: 4px; cursor: pointer;">
        </a>
        <span class="header-title">Ecosistemul partenerilor DSU</span>
    </div>
    <div class="header-nav" id="header-nav">
        <!-- Navigation will be handled by Streamlit radio below -->
    </div>
    <div class="header-logos">
        <a href="https://www.uvt.ro/" target="_blank">
            <img src="data:image/png;base64,{uvt_logo}" alt="UVT" style="height: 35px; width: auto; border-radius: 4px; cursor: pointer;">
        </a>
        <a href="https://fsgc.uvt.ro/" target="_blank">
            <img src="data:image/png;base64,{fsgc_logo}" alt="FSGC" style="height: 55px; width: auto; border-radius: 4px; cursor: pointer;">
        </a>
    </div>
</div>
<div class="sticky-header-spacer"></div>
""", unsafe_allow_html=True)

# Hidden radio for page selection (styled to appear in header area)
page = st.radio(
    "Meniu",
    ["Rețea parteneri", "Statistici", "Despre proiect"],
    horizontal=True,
    label_visibility="collapsed",
    key="main_menu"
)

# ---------------------------------
# 4. PAGE: ECOSISTEM
# ---------------------------------

if page == "Rețea parteneri":
    if "selected_id" not in st.session_state:
        st.session_state["selected_id"] = None
    if "filter_domains" not in st.session_state:
        st.session_state["filter_domains"] = all_domain_labels
    if "special_filter" not in st.session_state:
        st.session_state["special_filter"] = None  # Can be "strategic", "ukraine", or None

    if "entity_filter" not in st.session_state:
         st.session_state["entity_filter"] = None

    col_controls, col_graph, col_stats = st.columns([1.2, 3.0, 1.0], gap="medium")

    with col_controls:
        st.markdown("### Explorează")
        
        partner_names = sorted([info["label"] for nid, info in nodes_data.items() 
                               if info["type"] == "Partner" and info.get("parent_id") is None])
        
        def on_search_change():
            selected_name = st.session_state["search_box"]
            found_id = None
            for nid, info in nodes_data.items():
                if info["label"] == selected_name:
                    found_id = nid
                    break
            st.session_state["selected_id"] = found_id

        current_idx = None
        if st.session_state["selected_id"] and st.session_state["selected_id"] in nodes_data:
            node = nodes_data[st.session_state["selected_id"]]
            if node["type"] == "Partner" and node.get("parent_id") is None and node["label"] in partner_names:
                current_idx = partner_names.index(node["label"])

        st.selectbox(
            "Caută partener:", 
            options=partner_names, 
            index=current_idx, 
            key="search_box", 
            on_change=on_search_change, 
            placeholder="Selectează organizație...",
            label_visibility="collapsed"
        )
        
        st.markdown("---")

        selected_id = st.session_state["selected_id"]
        
        if selected_id and selected_id in nodes_data:
            info = nodes_data[selected_id]
            if info["type"] == "Partner":
                badges_html = ""
                if info.get("strategic"): 
                    badges_html += '<span class="badge badge-strategic">Strategic</span>'
                if info.get("ukraine"): 
                    badges_html += '<span class="badge badge-ukraine">Ucraina</span>'
                if info.get("is_fonss_member"): 
                    badges_html += '<span class="badge badge-fonss">Membru FONSS</span>'
                
                if info.get("is_fonss_member"):
                    tags_html = '<span class="tag-domain">Servicii sociale</span>'
                else:
                    my_domains = [nodes_data[t]["label"] for s, t in edges_data if s == selected_id and t in nodes_data]
                    tags_html = "".join([f'<span class="tag-domain">{d}</span>' for d in sorted(set(my_domains))])

                st.markdown(f"""
                <div class="partner-card">
                    <div class="partner-title">{info['label']}</div>
                    <div style="margin-bottom:16px;">{badges_html}</div>
                    <div class="partner-desc">{info['description']}</div>
                    <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:10px; font-weight:600;">DOMENII DE ACTIVITATE</div>
                    <div>{tags_html}</div>
                </div>
                """, unsafe_allow_html=True)
                
                if selected_id == fonss_id: 
                    st.info("S-au afișat în graf organizațiile membre FONSS.")
            else:
                partners_linked = [nodes_data[s]["label"] for s, t in edges_data if t == selected_id and s in nodes_data]
                st.markdown(f"""
                <div class="partner-card">
                    <div class="partner-title">{info['label']}</div>
                    <div class="partner-desc">Acest domeniu conectează <b>{len(partners_linked)}</b> parteneri DSU.</div>
                </div>
                """, unsafe_allow_html=True)
            
            if st.button("← Înapoi la vedere generală", use_container_width=True):
                st.session_state["selected_id"] = None
                st.rerun()
        else:
            st.markdown("""
            <div class="info-box">
                <div class="info-title">Ce vezi aici?</div>
                <div class="info-text">
                    O hartă interactivă a colaborărilor DSU cu societatea civilă și instituții publice.
                </div>
            </div>

            <div class="info-box">
                <div class="info-title">De ce contează?</div>
                <div class="info-text">
                    Conexiunile arată capacitatea de reacție integrată. DSU nu acționează singur, ci într-un ecosistem.
                </div>
            </div>

            <div class="info-box" style="border-left-color: #94a3b8;">
                <div class="info-title">Notă date</div>
                <div class="info-text">
                    Sunt afișate doar parteneriatele formale și documentate, nu toate colaborările ad-hoc.
                </div>
            </div>

            <div class="info-box" style="border-left-color: #10b981;">
                <div class="info-title">Cum navighez?</div>
                <div class="info-text">
                    <b>Click</b> pe un nod pentru detalii<br>
                    <b>Scroll</b> pentru zoom in/out<br>
                    <b>Drag</b> pentru a muta vizualizarea
                </div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("---")
        st.markdown("### Caută după domenii")
        
        c1, c2 = st.columns(2)
        if c1.button("Select all", use_container_width=True):
            st.session_state["filter_domains"] = all_domain_labels
            st.rerun()
        if c2.button("Clear all", use_container_width=True):
            st.session_state["filter_domains"] = []
            st.rerun()

        current_selection = set(st.session_state["filter_domains"])
        new_selection = set()
        for group_name, group_domains in DOMAIN_GROUPS.items():
            available_in_group = [d for d in group_domains if d in all_domain_labels]
            if available_in_group:
                with st.expander(f"{group_name}", expanded=False):
                    sel = st.multiselect(
                        "Selectează:", 
                        options=available_in_group, 
                        default=[d for d in available_in_group if d in current_selection], 
                        key=f"group_{group_name}", 
                        label_visibility="collapsed"
                    )
                    new_selection.update(sel)
        st.session_state["filter_domains"] = list(new_selection)

    with col_graph:
        final_nodes = []
        final_edges = []
        
        # Smaller, cleaner fonts
        common_font_style = {"color": "#ffffff", "size": 10, "face": "Inter"}
        hub_font_style = {"color": "#ffffff", "size": 14, "face": "Inter", "bold": True}

        focus_id = st.session_state["selected_id"]
        edges_to_draw = []
        hub_id = None
        leaf_ids = []
        random.seed(42)

        if focus_id:
            focus_node = nodes_data.get(focus_id, {})
            is_parent_focus = (focus_id == fonss_id)
            is_child_focus = (focus_node.get("parent_id") is not None)

            if is_parent_focus: 
                hub_id = fonss_id
                for nid, info in nodes_data.items():
                    if info.get("parent_id") == fonss_id:
                        leaf_ids.append(nid)
                        edges_to_draw.append((nid, fonss_id))
            elif is_child_focus: 
                hub_id = focus_node.get("parent_id")
                leaf_ids = [focus_id] 
                edges_to_draw.append((focus_id, hub_id))
            else: 
                hub_id = focus_id
                for s, t in edges_data:
                    if s == hub_id:
                        leaf_ids.append(t)
                        edges_to_draw.append((s, t))
                    elif t == hub_id:
                        leaf_ids.append(s)
                        edges_to_draw.append((s, t))

        if hub_id:
            # RADIAL FOCUSED VIEW
            info_hub = nodes_data[hub_id]
            final_nodes.append(Node(
                id=hub_id, 
                label=info_hub["label"][:30] + "..." if len(info_hub["label"]) > 30 else info_hub["label"],
                size=40,
                shape="dot" if info_hub["type"]=="Partner" else "diamond",
                color="#dc2626",
                font=hub_font_style,
                x=0, y=0, fixed=True
            ))

            count = len(leaf_ids)
            radius = 300  # Reduced for better fit with zoom
            
            for i, nid in enumerate(leaf_ids):
                info = nodes_data[nid]
                angle = 2 * math.pi * i / max(count, 1)
                pos_x = radius * math.cos(angle)
                pos_y = radius * math.sin(angle)
                
                if info["type"] == "Domain":
                    color = "#dc2626"
                elif info.get("is_fonss_member"):
                    color = "#b91c1c"
                else:
                    color = get_entity_color(info["label"])
                
                # Truncate long labels
                label = info["label"][:25] + "..." if len(info["label"]) > 25 else info["label"]

                final_nodes.append(Node(
                    id=nid, label=label, size=22,
                    shape="dot" if info["type"]=="Partner" else "diamond",
                    color=color, font=common_font_style,
                    x=pos_x, y=pos_y, fixed=True
                ))
            
            for s, t in edges_to_draw:
                final_edges.append(Edge(
                    source=s, target=t, 
                    color="#dc2626",
                    width=1.5
                ))
                
            config = Config(
                width="100%",
                height=900,
                directed=False,
                physics=False,
                hierarchical=False,
                nodeHighlightBehavior=True,
                highlightColor="#FFFFFF",
                initialZoom=2.0,
                minZoom=0.8,
                maxZoom=5.0,
                staticGraphWithDragAndDrop=True
            )

        else:
            # CLUSTERED VIEW BY DOMAIN
            
            # --- 1. MODIFICARE FILTRARE: PRELUAM FILTRELE ACTIVE ---
            special_filter = st.session_state.get("special_filter")
            entity_filter = st.session_state.get("entity_filter") # <--- NOU

            visible_domain_ids = {nid for nid, info in nodes_data.items()
                                  if info["type"] == "Domain"
                                  and info["label"] in st.session_state["filter_domains"]}

            relevant_partners = set()
            active_edges = []

            for s, t in edges_data:
                # Verificăm dacă conexiunea duce către un domeniu vizibil
                if t in visible_domain_ids:
                    partner_node = nodes_data[s]
                    
                    # Verificăm doar dacă e partener principal (nu sub-nod)
                    if partner_node.get("parent_id") is None:
                        
                        # --- 2. APLICĂM FILTRELE CUMULATIV (AND logic) ---
                        matches_special = True
                        matches_entity = True

                        # Verificare filtru special (Strategic / Ucraina)
                        if special_filter == "strategic" and not partner_node.get("strategic"):
                            matches_special = False
                        elif special_filter == "ukraine" and not partner_node.get("ukraine"):
                            matches_special = False
                        
                        # Verificare filtru entitate (Universitate / ONG / etc) <--- NOU
                        if entity_filter:
                            # Calculăm tipul entității curente
                            current_type = classify_entity_type(partner_node["label"])
                            if current_type != entity_filter:
                                matches_entity = False

                        # Dacă trece de toate filtrele, îl adăugăm
                        if matches_special and matches_entity:
                            relevant_partners.add(s)
                            active_edges.append((s, t))
            
            # (Restul codului de desenare rămâne la fel, dar folosește listele filtrate mai sus)
            # Dacă filtrele sunt active, restrângem domeniile afișate doar la cele relevante
            if special_filter or entity_filter:
                connected_domain_ids = {t for s, t in active_edges}
                visible_domain_ids = visible_domain_ids & connected_domain_ids

            domain_list = list(visible_domain_ids)
            # ... continuă codul original de poziționare (cols, rows, etc.) ...
            # ... asigură-te că folosești codul existent pentru final_nodes.append ...
            
            # COPIAZĂ RESTUL LOGICII DE POZIȚIONARE DIN CODUL TĂU VECHI DE AICI ÎN JOS
            # (Codul care calculează coordonatele x, y pentru domenii și parteneri)
            # Doar asigură-te că 'relevant_partners' și 'active_edges' sunt cele calculate mai sus.
            
            # --- RE-INSERARE LOGICA POZIȚIONARE PENTRU INTEGRITATE ---
            num_domains = len(domain_list)
            if num_domains > 0:
                cols = math.ceil(math.sqrt(num_domains))
                rows = math.ceil(num_domains / cols)
                spacing = 400 
                
                for idx, nid in enumerate(domain_list):
                    row = idx // cols
                    col = idx % cols
                    x = (col - cols/2) * spacing
                    y = (row - rows/2) * spacing
                    
                    label = nodes_data[nid]["label"][:20] + "..." if len(nodes_data[nid]["label"]) > 20 else nodes_data[nid]["label"]
                    
                    final_nodes.append(Node(
                        id=nid, label=label, size=30, 
                        shape="diamond", color="#dc2626", font=hub_font_style,
                        x=x, y=y
                    ))
            
            for nid in relevant_partners:
                info = nodes_data[nid]
                color = get_entity_color(info["label"])
                
                connected_domains = [t for s, t in active_edges if s == nid]
                if connected_domains:
                    domain_idx = domain_list.index(connected_domains[0]) if connected_domains[0] in domain_list else 0
                    row = domain_idx // cols
                    col = domain_idx % cols
                    base_x = (col - cols/2) * spacing
                    base_y = (row - rows/2) * spacing
                    x = base_x + random.uniform(-150, 150)
                    y = base_y + random.uniform(-150, 150)
                else:
                    x = random.uniform(-400, 400)
                    y = random.uniform(-400, 400)
                
                label = info["label"][:20] + "..." if len(info["label"]) > 20 else info["label"]
                
                final_nodes.append(Node(
                    id=nid, label=label, size=20,
                    shape="dot", color=color, font=common_font_style,
                    x=x, y=y
                ))
                 
            for s, t in active_edges:
                final_edges.append(Edge(
                    source=s, target=t, 
                    color="rgba(220, 38, 38, 0.2)", 
                    width=3
                ))

            config = Config(
                width="100%",
                height=900,
                directed=False,
                physics=True,
                hierarchical=False,
                nodeHighlightBehavior=True,
                highlightColor="#FFFFFF",
                initialZoom=1.8,
                minZoom=0.5,
                maxZoom=5.0,
                staticGraphWithDragAndDrop=False,
                collapsible=False,
                node={"highlightStrokeColor": "#dc2626"},
                link={"highlightColor": "#dc2626"}
            )
        
        # Handle clicking on nodes
        return_value = agraph(nodes=final_nodes, edges=final_edges, config=config)

        # Logica de click (rămâne la fel)
        if return_value:
            clicked_id = None
            if isinstance(return_value, str):
                clicked_id = return_value
            elif isinstance(return_value, dict):
                if "id" in return_value:
                    clicked_id = return_value["id"]
                elif "nodes" in return_value and len(return_value["nodes"]) > 0:
                    clicked_id = return_value["nodes"][0]
            
            if clicked_id and clicked_id in nodes_data and clicked_id != st.session_state["selected_id"]:
                st.session_state["selected_id"] = clicked_id
                st.rerun()

    # --- RIGHT PANEL: STATISTICS & LEGEND ---
    with col_stats:
        st.markdown("### Statistici rețea")

        # Calculate network statistics
        total_partners = len([n for n in nodes_data.values() if n["type"] == "Partner" and n.get("parent_id") is None])
        total_domains = len([n for n in nodes_data.values() if n["type"] == "Domain"])
        total_connections = len(edges_data)
        strategic_count = len([n for n in nodes_data.values() if n.get("strategic")])
        ukraine_count = len([n for n in nodes_data.values() if n.get("ukraine")])

        # Entity type breakdown
        entity_counts = {}
        for nid, info in nodes_data.items():
            if info["type"] == "Partner" and info.get("parent_id") is None:
                etype = classify_entity_type(info["label"])
                entity_counts[etype] = entity_counts.get(etype, 0) + 1

        # Display metrics
        st.metric("Total parteneri", total_partners)
        st.metric("Domenii de activitate", total_domains)
        st.metric("Conexiuni", total_connections)

        st.markdown("---")

        # ---------------------------------------------------------
        # BUTOANE FILTRARE STILIZATE (MERGED FUNCTIONALITY)
        # ---------------------------------------------------------
        
        # 1. Definim starea și etichetele
        is_strat_active = st.session_state.get("special_filter") == "strategic"
        is_ukr_active = st.session_state.get("special_filter") == "ukraine"

        # Adăugăm un checkmark dacă este activ
        strat_label = f"{'✓ ' if is_strat_active else ''}{strategic_count} Parteneri strategici"
        ukr_label = f"{'✓ ' if is_ukr_active else ''}{ukraine_count} Sprijin Ucraina"

        # 2. CSS Custom pentru a transforma butoanele standard în "Badges" colorate
        # Folosim :nth-of-type pentru a targeta specific butoanele din coloane
        st.markdown("""
        <style>
        /* Ascundem stilul default al butoanelor din containerul următor */
        div[data-testid="stHorizontalBlock"] button {
            border: none;
            color: white;
            font-size: 0.85rem;
            font-weight: 600;
            padding: 0.5rem 1rem;
            border-radius: 20px; /* Formă de pill/insignă */
            line-height: 1.2;
            transition: transform 0.2s;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        div[data-testid="stHorizontalBlock"] button:hover {
            transform: scale(1.05);
            border: none;
            color: white;
        }

        div[data-testid="stHorizontalBlock"] button:focus {
            color: white !important;
            border: none !important;
        }

        /* Butonul 1: STRATEGIC (Orange/Brown) */
        div[data-testid="column"]:nth-of-type(1) button {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border: 1px solid rgba(245, 158, 11, 0.3);
        }
        /* Stare activă pentru Strategic (mai strălucitor sau bordură albă) */
        div[data-testid="column"]:nth-of-type(1) button:active,
        div[data-testid="column"]:nth-of-type(1) button:focus {
             background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
             box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.5);
        }

        /* Butonul 2: UCRAINA (Blue) */
        div[data-testid="column"]:nth-of-type(2) button {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border: 1px solid rgba(59, 130, 246, 0.3);
        }
        /* Stare activă pentru Ucraina */
        div[data-testid="column"]:nth-of-type(2) button:active,
        div[data-testid="column"]:nth-of-type(2) button:focus {
             background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
             box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
        </style>
        """, unsafe_allow_html=True)

        # 3. Crearea butoanelor funcționale
        # Folosim un container pentru a izola CSS-ul cât de cât
        col_btn1, col_btn2 = st.columns([1, 1])
        
        with col_btn1:
            if st.button(strat_label, key="btn_strategic_pill"):
                if is_strat_active:
                    st.session_state["special_filter"] = None
                else:
                    st.session_state["special_filter"] = "strategic"
                    st.session_state["selected_id"] = None # Reset selection
                st.rerun()

        with col_btn2:
            if st.button(ukr_label, key="btn_ukraine_pill"):
                if is_ukr_active:
                    st.session_state["special_filter"] = None
                else:
                    st.session_state["special_filter"] = "ukraine"
                    st.session_state["selected_id"] = None # Reset selection
                st.rerun()

        # Mesaj informativ discret sub butoane
        if st.session_state.get("special_filter"):
            filter_text = "strategic" if st.session_state["special_filter"] == "strategic" else "Ucraina"
            st.caption(f"Filtru activ: {filter_text} (Click din nou pentru a dezactiva)")

        st.markdown("---")

        # Legend Header
        st.markdown("### Caută după tip partener")
        
        # Dacă există un filtru activ, afișăm buton de resetare
        if st.session_state.get("entity_filter"):
            st.caption(f"Filtru activ: {st.session_state['entity_filter']}")
            if st.button("✕ Șterge filtrul de entitate", type="secondary", use_container_width=True):
                st.session_state["entity_filter"] = None
                st.rerun()
        else:
            st.caption("Apasă pe o categorie din legendă pentru a filtra harta pe baza tipului de partener ales.")

        st.markdown("**Tip entitate:**")

        # Generăm CSS dinamic pentru a colora marginea butoanelor
        # Acest CSS face butoanele să aibă o linie colorată în stânga, similar cu legenda
        css_legend = "<style>"
        for etype, config in ENTITY_TYPES.items():
            safe_cls = etype.replace(" ", "-").replace("ă", "a").replace("ț", "t").lower()
            color = config['color']
            # Stilizăm butonul specific folosind un div wrapper sau o clasă (Streamlit e limitat aici, 
            # deci vom folosi o abordare vizuală cu markdown + button separate sau columns)
        css_legend += "</style>"
        st.markdown(css_legend, unsafe_allow_html=True)

        # Loop prin tipuri de entități pentru a crea butoane
        for etype, config in ENTITY_TYPES.items():
            count = entity_counts.get(etype, 0)
            color = config['color']
            
            # Folosim coloane pentru a simula "Bulina colorată + Butonul Text"
            c_dot, c_btn = st.columns([0.15, 0.85])
            
            with c_dot:
                # Desenăm bulina statică, perfect aliniată
                st.markdown(
                    f'<div style="margin-top: 10px; width: 16px; height: 16px; background-color: {color}; border-radius: 50%;"></div>', 
                    unsafe_allow_html=True
                )
            
            with c_btn:
                # Butonul funcționează ca filtru
                # Dacă e activ, îl facem "primary" (plin), altfel "secondary" (outline/transparent)
                is_active = (st.session_state.get("entity_filter") == etype)
                btn_type = "primary" if is_active else "secondary"
                
                if st.button(f"{etype} ({count})", key=f"leg_btn_{etype}", type=btn_type, use_container_width=True):
                    # Logică de toggle: dacă apeși pe cel activ, se dezactivează
                    if is_active:
                        st.session_state["entity_filter"] = None
                    else:
                        st.session_state["entity_filter"] = etype
                        st.session_state["selected_id"] = None # Resetăm selecția individuală
                    st.rerun()

        st.markdown("<div style='margin-top: 12px;'></div>", unsafe_allow_html=True)

        # Legenda pentru domenii (rămâne statică)
        st.markdown("**Domenii:**")
        st.markdown("""
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
            <div style="width: 16px; height: 16px; background: #dc2626; transform: rotate(45deg);"></div>
            <span style="color: #cbd5e1; font-size: 0.9rem;">Domeniu de activitate</span>
        </div>
        """, unsafe_allow_html=True)

# ---------------------------------
# 5. PAGINA: STATISTICI (V2.0 - REDESIGN)
# ---------------------------------

elif page == "Statistici":
    st.markdown("### DSU în cifre")
    st.markdown("""
    <div style="background-color: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; border-left: 5px solid #dc2626; margin-bottom: 25px;">
        Date în curs de prelucrare. Ultimele date disponibile sunt din 2024 
    </div>
    """, unsafe_allow_html=True)
    
    # --- 1. FUNCTIE INCARCARE DATE ---
    @st.cache_data
    def load_all_stats():
        data = {}
        files = {
            "interv": "data/interventii_ambulanta.csv",
            "apeluri": "data/apeluri_urgenta.csv",
            "timp": "data/timp_raspuns.csv",
            "igsu": "data/situatii_igsu.csv",
            "risc": "data/categorii_risc.csv",
            "zbor": "data/ore_zbor.csv",
            "upu": "data/prezentari_upu.csv",
            "instruire": "data/instruire_persoane.csv",
            "protocoale": "data/protocoale.csv",
            "actiuni": "data/tipuri_actiuni.csv",
            "expertiza": "data/arii_expertiza.csv"
        }
        
        for key, path in files.items():
            try:
                df = pd.read_csv(path)
                df.columns = [c.strip() for c in df.columns] 
                data[key] = df
            except Exception:
                data[key] = None
        return data

    D = load_all_stats()
    
    # --- 2. CONFIGURARE HARTA ROMANIA ---
    @st.cache_data
    def get_romania_geojson():
        # URL stabil fără diacritice în proprietățile numelor
        return "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/romania.geojson"

    # Mapare COMPLETĂ și FĂRĂ DIACRITICE pentru a se potrivi cu GeoJSON-ul
    isu_to_judet = {
        "AB": "Alba", "AR": "Arad", "AG": "Arges", "BC": "Bacau", "BH": "Bihor", 
        "BN": "Bistrita-Nasaud", "BT": "Botosani", "BV": "Brasov", "BR": "Braila", "BZ": "Buzau",
        "CS": "Caras-Severin", "CL": "Calarasi", "CJ": "Cluj", "CT": "Constanta", "CV": "Covasna",
        "DB": "Dambovita", "DJ": "Dolj", "GL": "Galati", "GR": "Giurgiu", "GJ": "Gorj",
        "HR": "Harghita", "HD": "Hunedoara", "IL": "Ialomita", "IS": "Iasi", "IF": "Ilfov",
        "MM": "Maramures", "MH": "Mehedinti", "MS": "Mures", "NT": "Neamt", "OT": "Olt",
        "PH": "Prahova", "SM": "Satu Mare", "SJ": "Salaj", "SB": "Sibiu", "SV": "Suceava",
        "TR": "Teleorman", "TM": "Timis", "TL": "Tulcea", "VS": "Vaslui", "VL": "Valcea",
        "VN": "Vrancea", "B": "Bucuresti", "BIF": "Bucuresti"
    }

    toate_judetele = sorted(list(set(isu_to_judet.values())))

    if D["interv"] is None:
        st.error("Eroare: Nu s-au găsit fișierele de date. Verifică folderul /data.")
    else:
        # --- MENIU TAB-URI ---
        tab1, tab2, tab3 = st.tabs(["Operațional și urgențe", "Medical și aviație", "Prevenire și parteneri"])

        # ==========================================
        # TAB 1: OPERAȚIONAL
        # ==========================================
        with tab1:
            st.markdown("#### Indicatori de performanță operațională")
            st.markdown("""
            <span style='font-size:0.9rem; color:#cbd5e1'>
            Această secțiune monitorizează volumul total de activitate. 
            Comparăm numărul de apeluri primite la 112 cu numărul de intervenții reale efectuate de echipaje (Ambulanță, SMURD, Pompieri).
            </span><br><br>
            """, unsafe_allow_html=True)

            latest_year = D["interv"]['An'].max()
            curr_interv = D["interv"].loc[D["interv"]['An'] == latest_year, 'Interventii'].values[0]
            
            last_call_year = D["apeluri"]['An'].max()
            curr_apel = D["apeluri"].loc[D["apeluri"]['An'] == last_call_year, 'Apeluri'].values[0]
            
            curr_time = D["timp"].loc[D["timp"]['An'] == D["timp"]['An'].max(), 'Minute'].values[0]

            k1, k2, k3, k4 = st.columns(4)
            k1.metric(f"Total Intervenții ({latest_year})", f"{curr_interv:,.0f}", help="Numărul total de misiuni executate de serviciile de urgență.")
            k2.metric(f"Apeluri 112 ({last_call_year})", f"{curr_apel:,.0f}", help="Apeluri de urgență recepționate în sistemul SNUAU.")
            k3.metric("Timp mediu de răspuns", f"{curr_time} min", help="Timpul mediu scurs de la apel până la sosirea echipajului.")
            k4.metric("Medie zilnică intervenții", f"{int(curr_interv/365):,.0f}", help="Media misiunilor de salvare efectuate în fiecare zi la nivel național.")
            
            st.divider()
            
            c1, c2 = st.columns(2)
            with c1:
                st.subheader("Cerere vs. răspuns")
                st.markdown("<div style='margin-bottom:10px; font-size:0.85rem; color:#94a3b8;'>Evoluția comparativă a apelurilor de urgență (cererea cetățenilor) față de intervențiile efective (capacitatea de răspuns) pe ultimii 10 ani.</div>", unsafe_allow_html=True)
                
                fig_main = go.Figure()
                fig_main.add_trace(go.Scatter(x=D["interv"]['An'], y=D["interv"]['Interventii'], name='Intervenții Reale', line=dict(color='#dc2626', width=3), mode='lines+markers'))
                fig_main.add_trace(go.Scatter(x=D["apeluri"]['An'], y=D["apeluri"]['Apeluri'], name='Apeluri 112', line=dict(color='#3b82f6', width=3), mode='lines+markers'))
                fig_main.update_layout(height=380, paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font=dict(color="white"), legend=dict(orientation="h", y=1.1))
                st.plotly_chart(fig_main, use_container_width=True)
                
            with c2:
                st.subheader("Distribuția misiunilor IGSU")
                st.markdown("<div style='margin-bottom:10px; font-size:0.85rem; color:#94a3b8;'>Ce tipuri de urgențe gestionează pompierii și paramedicii? SMURD reprezintă majoritatea covârșitoare a intervențiilor.</div>", unsafe_allow_html=True)
                
                if D["igsu"] is not None:
                    fig_pie = px.pie(D["igsu"], values="Număr", names="Subcategorie", hole=0.5, color_discrete_sequence=px.colors.sequential.RdBu)
                    fig_pie.update_traces(textposition='outside', textinfo='percent+label')
                    fig_pie.update_layout(height=380, paper_bgcolor="rgba(0,0,0,0)", showlegend=False, font=dict(color="white"))
                    st.plotly_chart(fig_pie, use_container_width=True)

        # ==========================================
        # TAB 2: MEDICAL & AVIAȚIE
        # ==========================================
        with tab2:
            st.markdown("#### Infrastructura critică: UPU și Aviația SMURD")
            st.markdown("""
            <span style='font-size:0.9rem; color:#cbd5e1'>
            Analizăm presiunea asupra spitalelor (prin numărul de pacienți ajunși în Unitățile de Primiri Urgențe) 
            și activitatea flotei aeriene de salvare (elicoptere și avioane SMURD) pentru cazurile critice sau transport la distanță.
            </span><br><br>
            """, unsafe_allow_html=True)
            
            m1, m2 = st.columns(2)
            
            with m1:
                st.subheader("Fluxul de pacienți în UPU")
                st.markdown("<div style='font-size:0.85rem; color:#94a3b8;'>Volumul total anual de persoane care au necesitat asistență medicală de urgență în spitale.</div>", unsafe_allow_html=True)
                
                if D["upu"] is not None:
                    fig_upu = px.area(D["upu"], x="An", y="Prezentări în UPU")
                    fig_upu.update_traces(line_color="#10b981", fillcolor="rgba(16, 185, 129, 0.2)")
                    fig_upu.update_layout(height=350, paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font=dict(color="white"))
                    st.plotly_chart(fig_upu, use_container_width=True)
            
            with m2:
                st.subheader("Activitatea aeriană de salvare")
                st.markdown("<div style='font-size:0.85rem; color:#94a3b8;'>Orele de zbor acumulate anual de Inspectoratul General de Aviație (IGAV) în misiuni medicale și de căutare-salvare.</div>", unsafe_allow_html=True)
                
                if D["zbor"] is not None:
                    fig_zbor = px.bar(D["zbor"], x="An", y="Ore de zbor", text="Ore de zbor")
                    fig_zbor.update_traces(marker_color="#f59e0b", textposition='outside')
                    fig_zbor.update_layout(height=350, paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font=dict(color="white"), yaxis=dict(showgrid=False))
                    st.plotly_chart(fig_zbor, use_container_width=True)

        # ==========================================
        # TAB 3: PREVENIRE & PARTENERI
        # ==========================================
        with tab3:
            st.markdown("#### Reziliența Comunității și Parteneriate")
            st.markdown("""
            <span style='font-size:0.9rem; color:#cbd5e1'>
            Situațiile de urgență nu se gestionează doar prin intervenție, ci și prin educație. 
            Aici vizualizăm impactul campaniilor de instruire a populației și structura rețelei de parteneri civili (ONG-uri, mediu privat).
            </span><br><br>
            """, unsafe_allow_html=True)

            p1, p2 = st.columns([1.4, 1])
            
            with p1:
                st.subheader("Campania Națională 'Fii Pregătit'")
                st.markdown("""
                <div style='background-color:rgba(220, 38, 38, 0.1); padding:10px; border-radius:5px; margin-bottom:10px; font-size:0.85rem;'>
                'Fii Pregătit' este platforma oficială de informare a DSU. 
                Caravana SMURD și voluntarii merg în județe pentru a învăța populația tehnici de prim ajutor și reacție la dezastre.
                <br><strong>Harta:</strong> Arată numărul de persoane instruite fizic în fiecare județ raportat în 2024.
                </div>
                """, unsafe_allow_html=True)
                
                if D["instruire"] is not None:
                    # Procesare date
                    df_map = D["instruire"].copy()
                    
                    def extract_code(val):
                        parts = str(val).split()
                        if len(parts) > 1: return parts[-1].upper()
                        return ""
                    
                    df_map['Code'] = df_map['Unitate'].apply(extract_code)
                    df_map['Judet_Map'] = df_map['Code'].map(isu_to_judet)
                    
                    # Merge cu toate judetele pentru contur complet
                    df_full = pd.DataFrame({'Judet_Map': toate_judetele})
                    df_agged = df_map.groupby('Judet_Map')['Total Persoane instruite'].sum().reset_index()
                    final_map_data = pd.merge(df_full, df_agged, on='Judet_Map', how='left').fillna(0)
                    
                    geojson_url = get_romania_geojson()
                    
                    fig_choropleth = px.choropleth(
                        final_map_data,
                        geojson=geojson_url,
                        locations='Judet_Map',
                        featureidkey="properties.name",
                        color='Total Persoane instruite',
                        color_continuous_scale="Reds",
                        range_color=(0, final_map_data[final_map_data['Total Persoane instruite'] > 0]['Total Persoane instruite'].max()),
                        scope="europe", 
                        center={"lat": 46.0, "lon": 25.0},
                        labels={'Total Persoane instruite': 'Persoane instruite'}
                    )
                    
                    fig_choropleth.update_geos(fitbounds="locations", visible=False)
                    fig_choropleth.update_layout(
                        height=550,
                        paper_bgcolor="rgba(0,0,0,0)",
                        geo=dict(bgcolor="rgba(0,0,0,0)"),
                        font=dict(color="white"),
                        margin={"r":0,"t":0,"l":0,"b":0}
                    )
                    st.plotly_chart(fig_choropleth, use_container_width=True)
            
            with p2:
                # --- REDESIGN: Arii de expertiza (Bar Chart in loc de Pie) ---
                st.subheader("Domeniile partenerilor DSU")
                st.markdown("<div style='font-size:0.85rem; color:#94a3b8; margin-bottom:10px;'>În ce domenii activează organizațiile partenere?</div>", unsafe_allow_html=True)
                
                if D["expertiza"] is not None:
                    # Sortam pentru aspect placut
                    df_exp = D["expertiza"].sort_values("Număr organizații", ascending=True)
                    fig_exp = px.bar(
                        df_exp, 
                        x="Număr organizații", 
                        y="Value", 
                        orientation='h', 
                        text="Număr organizații",
                        color="Număr organizații",
                        color_continuous_scale="Reds"
                    )
                    fig_exp.update_traces(textposition='outside')
                    fig_exp.update_layout(
                        height=300, 
                        paper_bgcolor="rgba(0,0,0,0)", 
                        plot_bgcolor="rgba(0,0,0,0)",
                        font=dict(color="white"), 
                        xaxis_title="",
                        yaxis_title="",
                        showlegend=False,
                        coloraxis_showscale=False
                    )
                    st.plotly_chart(fig_exp, use_container_width=True)
                
                st.divider()

                # --- REDESIGN: Protocoale (Area Chart in loc de Tabel) ---
                st.subheader("Dinamica parteneriatelor")
                st.markdown("<div style='font-size:0.85rem; color:#94a3b8; margin-bottom:10px;'>Evoluția semnării de noi protocoale de colaborare cu societatea civilă.</div>", unsafe_allow_html=True)
                
                if D["protocoale"] is not None:
                    fig_proto = px.area(
                        D["protocoale"], 
                        x="An", 
                        y="Situatii",
                        markers=True
                    )
                    fig_proto.update_traces(line_color="#3b82f6", fillcolor="rgba(59, 130, 246, 0.2)")
                    fig_proto.update_layout(
                        height=250, 
                        paper_bgcolor="rgba(0,0,0,0)", 
                        plot_bgcolor="rgba(0,0,0,0)",
                        font=dict(color="white"),
                        xaxis=dict(showgrid=False),
                        yaxis_title="Protocoale Noi",
                        margin={"l":0, "r":0, "b":0, "t":10}
                    )
                    st.plotly_chart(fig_proto, use_container_width=True)


# ---------------------------------
# 6. PAGE: DESPRE PROIECT
# ---------------------------------

elif page == "Despre proiect":
    st.markdown("### Despre acest proiect")

    col1, col2 = st.columns([2, 1])

    with col1:
        st.markdown("""
        <div class="glass-card">
            <div class="info-title" style="font-size: 1.3rem; margin-bottom: 16px;">Ecosistemului de parteneriate DSU</div>
            <div class="info-text" style="font-size: 1rem; line-height: 1.8;">
                Acest proiect oferă o reprezentare vizuală interactivă a rețelei de parteneriate dintre
                Departamentul pentru Situații de Urgență (DSU) și diverse organizații din România.
                <br><br>
                Scopul principal este de a facilita înțelegerea complexității și diversității colaborărilor
                care susțin capacitatea națională de răspuns la situații de urgență.
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="glass-card">
            <div class="info-title" style="font-size: 1.1rem; margin-bottom: 12px;">Obiective</div>
            <div class="info-text">
                <ul style="margin: 0; padding-left: 20px; line-height: 2;">
                    <li>Cartografierea parteneriatelor formale ale DSU</li>
                    <li>Identificarea domeniilor de activitate și a sinergiilor</li>
                    <li>Evidențierea partenerilor strategici și a celor implicați în criza din Ucraina</li>
                    <li>Oferirea unui instrument de analiză pentru decidenți și cercetători</li>
                </ul>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="glass-card">
            <div class="info-title" style="font-size: 1.1rem; margin-bottom: 12px;">Metodologie</div>
            <div class="info-text" style="line-height: 1.8;">
                Datele au fost colectate din surse oficiale și documente publice.
                Fiecare parteneriat a fost clasificat pe domenii de activitate și caracterizat
                în funcție de natura colaborării (strategic, implicare în criza ucraineană etc.).
                <br><br>
                Vizualizarea folosește un graf interactiv care permite explorarea conexiunilor
                dintre parteneri și domeniile lor de activitate.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="partner-card">
            <div class="info-title" style="font-size: 1.1rem; margin-bottom: 16px;">Echipa proiectului</div>
            <div class="info-text" style="line-height: 2;">
                <b>Universitatea de Vest din Timișoara</b><br>
                Facultatea de Științe ale Guvernării și Comunicării
                <br><br>
                <b>Coordonator proiect:</b><br>
                Lect. univ. dr. Silvia Fierăscu
                <br><br>
                <b>Proiect realizat de:</b><br>
                Bogdan Doboșeru<br>
                Laurențiu Florea<br>
                Andrei Galescu<br>
                lexandru Poliac-Seres<br>
                Briana Toader<br>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="glass-card">
            <div class="info-title" style="font-size: 1.1rem; margin-bottom: 12px;">Contact</div>
            <div class="info-text">
                Pentru întrebări sau sugestii:<br>
                <a href="mailto:alexandru.poliac03@e-uvt.ro" style="color: #dc2626;">contact@example.com</a>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="glass-card">
            <div class="info-title" style="font-size: 1.1rem; margin-bottom: 12px;">Versiune</div>
            <div class="info-text">
                v1.0 - Ianuarie 2025<br>
                <span style="font-size: 0.8rem; color: #64748b;">Ultima actualizare a datelor</span>
            </div>
        </div>
        """, unsafe_allow_html=True)