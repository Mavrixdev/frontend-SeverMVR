// ========================================
// DOCS PAGE FUNCTIONALITY
// ========================================

/**
 * Handle test button clicks - redirect to home with API URL
 */
function handleTestButtonClick(event) {
    const button = event.currentTarget;
    const apiUrl = button.getAttribute('data-url');

    if (apiUrl) {
        // Store the API URL in sessionStorage to pass to home page
        sessionStorage.setItem('apiToTest', apiUrl);

        // Redirect to home page
        window.location.href = 'index.html';
    }
}

/**
 * Render a single endpoint card
 */
function renderEndpointCard(endpoint, baseUrl) {
    const container = document.createElement('div');
    container.className = 'endpoint-card glass-card';

    const badge = document.createElement('div');
    badge.className = 'endpoint-badge';
    badge.textContent = endpoint.title || endpoint.path;
    container.appendChild(badge);

    const header = document.createElement('div');
    header.className = 'endpoint-header';

    const method = document.createElement('div');
    method.className = 'endpoint-method method-get';
    method.textContent = (endpoint.method || 'GET').toUpperCase();
    header.appendChild(method);

    const title = document.createElement('h3');
    title.className = 'endpoint-title';
    title.textContent = endpoint.title || endpoint.path;
    header.appendChild(title);

    const btn = document.createElement('button');
    btn.className = 'test-btn';
    btn.setAttribute('data-url', (baseUrl || getDefaultBase()) + endpoint.path);
    btn.innerHTML = '<span>Test API</span><span class="btn-icon">→</span>';
    header.appendChild(btn);

    container.appendChild(header);

    const urlDiv = document.createElement('div');
    urlDiv.className = 'endpoint-url';
    urlDiv.textContent = endpoint.path;
    container.appendChild(urlDiv);

    const desc = document.createElement('p');
    desc.className = 'endpoint-description';
    desc.textContent = endpoint.description || '';
    container.appendChild(desc);

    if (endpoint.exampleResponse) {
        const respWrap = document.createElement('div');
        respWrap.className = 'endpoint-response';
        const h4 = document.createElement('h4');
        h4.textContent = 'Response:';
        respWrap.appendChild(h4);
        const pre = document.createElement('pre');
        pre.className = 'response-json';
        try {
            pre.textContent = JSON.stringify(endpoint.exampleResponse, null, 2);
        } catch (e) {
            pre.textContent = String(endpoint.exampleResponse);
        }
        respWrap.appendChild(pre);
        container.appendChild(respWrap);
    }

    return container;
}

function getDefaultBase() {
    // Prefer page origin when available (same-origin deployments). Fall back to localhost:3000.
    try {
        const origin = window.location.origin;
        if (origin && origin !== 'null' && origin.startsWith('https')) return origin;
    } catch (e) {}
    return 'https://api-mvr.vercel.app';
}

/**
 * Fetch endpoints from backend and render them
 */
async function fetchAndRenderEndpoints() {
    const container = document.getElementById('apiEndpointsContainer');
    if (!container) return;
    try {
    // Candidate bases to probe (in order): page origin, localhost:3000, localhost:3001
    const candidates = [];
    try { if (window.location && window.location.origin && window.location.origin !== 'null') candidates.push(window.location.origin); } catch (e) {}
    candidates.push('https://api-mvr.vercel.app');

    let endpoints = null;
    let successfulBase = null;

    for (const base of candidates) {
        const url = `${base}/__endpoints`;
        try {
            const resp = await fetch(url, { cache: 'no-store' });
            if (!resp.ok) throw new Error(`HTTPS ${resp.status}`);
            const data = await resp.json();
            if (Array.isArray(data)) {
                endpoints = data;
                successfulBase = base;
                break;
            }
        } catch (err) {
            console.debug('docs: endpoint probe failed for', url, err && err.message ? err.message : err);
            continue;
        }
    }

    // Clear existing
    container.innerHTML = '';
    if (!endpoints) {
        container.innerHTML = '<div class="endpoint-card glass-card"><p class="endpoint-description">Không thể tải danh sách endpoints. Hãy đảm bảo backend đang chạy (thử các cổng 3000 hoặc 3001) hoặc chỉnh sửa `getDefaultBase()`.</p></div>';
        return;
    }

    endpoints.forEach(ep => {
        const card = renderEndpointCard(ep, successfulBase || candidates[0]);
        container.appendChild(card);
    });

    // Attach event listeners to the dynamically created test buttons
    const testButtons = container.querySelectorAll('.test-btn');
    testButtons.forEach(button => {
        button.addEventListener('click', handleTestButtonClick);
        // visual feedback
        button.addEventListener('mousedown', () => { button.style.transform = 'scale(0.95)'; });
        button.addEventListener('mouseup', () => { button.style.transform = 'scale(1)'; });
        button.addEventListener('mouseleave', () => { button.style.transform = 'scale(1)'; });
    });
    } catch (error) {
        console.error('Could not load endpoints list:', error);
        // Fallback: leave container empty or show a message
        container.innerHTML = '<div class="endpoint-card glass-card"><p class="endpoint-description">Không thể tải danh sách endpoints. Hãy đảm bảo backend đang chạy trên <code>https://api-mvr.vercel.app</code> hoặc chỉnh sửa `getDefaultBase()`.</p></div>';
    }
}

/**
 * Initialize docs page
 */
function initDocsPage() {
    console.log('📚 Docs page initialized');
    // Load endpoints dynamically from backend
    fetchAndRenderEndpoints();
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDocsPage);

// ========================================
// EXPORT FOR TESTING (if needed)
// ========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleTestButtonClick,
        initDocsPage
    };
}


