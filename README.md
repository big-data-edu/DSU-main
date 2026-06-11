# Ecosistemul Partenerilor DSU

Platformă web interactivă care cartografiază rețeaua de parteneriate a
**Departamentului pentru Situații de Urgență (DSU)** din România și prezintă
statistici despre activitatea sa operațională.

**Demo live:** https://big-data-edu.github.io/DSU-main/

## Secțiuni

| Secțiune | Conținut |
|---|---|
| **Rețea parteneri** | Graf interactiv (D3.js) cu ~65 de organizații partenere ale DSU, grupate pe domenii de activitate, cu căutare și filtre (tip organizație, domeniu, parteneri strategici, sprijin Ucraina) |
| **Rețea operațională** | Graf bipartit: 256 de ONG-uri ↔ 34 de inspectorate județene (ISU), pe baza colaborărilor din pandemie și din criza refugiaților din Ucraina |
| **Statistici** | „DSU în cifre": intervenții, apeluri 112, timpi de răspuns, activitate medicală și aeriană, prevenire, analize avansate (Plotly.js) |
| **Despre proiect** | Metodologie, surse de date, echipă |

## Rulare locală

Aplicația este complet statică (fără backend, fără build). Este nevoie doar de
un server HTTP local pentru ca `fetch()` să poată citi fișierele CSV:

```bash
python3 -m http.server 8000
# apoi deschide http://localhost:8000
```

## Tehnologii

- JavaScript (module ES6), HTML5, CSS3 — fără framework, fără pas de build
- [D3.js v7](https://d3js.org/) — grafurile de rețea
- [Plotly.js](https://plotly.com/javascript/) — graficele statistice și harta choropleth

## Structura datelor

- `data.csv` — partenerii DSU (domenii, parteneri strategici, sprijin Ucraina)
- `data_retea2_isu.csv` — colaborările operaționale ONG ↔ ISU
- `membrii_fonss.csv` — membrii federației FONSS
- `data/*.csv` — seturile de date pentru statistici
- `data/romania.geojson` — contururile județelor pentru harta choropleth
- `data/surse-xlsx/` — fișierele-sursă brute din care au fost extrase CSV-urile

## Echipă

Proiect realizat în cadrul [Social Fabrics Research Lab](https://connectm.uvt.ro)
(FabLab), Universitatea de Vest din Timișoara — Facultatea de Științe ale
Guvernării și Comunicării, cu sprijinul DSU pentru furnizarea datelor.

- Silvia Fierăscu (coordonator)
- Bogdan Doboșeru, Laurențiu Florea, Andrei Galescu (date)
- Alexandru Poliac-Seres (dezvoltare web)
- Briana Toader (grafică)

## Licență

[Apache 2.0](LICENSE)
