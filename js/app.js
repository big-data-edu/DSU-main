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
        setupMobileMenu();

        // Hide loading screen
        document.getElementById('loading-screen').classList.add('hidden');

    } catch (err) {
        console.error('Failed to initialize app:', err);
        document.getElementById('loading-screen').innerHTML = `
            <div class="loader-content">
                <div style="color: #f87171; font-size: 1.1rem; margin-bottom: 12px;">Eroare la încărcarea datelor</div>
                <div style="color: #94a3b8; font-size: 0.85rem;">${err.message}</div>
                <button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;background:#dc2626;border:none;border-radius:8px;color:#fff;cursor:pointer;font-family:inherit">Reîncearcă</button>
            </div>
        `;
    }
}

// ---- NAVIGATION ----

function setupNavigation() {
    // Desktop nav buttons
    document.querySelectorAll('#main-nav .nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });

    // Mobile nav buttons
    document.querySelectorAll('#mobile-nav-bar .nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
}

function navigateTo(page) {
    if (page === currentPage) return;
    currentPage = page;

    // Update nav buttons (both desktop and mobile)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    // Show/hide sidebar (only on network page)
    const sidebar = document.getElementById('sidebar');
    if (page === 'network') {
        sidebar.style.display = '';
    } else {
        sidebar.style.display = 'none';
        // Close mobile sidebar if open
        sidebar.classList.remove('open');
        document.getElementById('sidebar-overlay').classList.add('hidden');
    }

    // Show/hide stats overlay
    const statsOverlay = document.getElementById('stats-overlay');
    if (page === 'network') {
        statsOverlay.style.display = '';
    } else {
        statsOverlay.style.display = 'none';
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

    // Close mobile menu
    closeMobileMenu();
}

// ---- MOBILE MENU ----

function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    menuBtn.addEventListener('click', () => {
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
            closeMobileMenu();
        } else {
            sidebar.classList.add('open');
            overlay.classList.remove('hidden');
        }
    });

    overlay.addEventListener('click', closeMobileMenu);
}

function closeMobileMenu() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.add('hidden');
}

// ---- START ----

document.addEventListener('DOMContentLoaded', init);
