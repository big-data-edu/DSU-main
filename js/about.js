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

                <div class="about-card">
                    <div class="card-title">Surse și date</div>
                    <div class="card-text">
                        <p style="margin-bottom: 14px; line-height: 1.7;">
                            Datele utilizate în această aplicație au fost furnizate de către Departamentul pentru
                            Situații de Urgență (DSU) sau extrase manual din diverse acte normative, rapoarte oficiale
                            și articole de presă, în scopul simplificării și accesibilizării informațiilor pentru publicul larg.
                        </p>

                        <div style="margin-bottom:16px; padding:12px; background:rgba(220,38,38,0.08); border-radius:8px; border:1px solid rgba(220,38,38,0.2); text-align:center;">
                            <img src="logos/dsu.png" alt="DSU" style="height:56px; border-radius:6px; margin-bottom:8px;"><br>
                            <span style="font-size:0.82rem; color:var(--text-muted);">Departamentul pentru Situații de Urgență</span>
                        </div>

                        <div class="source-category">
                            <div class="source-category-title">Hotărâri CNSU</div>
                            <a class="source-link" href="https://www.dsu.mai.gov.ro/legislatie-hotarari" target="_blank">dsu.mai.gov.ro/legislatie-hotarari</a>
                            <a class="source-link" href="https://isubif.ro/local/hotarari-ale-cnsu/" target="_blank">isubif.ro/local/hotarari-ale-cnsu</a>
                        </div>

                        <div class="source-category">
                            <div class="source-category-title">Știri</div>
                            <a class="source-link" href="https://adevarul.ro/politica/un-an-razboi-ucraina-romania-gestionat-situatia-2244909.html" target="_blank">Adevărul &ndash; Un an de război: România și gestionarea situației</a>
                            <a class="source-link" href="https://romania.europalibera.org/a/consiliul-fiscal-romania-a-sprijinit-ucraina-cu-1-5-miliarde-de-euro-de-la-inceputul-razboiului/33520491.html" target="_blank">Europa Liberă &ndash; România a sprijinit Ucraina cu 1.5 mld EUR</a>
                            <a class="source-link" href="https://euneighbourseast.eu/ro/news/explainers/cum-ajuta-ue-ucraina-de-la-sanctiuni-la-ajutor-militar-si-umanitar/" target="_blank">EU Neighbours East &ndash; Cum ajută UE Ucraina</a>
                        </div>

                        <div class="source-category">
                            <div class="source-category-title">Cifre</div>
                            <a class="source-link" href="https://expertforum.ro/wp-content/uploads/2023/07/Problemele-refugiatilor-ucrainieni.pdf" target="_blank">Expert Forum &ndash; Problemele refugiaților ucraineni (PDF)</a>
                            <a class="source-link" href="https://protectieucraina.gov.ro/1/analize-si-statistici/" target="_blank">protectieucraina.gov.ro &ndash; Analize și statistici</a>
                            <a class="source-link" href="https://cdmir.ro/2023/08/03/analiza-cdmir/" target="_blank">CDMIR &ndash; Analiză</a>
                        </div>

                        <div class="source-category">
                            <div class="source-category-title">Raport de activitate DSU</div>
                            <a class="source-link" href="https://www.dsu.mai.gov.ro/rapoarte-de-activitate/" target="_blank">dsu.mai.gov.ro/rapoarte-de-activitate</a>
                        </div>

                        <div class="source-category">
                            <div class="source-category-title">Situația refugiaților (date și grafice)</div>
                            <a class="source-link" href="https://data.unhcr.org/en/documents/details/114603" target="_blank">UNHCR &ndash; Documente</a>
                            <a class="source-link" href="https://data.unhcr.org/en/situations/ukraine/location/10782" target="_blank">UNHCR &ndash; Situația Ucraina / România</a>
                        </div>

                        <div class="source-category">
                            <div class="source-category-title">Cheltuieli</div>
                            <a class="source-link" href="https://mfe.gov.ro/contract-de-finantare-de-100-de-milioane-de-euro-pentru-decontarea-cheltuielilor-cu-asistenta-acordata-refugiatilor-din-ucraina-semnat-intre-mipe-si-mai/" target="_blank">MFE &ndash; Contract de finanțare 100 mil EUR pentru refugiați</a>
                        </div>

                        <div class="source-category">
                            <div class="source-category-title">Altele</div>
                            <a class="source-link" href="https://www.consilium.europa.eu/ro/policies/eu-solidarity-ukraine/" target="_blank">Consiliul European &ndash; Solidaritatea UE cu Ucraina</a>
                            <a class="source-link" href="https://sgg.gov.ro/1/wp-content/uploads/2022/05/Raport-Resurse-refugiati-Ucraina.pdf" target="_blank">SGG &ndash; Raport resurse refugiați Ucraina (PDF)</a>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div class="about-team-card">
                    <div class="card-title">Parteneri instituționali</div>
                    <div class="card-text">
                        <a href="https://www.dsu.mai.gov.ro" target="_blank">Departamentul pentru Situații de Urgență</a><br>
                        <a href="https://www.uvt.ro" target="_blank">Universitatea de Vest din Timișoara</a>
                        (<a href="https://fsgc.uvt.ro" target="_blank">Facultatea de Științe ale Guvernării și Comunicării</a>)
                    </div>

                    <div class="about-logos" style="margin-top: 12px; margin-bottom: 16px;">
                        <a href="https://www.dsu.mai.gov.ro" target="_blank" title="DSU">
                            <img src="logos/dsu.png" alt="DSU">
                        </a>
                        <a href="https://www.uvt.ro" target="_blank" title="Universitatea de Vest din Timișoara">
                            <img src="logos/uvt.png" alt="UVT">
                        </a>
                    </div>

                    <div style="border-top: 1px solid var(--border-subtle); padding-top: 14px; margin-top: 14px;">
                        <div style="font-weight: 600; color: var(--accent-light); margin-bottom: 8px;">Proiect realizat de:</div>
                        <div class="card-text">
                            <a href="https://connectm.uvt.ro" target="_blank">Social Fabrics Research Lab</a> (FabLab)
                        </div>
                    </div>

                    <div style="border-top: 1px solid var(--border-subtle); padding-top: 14px; margin-top: 14px;">
                        <div style="font-weight: 600; color: var(--accent-light); margin-bottom: 8px;">Echipa:</div>
                        <div class="card-text">
                            <strong>Silvia Fierăscu</strong> (coordonator)<br>
                            <strong>Bogdan Doboșeru</strong> (date)<br>
                            <strong>Laurențiu Florea</strong> (date)<br>
                            <strong>Andrei Galescu</strong> (date)<br>
                            <strong>Alexandru Poliac-Seres</strong> (webdev)<br>
                            <strong>Briana Toader</strong> (grafică)
                        </div>
                    </div>
                </div>

                <div class="about-card">
                    <div class="card-title">Versiune</div>
                    <div class="card-text">
                        v0.2 &ndash; Ianuarie 2026<br>
                        <span style="font-size: 0.82rem; color: var(--text-dim);">Ultima actualizare a datelor</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}
