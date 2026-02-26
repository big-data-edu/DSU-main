/* =========================================
   MAIN APPLICATION - Routing, Init, Events
   ========================================= */

import { loadNetworkData, loadStatsData } from './data.js';
import { initNetwork, selectNodeByName } from './network.js';
import { initStatistics } from './statistics.js';
import { initAbout } from './about.js';
import { initKnowledgeGraph } from './knowledge-graph.js';

// Current page state
let currentPage = 'network';
let networkInitialized = false;
let statsInitialized = false;
let aboutInitialized = false;
let kgInitialized = false;

// ---- INITIALIZATION ----

async function init() {
    try {
        // Load data in parallel
        const [networkData, statsData] = await Promise.all([
            loadNetworkData(),
            loadStatsData()
        ]);

        // Initialize network page (default)
        initNetwork(networkData);
        networkInitialized = true;

        // Store stats data for lazy init
        window._statsData = statsData;

        // Initialize about page (lightweight)
        initAbout();
        aboutInitialized = true;

        // Set up navigation
        setupNavigation();

        // Set up mobile menu
        setupMobileNav();

        // Set up filter bar visibility
        setupFilterBarVisibility();

        // Set up theme toggle
        setupTheme();

        // Hide loading screen
        document.getElementById('loading-screen').classList.add('hidden');

        // Handle initial URL hash (deep-linking)
        const { page: initialPage, partner: initialPartner } = parseHash();
        if (initialPage && initialPage !== 'network') {
            navigateTo(initialPage);
        }
        if (initialPartner) {
            setTimeout(() => selectNodeByName(initialPartner), 1200);
        }

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const { page, partner } = parseHash();
            if (page && page !== currentPage) {
                navigateTo(page);
            }
            if (page === 'network' && partner) {
                selectNodeByName(partner);
            }
        });

    } catch (err) {
        console.error('Failed to initialize app:', err);
        document.getElementById('loading-screen').innerHTML = `
            <div class="loader-content">
                <div style="color: #f87171; font-size: 1.1rem; margin-bottom: 12px;">Eroare la incarcarea datelor</div>
                <div style="color: #94a3b8; font-size: 0.85rem;">${err.message}</div>
                <button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;background:#dc2626;border:none;border-radius:8px;color:#fff;cursor:pointer;font-family:inherit">Reincearca</button>
            </div>
        `;
    }
}

// ---- NAVIGATION ----

function setupNavigation() {
    // Desktop nav links
    document.querySelectorAll('#main-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => navigateTo(link.dataset.page));
    });

    // Mobile nav links
    document.querySelectorAll('#mobile-nav-dropdown .mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navigateTo(link.dataset.page);
            closeMobileNav();
        });
    });
}

function navigateTo(page) {
    if (page === currentPage) return;

    // Page exit animation
    const currentEl = document.getElementById(`page-${currentPage}`);
    const nextEl = document.getElementById(`page-${page}`);

    if (currentEl && nextEl) {
        currentEl.classList.add('page-exit');
        setTimeout(() => {
            currentEl.classList.remove('page-exit', 'active');
            finishNavigation(page, nextEl);
        }, 200);
    } else {
        finishNavigation(page, nextEl);
    }
}

function finishNavigation(page, nextEl) {
    currentPage = page;

    // Update URL hash
    history.replaceState(null, '', `#${page}`);

    // Update desktop nav links
    document.querySelectorAll('#main-nav .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Update mobile nav links
    document.querySelectorAll('#mobile-nav-dropdown .mobile-nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Show new page
    if (nextEl) nextEl.classList.add('active');

    // Show/hide filter bar (only on network page)
    updateFilterBarVisibility(page);

    // Show/hide stats overlay
    const statsOverlay = document.getElementById('stats-overlay');
    if (page === 'network') {
        statsOverlay.style.display = '';
    } else {
        statsOverlay.style.display = 'none';
    }

    // Show/hide floating legend
    const legend = document.getElementById('floating-legend');
    if (legend) {
        legend.style.display = page === 'network' ? '' : 'none';
    }

    // Lazy init statistics
    if (page === 'statistics' && !statsInitialized && window._statsData) {
        initStatistics(window._statsData);
        statsInitialized = true;
    }

    // Trigger resize for Plotly charts
    if (page === 'statistics') {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
    }

    // Lazy init knowledge graph
    if (page === 'knowledgegraph' && !kgInitialized) {
        // Wait for page transition + layout to settle before measuring container
        setTimeout(() => {
            initKnowledgeGraph();
            kgInitialized = true;
        }, 400);
    }
}

// ---- FILTER BAR VISIBILITY ----

function setupFilterBarVisibility() {
    updateFilterBarVisibility(currentPage);
}

function updateFilterBarVisibility(page) {
    const filterBar = document.getElementById('filter-bar');
    const mobileFilterPanel = document.getElementById('mobile-filter-panel');
    const appContainer = document.getElementById('app-container');

    if (page === 'network') {
        filterBar.style.display = '';
        document.body.classList.remove('no-filter-bar');
        if (appContainer) {
            appContainer.style.height = '';
            appContainer.style.marginTop = '';
        }
    } else {
        filterBar.style.display = 'none';
        document.body.classList.add('no-filter-bar');
        if (mobileFilterPanel) {
            mobileFilterPanel.classList.add('hidden');
        }
        // Adjust app container when filter bar is hidden
        if (appContainer) {
            appContainer.style.height = 'calc(100vh - var(--header-height))';
            appContainer.style.marginTop = 'var(--header-height)';
        }
    }
}

// ---- MOBILE NAV ----

function setupMobileNav() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const dropdown = document.getElementById('mobile-nav-dropdown');

    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', () => {
        const isOpen = !dropdown.classList.contains('hidden');
        if (isOpen) {
            closeMobileNav();
        } else {
            dropdown.classList.remove('hidden');
            toggle.classList.add('active');
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
            closeMobileNav();
        }
    });
}

function closeMobileNav() {
    const dropdown = document.getElementById('mobile-nav-dropdown');
    const toggle = document.getElementById('mobile-nav-toggle');
    if (dropdown) dropdown.classList.add('hidden');
    if (toggle) toggle.classList.remove('active');
}

// ---- URL HASH ROUTING ----

function parseHash() {
    const hash = location.hash.replace('#', '');
    if (!hash) return { page: 'network', partner: null };

    const parts = hash.split('/');
    const page = parts[0] || 'network';
    const partner = parts.length > 1 ? decodeURIComponent(parts.slice(1).join('/')) : null;

    return { page, partner };
}

// ---- THEME TOGGLE ----

function setupTheme() {
    const saved = localStorage.getItem('dsu-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    updateThemeIcon(btn, saved);

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('dsu-theme', next);
        updateThemeIcon(btn, next);
    });
}

function updateThemeIcon(btn, theme) {
    if (theme === 'dark') {
        // Show sun icon (switch to light)
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
        btn.title = 'Comută la tema deschisă';
    } else {
        // Show moon icon (switch to dark)
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        btn.title = 'Comută la tema întunecată';
    }
}

// ---- START ----

document.addEventListener('DOMContentLoaded', init);
