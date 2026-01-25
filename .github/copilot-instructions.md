# Copilot instructions for DSU

## Project overview
- This is a single-page Streamlit app in `app.py` that renders three pages via a header `st.radio`: **Rețea parteneri**, **Statistici**, **Despre proiect**.
- The app is highly CSS‑driven: large inline `<style>` blocks shape layout, mobile behavior, and a sticky header.

## Data & assets
- Partner network data loads from root `data.csv` (not the `data/` folder). The `load_data()` function expects columns like `Partner`, `Domain_Raw`, `Ukraine`, `Strategic`, `Description`.
- Optional enrichment: `membrii_fonss.csv` is used to attach FONSS members under `FONSS_PARENT_NAME` in `load_data()`.
- Statistics pages read CSVs from `data/` (e.g. `interventii_ambulanta.csv`, `apeluri_urgenta.csv`, `timp_raspuns.csv`, `situatii_igsu.csv`, `arii_expertiza.csv`, etc.) via `load_all_stats()`.
- Logos are loaded as base64 from `logos/dsu.png`, `logos/uvt.png`, `logos/fsgc.png` using `get_base64_image()`.

## Key flows & patterns
- Network graph nodes/edges are computed in `load_data()` and cached with `@st.cache_data`; domains are normalized via `clean_domains()` + `map_domain_category()`.
- Partner type coloring is derived from name patterns in `ENTITY_TYPES`; keep this logic in `classify_entity_type()` / `get_entity_color()`.
- Filters and selected state live in `st.session_state` (`selected_id`, `filter_domains`, `special_filter`, `entity_filter`).
- The Stats page uses Plotly (`px`/`go`) and a remote Romania GeoJSON URL in `get_romania_geojson()`.

## Developer workflow
- Install dependencies from `requirements.txt` (`streamlit`, `pandas`, `streamlit-agraph`).
- Run from repo root so relative data paths resolve:
  - `streamlit run app.py`

## Conventions specific to this repo
- Keep the app as a single-file Streamlit script (`app.py`) unless explicitly asked to refactor.
- Preserve the inline CSS blocks; many layout behaviors rely on specific selectors and media queries.
- When editing data logic, ensure `data.csv` and `data/` paths remain relative (no absolute paths).
