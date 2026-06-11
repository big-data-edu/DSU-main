/* =========================================
   SHARED HELPERS for the two D3 network views
   (network.js — partners ↔ domains, network2.js — ONG ↔ ISU)
   ========================================= */

// Escape user/CSV-provided strings before injecting them into innerHTML
export function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Shorten long labels with an ellipsis
export function truncate(str, max) {
    return str.length > max ? str.substring(0, max - 2) + '…' : str;
}

// Position a cursor-following tooltip, flipped when near the container edges
export function moveTooltip(event, el, container) {
    const rect = container.getBoundingClientRect();
    let x = event.clientX - rect.left + 14;
    let y = event.clientY - rect.top - 10;
    if (x + 260 > rect.width) x = event.clientX - rect.left - 260;
    if (y + 100 > rect.height) y = event.clientY - rect.top - 100;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
}

// Compute the d3.zoom transform that fits the given (positioned) nodes into a
// width×height viewport. offsetX shifts the focus left so a cluster is not
// hidden behind the right-docked detail panel on desktop. Returns null when
// there is nothing to fit (caller should skip the transition).
export function fitTransform(nodes, width, height, { padding = 60, maxScale = 1, offsetX = 0 } = {}) {
    const positioned = nodes.filter(n => n.x !== undefined);
    if (positioned.length === 0 || !width || !height) return null;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positioned.forEach(n => {
        minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
    });
    minX -= padding; maxX += padding;
    minY -= padding; maxY += padding;

    const scale = Math.min(width / (maxX - minX), height / (maxY - minY), maxScale);
    if (!isFinite(scale) || scale <= 0) return null;

    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    return d3.zoomIdentity
        .translate(width / 2 - offsetX - cx * scale, height / 2 - cy * scale)
        .scale(scale);
}

// Serialize an SVG with a solid dark background and trigger a download
export function downloadSvg(svgNode, width, height, filename) {
    const clone = svgNode.cloneNode(true);
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', width);
    bg.setAttribute('height', height);
    bg.setAttribute('fill', '#0a0e1a');
    clone.insertBefore(bg, clone.firstChild);

    // Fonts are not embedded in the export, so give text a safe fallback
    clone.querySelectorAll('text').forEach(el => {
        if (!el.style.fontFamily) el.style.fontFamily = 'sans-serif';
    });

    const svgString = '<?xml version="1.0" encoding="UTF-8"?>' + new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
