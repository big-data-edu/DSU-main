/* =========================================
   ABOUT PAGE
   ========================================= */

export function initAbout() {
    const container = document.getElementById('about-content');

    container.innerHTML = `
        <h2 class="page-title">Despre acest proiect</h2>

        <div class="about-grid">
            <div>
                <div class="about-card">
                    <div class="card-title">Ecosistemul de parteneriate DSU</div>
                    <div class="card-text">
                        Acest proiect oferă o reprezentare vizuală interactivă a rețelei de parteneriate dintre
                        Departamentul pentru Situații de Urgență (DSU) și diverse organizații din România.
                        <br><br>
                        În plus, secțiunea de statistici aduce o imagine de ansamblu asupra activității DSU,
                        prin indicatori operaționali, medicali, de prevenire și analize avansate. Graficele sunt
                        gândite pentru a fi ușor de explorat și de înțeles de către cetățeni.
                    </div>
                </div>

                <div class="about-card">
                    <div class="card-title">Obiective</div>
                    <div class="card-text">
                        <ul>
                            <li>Cartografierea parteneriatelor formale ale DSU</li>
                            <li>Identificarea domeniilor de activitate și a sinergiilor</li>
                            <li>Evidențierea partenerilor strategici și a celor implicați în criza din Ucraina</li>
                            <li>Oferirea unui instrument de analiză pentru decidenți și cercetători</li>
                        </ul>
                    </div>
                </div>

                <div class="about-card">
                    <div class="card-title">Metodologie</div>
                    <div class="card-text">
                        Datele au fost colectate din surse oficiale și documente publice.
                        Fiecare parteneriat a fost clasificat pe domenii de activitate și caracterizat
                        în funcție de natura colaborării (strategic, implicare în criza ucraineană etc.).
                        <br><br>
                        Vizualizarea folosește un graf interactiv care permite explorarea conexiunilor
                        dintre parteneri și domeniile lor de activitate.
                    </div>
                </div>
            </div>

            <div>
                <div class="about-team-card">
                    <div class="card-title">Echipa proiectului</div>
                    <div class="card-text">
                        <strong>Universitatea de Vest din Timișoara</strong><br>
                        Facultatea de Științe ale Guvernării și Comunicării
                        <br><br>
                        <strong>Coordonator proiect:</strong><br>
                        Lect. univ. dr. Silvia Fierăscu
                        <br><br>
                        <strong>Proiect realizat de:</strong><br>
                        Bogdan Doboșeru<br>
                        Laurențiu Florea<br>
                        Andrei Galescu<br>
                        Alexandru Poliac-Seres<br>
                        Briana Toader
                    </div>
                </div>

                <div class="about-card">
                    <div class="card-title">Contact</div>
                    <div class="card-text">
                        Pentru întrebări sau sugestii:<br>
                        <a href="mailto:alexandru.poliac03@e-uvt.ro" style="color: var(--accent); text-decoration: none;">alexandru.poliac03@e-uvt.ro</a>
                    </div>
                </div>

                <div class="about-card">
                    <div class="card-title">Versiune</div>
                    <div class="card-text">
                        v2.0 – Ianuarie 2025<br>
                        <span style="font-size: 0.82rem; color: var(--text-dim);">Ultima actualizare a datelor</span>
                    </div>
                </div>

                <div class="about-card">
                    <div class="card-title">Tehnologii utilizate</div>
                    <div class="card-text">
                        <strong>Vizualizare graf:</strong> D3.js v7<br>
                        <strong>Grafice statistice:</strong> Plotly.js<br>
                        <strong>Interfață:</strong> Vanilla JavaScript<br>
                        <strong>Stilizare:</strong> CSS3 modern<br>
                        <strong>Date:</strong> CSV / JSON static
                    </div>
                </div>
            </div>
        </div>
    `;
}
