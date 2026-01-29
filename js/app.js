/* =========================================
   MAIN APPLICATION - Routing, Init, Events
   ========================================= */

import { loadNetworkData, loadStatsData } from './data.js';
import { initNetwork } from './network.js';
import { initStatistics } from './statistics.js';
import { initAbout } from './about.js';

// Current page state
let currentPage = 'network';
let networkInitialized = false;
let statsInitialized = false;
let aboutInitialized = false;

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

        // Hide loading screen
        document.getElementById('loading-screen').classList.add('hidden');

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
    currentPage = page;

    // Update desktop nav links
    document.querySelectorAll('#main-nav .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Update mobile nav links
    document.querySelectorAll('#mobile-nav-dropdown .mobile-nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

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

    // Show/hide nav help
    const navHelp = document.getElementById('nav-help-btn');
    if (navHelp) {
        navHelp.style.display = page === 'network' ? '' : 'none';
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

// ---- START ----

document.addEventListener('DOMContentLoaded', init);
