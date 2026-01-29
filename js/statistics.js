/* =========================================
   STATISTICS PAGE - Plotly Charts
   ========================================= */

import { ISU_TO_JUDET } from './data.js';

const PLOTLY_LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#cbd5e1', family: 'Nunito, Inter, sans-serif' },
    margin: { l: 50, r: 20, t: 20, b: 50 }
};

const PLOTLY_CONFIG = {
    responsive: true,
    displayModeBar: false
};

export function initStatistics(statsData) {
    setupTabs();
    renderOperational(statsData);
    renderMedical(statsData);
    renderPrevention(statsData);
    renderAdvanced(statsData);
}

function setupTabs() {
    const tabs = document.querySelectorAll('.stats-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');

            // Trigger Plotly resize for the new tab
            setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        });
    });
}

// ==========================================
// TAB 1: OPERATIONAL
// ==========================================
function renderOperational(D) {
    const container = document.getElementById('tab-operational');
    if (!D.interv || !D.apeluri || !D.timp) {
        container.innerHTML = '<p style="color:var(--text-muted)">Datele nu sunt disponibile.</p>';
        return;
    }

    const latestInterv = D.interv[D.interv.length - 1];
    const latestApel = D.apeluri[0]; // sorted descending
    const latestTimp = D.timp[D.timp.length - 1];
    const dailyAvg = Math.round(parseFloat(latestInterv.Interventii) / 365);

    container.innerHTML = `
        <h3 class="stats-section-title">Indicatori de performanță operațională</h3>
        <p class="stats-section-desc">Această secțiune monitorizează volumul total de activitate.
        Comparăm numărul de apeluri primite la 112 cu numărul de intervenții reale efectuate de echipaje (Ambulanță, SMURD, Pompieri).</p>

        <div class="stats-grid">
            <div class="metric-card">
                <div class="metric-label">Total Intervenții (${latestInterv.An})</div>
                <div class="metric-value">${formatNumber(latestInterv.Interventii)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Apeluri 112 (${latestApel.An})</div>
                <div class="metric-value">${formatNumber(latestApel.Apeluri)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Timp mediu de răspuns</div>
                <div class="metric-value">${latestTimp.Minute} min</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Medie zilnică intervenții</div>
                <div class="metric-value">${formatNumber(dailyAvg)}</div>
            </div>
        </div>

        <div class="stats-divider"></div>

        <div class="stats-row">
            <div class="chart-container">
                <h3>Cerere vs. răspuns</h3>
                <p class="chart-desc">Evoluția comparativă a apelurilor de urgență față de intervențiile efective pe ultimii 10 ani.</p>
                <p class="chart-hint">Grafic liniar. Plasați cursorul pe puncte pentru valori exacte.</p>
                <div id="chart-demand-response"></div>
            </div>
            <div class="chart-container">
                <h3>Distribuția misiunilor IGSU</h3>
                <p class="chart-desc">Ce tipuri de urgențe gestionează pompierii și paramedicii? SMURD reprezintă majoritatea covârșitoare.</p>
                <p class="chart-hint">Diagramă circulară. Treceți cu mouse-ul peste felii pentru procente.</p>
                <div id="chart-igsu-pie"></div>
            </div>
        </div>
    `;

    // Chart: Demand vs Response
    const intervYears = D.interv.map(r => r.An);
    const intervVals = D.interv.map(r => parseFloat(r.Interventii));
    const apelSorted = [...D.apeluri].sort((a, b) => parseInt(a.An) - parseInt(b.An));
    const apelYears = apelSorted.map(r => r.An);
    const apelVals = apelSorted.map(r => parseFloat(r.Apeluri));

    Plotly.newPlot('chart-demand-response', [
        { x: intervYears, y: intervVals, name: 'Intervenții Reale', line: { color: '#dc2626', width: 3 }, mode: 'lines+markers' },
        { x: apelYears, y: apelVals, name: 'Apeluri 112', line: { color: '#3b82f6', width: 3 }, mode: 'lines+markers' }
    ], {
        ...PLOTLY_LAYOUT_BASE,
        height: 380,
        legend: { orientation: 'h', y: 1.12, font: { color: '#cbd5e1' } }
    }, PLOTLY_CONFIG);

    // Chart: IGSU pie
    if (D.igsu) {
        const igsuNames = D.igsu.map(r => r['Subcategorie']);
        const igsuVals = D.igsu.map(r => parseFloat(r['Număr']));

        Plotly.newPlot('chart-igsu-pie', [{
            values: igsuVals,
            labels: igsuNames,
            type: 'pie',
            hole: 0.45,
            textposition: 'inside',
            textinfo: 'percent',
            insidetextorientation: 'horizontal',
            marker: {
                colors: ['#dc2626', '#f97316', '#f59e0b', '#3b82f6', '#10b981'],
                line: { color: 'rgba(0,0,0,0.3)', width: 1 }
            }
        }], {
            ...PLOTLY_LAYOUT_BASE,
            height: 380,
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.15,
                x: 0.5,
                xanchor: 'center',
                font: { color: '#cbd5e1', size: 11 }
            },
            margin: { l: 20, r: 20, t: 20, b: 60 }
        }, PLOTLY_CONFIG);
    }
}

// ==========================================
// TAB 2: MEDICAL & AVIATION
// ==========================================
function renderMedical(D) {
    const container = document.getElementById('tab-medical');

    container.innerHTML = `
        <h3 class="stats-section-title">Infrastructura critică: UPU și aviația SMURD</h3>
        <p class="stats-section-desc">Analizăm presiunea asupra spitalelor (prin numărul de pacienți ajunși în Unitățile de Primiri Urgențe)
        și activitatea flotei aeriene de salvare (elicoptere și avioane SMURD).</p>

        <div class="stats-row">
            <div class="chart-container">
                <h3>Fluxul de pacienți în UPU</h3>
                <p class="chart-desc">Volumul total anual de persoane care au necesitat asistență medicală de urgență.</p>
                <p class="chart-hint">Grafic arie. Treceți cu mouse-ul pentru valori pe an.</p>
                <div id="chart-upu"></div>
            </div>
            <div class="chart-container">
                <h3>Activitatea aeriană de salvare</h3>
                <p class="chart-desc">Orele de zbor acumulate anual de IGAV în misiuni medicale și de căutare-salvare.</p>
                <p class="chart-hint">Grafic bare. Treceți cu mouse-ul pe fiecare bară pentru valoare.</p>
                <div id="chart-flight"></div>
            </div>
        </div>
    `;

    // UPU chart
    if (D.upu) {
        const years = D.upu.map(r => r.An);
        const vals = D.upu.map(r => parseFloat(r['Prezentări în UPU']));

        Plotly.newPlot('chart-upu', [{
            x: years, y: vals, type: 'scatter', mode: 'lines',
            fill: 'tozeroy', line: { color: '#10b981' },
            fillcolor: 'rgba(16, 185, 129, 0.2)'
        }], { ...PLOTLY_LAYOUT_BASE, height: 380 }, PLOTLY_CONFIG);
    }

    // Flight hours chart
    if (D.zbor) {
        const years = D.zbor.map(r => r.An);
        const vals = D.zbor.map(r => parseFloat(r['Ore de zbor']));

        Plotly.newPlot('chart-flight', [{
            x: years, y: vals, type: 'bar',
            text: vals.map(v => formatNumber(v)),
            textposition: 'outside',
            textfont: { size: 11 },
            cliponaxis: false,
            marker: { color: '#f59e0b' }
        }], {
            ...PLOTLY_LAYOUT_BASE,
            height: 380,
            yaxis: { showgrid: false, automargin: true },
            margin: { l: 50, r: 20, t: 40, b: 50 }
        }, PLOTLY_CONFIG);
    }
}

// ==========================================
// TAB 3: PREVENTION & PARTNERS
// ==========================================
function renderPrevention(D) {
    const container = document.getElementById('tab-prevention');

    container.innerHTML = `
        <h3 class="stats-section-title">Reziliența comunității și parteneriate</h3>
        <p class="stats-section-desc">Situațiile de urgență nu se gestionează doar prin intervenție, ci și prin educație.
        Aici vizualizăm impactul campaniilor de instruire și structura rețelei de parteneri civili.</p>

        <div class="stats-row-uneven">
            <div class="chart-container">
                <h3>Campania națională 'Fii Pregătit'</h3>
                <div style="background:rgba(220,38,38,0.1);padding:10px;border-radius:5px;margin-bottom:10px;font-size:0.85rem;color:var(--text-secondary)">
                    'Fii Pregătit' este platforma oficială de informare a DSU. Caravana SMURD și voluntarii merg în județe pentru a învăța populația tehnici de prim ajutor.
                    <br><strong>Harta:</strong> Arată numărul de persoane instruite fizic în fiecare județ raportat în 2024.
                </div>
                <p class="chart-hint">Hartă choropleth. Treceți cu mouse-ul peste județe pentru detalii.</p>
                <div id="chart-map"></div>
            </div>
            <div>
                <div class="chart-container" style="margin-bottom:16px">
                    <h3>Domeniile partenerilor DSU</h3>
                    <p class="chart-desc">În ce domenii activează organizațiile partenere?</p>
                    <p class="chart-hint">Bare orizontale. Treceți cu mouse-ul pentru număr.</p>
                    <div id="chart-expertise"></div>
                </div>
                <div class="chart-container">
                    <h3>Dinamica parteneriatelor</h3>
                    <p class="chart-desc">Evoluția semnării de noi protocoale de colaborare cu societatea civilă.</p>
                    <p class="chart-hint">Grafic arie. Treceți cu mouse-ul pentru valorile pe an.</p>
                    <div id="chart-protocols"></div>
                </div>
            </div>
        </div>
    `;

    // Choropleth map
    if (D.instruire) {
        const mapData = {};
        D.instruire.forEach(row => {
            const parts = (row.Unitate || '').split(' ');
            const code = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
            const judet = ISU_TO_JUDET[code];
            if (judet) {
                mapData[judet] = (mapData[judet] || 0) + parseFloat(row['Total Persoane instruite'] || 0);
            }
        });

        const judete = Object.keys(mapData);
        const values = Object.values(mapData);

        Plotly.newPlot('chart-map', [{
            type: 'choropleth',
            geojson: 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/romania.geojson',
            locations: judete,
            z: values,
            featureidkey: 'properties.name',
            colorscale: [
                [0, 'rgba(254, 226, 226, 0.6)'],
                [0.25, 'rgba(252, 165, 165, 0.7)'],
                [0.5, 'rgba(248, 113, 113, 0.8)'],
                [0.75, 'rgba(220, 38, 38, 0.9)'],
                [1, 'rgba(153, 27, 27, 1)']
            ],
            marker: { line: { width: 1, color: 'rgba(255,255,255,0.4)' } },
            colorbar: {
                title: 'Persoane',
                font: { color: '#cbd5e1' },
                tickfont: { color: '#cbd5e1' },
                len: 0.5,
                thickness: 12,
                x: 1.0,
                bgcolor: 'rgba(0,0,0,0)'
            }
        }], {
            ...PLOTLY_LAYOUT_BASE,
            height: 420,
            geo: {
                fitbounds: 'locations',
                visible: false,
                bgcolor: 'rgba(0,0,0,0)',
                projection: { type: 'mercator' }
            },
            margin: { l: 0, r: 60, t: 10, b: 10 }
        }, PLOTLY_CONFIG);
    }

    // Expertise bar chart
    if (D.expertiza) {
        const sorted = [...D.expertiza].sort((a, b) => parseFloat(a['Număr organizații']) - parseFloat(b['Număr organizații']));
        Plotly.newPlot('chart-expertise', [{
            x: sorted.map(r => parseFloat(r['Număr organizații'])),
            y: sorted.map(r => r.Value),
            type: 'bar',
            orientation: 'h',
            text: sorted.map(r => r['Număr organizații']),
            textposition: 'outside',
            textfont: { size: 11 },
            cliponaxis: false,
            marker: {
                color: sorted.map(r => parseFloat(r['Număr organizații'])),
                colorscale: 'Reds'
            }
        }], {
            ...PLOTLY_LAYOUT_BASE,
            height: 250,
            xaxis: { title: '', automargin: true },
            yaxis: { title: '', automargin: true },
            showlegend: false,
            margin: { l: 160, r: 60, t: 10, b: 30 }
        }, PLOTLY_CONFIG);
    }

    // Protocols area chart
    if (D.protocoale) {
        const sorted = [...D.protocoale].sort((a, b) => parseInt(a.An) - parseInt(b.An));
        Plotly.newPlot('chart-protocols', [{
            x: sorted.map(r => r.An),
            y: sorted.map(r => parseFloat(r.Situatii)),
            type: 'scatter',
            mode: 'lines+markers',
            fill: 'tozeroy',
            line: { color: '#3b82f6' },
            fillcolor: 'rgba(59, 130, 246, 0.2)'
        }], {
            ...PLOTLY_LAYOUT_BASE,
            height: 220,
            yaxis: { title: 'Protocoale Noi' },
            xaxis: { showgrid: false },
            margin: { l: 50, r: 10, t: 10, b: 40 }
        }, PLOTLY_CONFIG);
    }
}

// ==========================================
// TAB 4: ADVANCED ANALYTICS
// ==========================================
function renderAdvanced(D) {
    const container = document.getElementById('tab-advanced');

    container.innerHTML = `
        <h3 class="stats-section-title">Analize avansate și vizualizări speciale</h3>
        <p class="stats-section-desc">Fluxul operațional de intervenție, anatomia timpului de răspuns, sancțiuni și control, ierarhia de comandă și evoluția istorică.</p>

        <!-- Sankey -->
        <div class="chart-container" style="margin-bottom:24px">
            <h3>Fluxul operațional de intervenție</h3>
            <p class="chart-desc">Traseul informațional și decizional de la apelul 112 până la finalizarea misiunii.</p>
            <p class="chart-hint">Diagramă Sankey. Treceți cu mouse-ul peste legături pentru detalii.</p>
            <div id="chart-sankey"></div>
        </div>

        <div class="stats-row">
            <!-- Response time breakdown -->
            <div class="chart-container">
                <h3>Anatomia timpului de răspuns</h3>
                <p class="chart-desc">Analiza detaliată a etapelor operaționale care compun media de intervenție.</p>
                <p class="chart-hint">Bare stivuite. Treceți cu mouse-ul pe segmente pentru durata fiecărei etape.</p>
                <div id="chart-response-time"></div>
                <div id="response-time-total" style="text-align:center;margin-top:10px"></div>
            </div>
            <!-- Sanctions -->
            <div class="chart-container">
                <h3>Control și legalitate</h3>
                <p class="chart-desc">Topul neregulilor constatate și sancțiunile aplicate operatorilor economici în 2024.</p>
                <p class="chart-hint">Bare orizontale. Treceți cu mouse-ul pentru detalii.</p>
                <div id="chart-sanctions"></div>
            </div>
        </div>

        <div class="stats-divider"></div>

        <div class="stats-row">
            <!-- Command hierarchy (treemap) -->
            <div class="chart-container">
                <h3>Ierarhia de comandă și control</h3>
                <p class="chart-desc">Structura decizională a Sistemului Național de Management al Situațiilor de Urgență.</p>
                <p class="chart-hint">Treemap. Treceți cu mouse-ul pe casete pentru denumire completă.</p>
                <div id="chart-treemap"></div>
            </div>
            <!-- Timeline -->
            <div class="chart-container">
                <h3>Repere istorice și evoluție legislativă</h3>
                <p class="chart-desc">Cronologia evenimentelor majore care au definit sistemul actual de urgență (1990 – 2024).</p>
                <p class="chart-hint">Timeline. Treceți cu mouse-ul peste puncte pentru detalii.</p>
                <div id="chart-timeline"></div>
                <div id="timeline-legend" style="margin-top:10px"></div>
            </div>
        </div>
    `;

    renderSankey(D);
    renderResponseTime(D);
    renderSanctions(D);
    renderTreemap(D);
    renderTimeline(D);
}

function renderSankey(D) {
    if (!D.flux) return;

    const allNodes = [...new Set([...D.flux.map(r => r.Sursa), ...D.flux.map(r => r.Destinatar)])];
    const nodeIdx = {};
    allNodes.forEach((n, i) => nodeIdx[n] = i);

    const nNodes = allNodes.length;
    const nodeColors = allNodes.map((_, i) => {
        const ratio = i / Math.max(nNodes - 1, 1);
        const r = Math.round(220 - ratio * 100);
        const g = Math.round(38 + ratio * 60);
        const b = Math.round(38 + ratio * 60);
        return `rgb(${r},${g},${b})`;
    });

    Plotly.newPlot('chart-sankey', [{
        type: 'sankey',
        node: {
            pad: 15, thickness: 20,
            line: { color: 'rgba(255,255,255,0.3)', width: 0.5 },
            label: allNodes,
            color: nodeColors
        },
        link: {
            source: D.flux.map(r => nodeIdx[r.Sursa]),
            target: D.flux.map(r => nodeIdx[r.Destinatar]),
            value: D.flux.map(() => 1),
            color: 'rgba(220, 38, 38, 0.4)',
            customdata: D.flux.map(r => r.Actiune),
            hovertemplate: '%{source.label} → %{target.label}<br><b>%{customdata}</b><extra></extra>'
        }
    }], {
        ...PLOTLY_LAYOUT_BASE,
        height: 380,
        margin: { l: 20, r: 20, t: 20, b: 20 }
    }, PLOTLY_CONFIG);
}

function renderResponseTime(D) {
    if (!D.timpi) return;

    const stages = D.timpi.filter(r => r.Tip !== 'Total');
    const colorMap = {
        'Preluare Apel': '#fdba74',
        'Alertare Resurse': '#fb923c',
        'Pregatire Echipaj': '#f97316',
        'Deplasare la Caz': '#dc2626'
    };

    const traces = stages.map(row => ({
        y: ['Timp Total'],
        x: [parseFloat(row.Durata_Min)],
        name: row.Etapa,
        type: 'bar',
        orientation: 'h',
        marker: { color: colorMap[row.Etapa] || '#f97316', line: { color: 'rgba(0,0,0,0.3)', width: 1 } },
        text: [`${row.Durata_Min} min`],
        textposition: 'inside',
        insidetextanchor: 'middle',
        hovertemplate: `<b>${row.Etapa}</b><br>${row.Durata_Min} minute<extra></extra>`
    }));

    Plotly.newPlot('chart-response-time', traces, {
        ...PLOTLY_LAYOUT_BASE,
        barmode: 'stack',
        height: 160,
        showlegend: true,
        legend: { orientation: 'h', y: 1.2, x: 0.5, xanchor: 'center', font: { color: '#cbd5e1' } },
        xaxis: { title: 'Minute' },
        yaxis: { showticklabels: false },
        margin: { l: 10, r: 20, t: 40, b: 40 }
    }, PLOTLY_CONFIG);

    const total = D.timpi.find(r => r.Tip === 'Total');
    if (total) {
        document.getElementById('response-time-total').innerHTML =
            `<span style="font-size:1.5rem;font-weight:700;color:#dc2626">${total.Durata_Min} minute</span>
             <span style="font-size:0.9rem;color:var(--text-muted)"> – Timp mediu total de răspuns</span>`;
    }
}

function renderSanctions(D) {
    if (!D.sanctiuni) return;

    const sorted = [...D.sanctiuni].sort((a, b) => parseFloat(a.Numar) - parseFloat(b.Numar));

    Plotly.newPlot('chart-sanctions', [{
        x: sorted.map(r => parseFloat(r.Numar)),
        y: sorted.map(r => r.Tip_Incalcare),
        type: 'bar',
        orientation: 'h',
        text: sorted.map(r => formatNumber(r.Numar)),
        textposition: 'outside',
        textfont: { size: 11 },
        cliponaxis: false,
        marker: {
            color: sorted.map(r => parseFloat(r.Numar)),
            colorscale: [['0', '#fecaca'], ['0.33', '#f87171'], ['0.66', '#dc2626'], ['1', '#991b1b']]
        },
        customdata: sorted.map(r => [r.Valoare_RON, r.Top_Judet]),
        hovertemplate: '<b>%{y}</b><br>Sancțiuni: %{x}<br>Valoare: %{customdata[0]} RON<br>Top județ: %{customdata[1]}<extra></extra>'
    }], {
        ...PLOTLY_LAYOUT_BASE,
        height: 320,
        xaxis: { title: 'Număr sancțiuni', automargin: true },
        yaxis: { title: '', automargin: true },
        showlegend: false,
        margin: { l: 180, r: 80, t: 10, b: 50 }
    }, PLOTLY_CONFIG);
}

function renderTreemap(D) {
    if (!D.comanda) return;

    const allSuperiors = new Set(D.comanda.map(r => r.Superior));
    const allSubordinates = new Set(D.comanda.map(r => r.Subordonat));
    const root = [...allSuperiors].find(s => !allSubordinates.has(s));

    const labels = [root];
    const parents = [''];
    const colors = ['#dc2626'];

    const colorMap = {
        'Strategic': '#dc2626', 'Decizional': '#f97316', 'Operational': '#f59e0b',
        'Coordonare': '#fbbf24', 'Comanda': '#fcd34d', 'Executie': '#fef3c7'
    };

    D.comanda.forEach(row => {
        if (!labels.includes(row.Subordonat)) {
            labels.push(row.Subordonat);
            parents.push(row.Superior);
            colors.push(colorMap[row.Tip_Relatie] || '#fef3c7');
        }
    });

    // Compute text color per cell
    const textColors = colors.map(c => {
        const hex = c.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65 ? '#1f2937' : '#ffffff';
    });

    Plotly.newPlot('chart-treemap', [{
        type: 'treemap',
        labels, parents,
        marker: { colors, line: { color: 'rgba(0,0,0,0.5)', width: 2 } },
        textinfo: 'label',
        textfont: { size: 12, color: textColors },
        hovertemplate: '<b>%{label}</b><extra></extra>',
        root: { color: 'rgba(0,0,0,0)' }
    }], {
        ...PLOTLY_LAYOUT_BASE,
        height: 400,
        margin: { l: 10, r: 10, t: 10, b: 10 }
    }, PLOTLY_CONFIG);
}

function renderTimeline(D) {
    if (!D.timeline) return;

    const tipColors = {
        'Legislativ': '#dc2626', 'Organizational': '#f97316', 'International': '#3b82f6',
        'Tehnologic': '#10b981', 'Operational': '#8b5cf6', 'Logistic': '#f59e0b', 'Strategic': '#ec4899'
    };

    const traces = [];

    // Base line
    const years = D.timeline.map(r => parseInt(r.An));
    traces.push({
        x: [Math.min(...years) - 2, Math.max(...years) + 2],
        y: [0, 0],
        mode: 'lines',
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        hoverinfo: 'skip',
        showlegend: false
    });

    // Event markers
    D.timeline.forEach((row, i) => {
        const color = tipColors[row.Tip] || '#94a3b8';
        traces.push({
            x: [parseInt(row.An)],
            y: [0],
            mode: 'markers',
            marker: { size: 20, color, line: { color: '#fff', width: 2 } },
            hovertemplate: `<b>${row.An}</b><br>${row.Eveniment}<br><i>${row.Descriere}</i><extra></extra>`,
            showlegend: false
        });
    });

    const annotations = D.timeline.map((row, i) => {
        const yPos = i % 2 === 0 ? 0.95 : -0.95;
        const label = row.Eveniment.length > 20 ? row.Eveniment.substring(0, 18) + '...' : row.Eveniment;
        return {
            x: parseInt(row.An),
            y: yPos,
            text: `<b>${row.An}</b><br>${label}`,
            showarrow: false,
            font: { size: 11, color: '#fff' },
            align: 'center',
            bgcolor: 'rgba(0,0,0,0.6)',
            bordercolor: 'rgba(255,255,255,0.25)',
            borderwidth: 1,
            borderpad: 6
        };
    });

    // Dotted lines from point to label
    D.timeline.forEach((row, i) => {
        const yPos = i % 2 === 0 ? 0.95 : -0.95;
        traces.push({
            x: [parseInt(row.An), parseInt(row.An)],
            y: [0, yPos * 0.6],
            mode: 'lines',
            line: { color: tipColors[row.Tip] || '#94a3b8', width: 1, dash: 'dot' },
            hoverinfo: 'skip',
            showlegend: false
        });
    });

    Plotly.newPlot('chart-timeline', traces, {
        ...PLOTLY_LAYOUT_BASE,
        height: 380,
        annotations,
        xaxis: { showgrid: false, zeroline: false, showticklabels: false },
        yaxis: { showgrid: false, zeroline: false, showticklabels: false, range: [-1.8, 1.8] },
        showlegend: false,
        margin: { l: 20, r: 20, t: 10, b: 10 }
    }, PLOTLY_CONFIG);

    // Legend
    const legendEl = document.getElementById('timeline-legend');
    let legendHtml = '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">';
    for (const [tip, color] of Object.entries(tipColors)) {
        legendHtml += `<span style="display:inline-flex;align-items:center;gap:5px">
            <span style="width:12px;height:12px;background:${color};border-radius:50%;display:inline-block"></span>
            <span style="font-size:0.75rem;color:#cbd5e1">${tip}</span>
        </span>`;
    }
    legendHtml += '</div>';
    legendEl.innerHTML = legendHtml;
}

// Utility
function formatNumber(n) {
    return parseInt(n).toLocaleString('ro-RO');
}
