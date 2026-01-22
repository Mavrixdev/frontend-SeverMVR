// ========================================
// DOCS PAGE FUNCTIONALITY (FIXED VERSION)
// ========================================

/**
 * Handle test button clicks - redirect to home with API URL
 */
function handleTestButtonClick(event) {
    const button = event.currentTarget;
    const apiUrl = button.getAttribute('data-url');

    if (apiUrl) {
        sessionStorage.setItem('apiToTest', apiUrl);
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
        pre.textContent = JSON.stringify(endpoint.exampleResponse, null, 2);
        respWrap.appendChild(pre);
        container.appendChild(respWrap);
    }

    return container;
}

function getDefaultBase() {
    try {
        const origin = window.location.origin;
        if (origin && origin.startsWith('http')) return origin;
    } catch (e) {}
    
    return 'http://localhost:3001';
}

/**
 * Fetch endpoints from backend and render them
 */
async function fetchAndRenderEndpoints() {
    const container = document.getElementById('apiEndpointsContainer');
    if (!container) return;

    try {
        // FIXED: full list of backend bases
        const candidates = [];

        // 1. Current origin (if deployed)
        try { 
            if (window.location.origin && window.location.origin !== 'null') 
                candidates.push(window.location.origin); 
        } catch (e) {}

        // 2. Local development servers
        candidates.push('http://localhost:3001');
        candidates.push('http://localhost:3000');

        // 3. FIXED: Add Vercel backend domain
        candidates.push('https://api-mvr.vercel.app');

        // Try backend candidates
        let endpoints = null;
        let successfulBase = null;

        for (const base of candidates) {
            const url = `${base}/__endpoints`;

            try {
                const resp = await fetch(url, { cache: 'no-store' });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

                const data = await resp.json();
                if (Array.isArray(data)) {
                    endpoints = data;
                    successfulBase = base;
                    break;
                }
            } catch (err) {
                console.debug('docs: failed:', url, err.message || err);
                continue;
            }
        }

        container.innerHTML = '';

        if (!endpoints) {
            container.innerHTML = `
                <div class="endpoint-card glass-card">
                    <p class="endpoint-description">
                        Không thể tải danh sách endpoints.  
                        Hãy đảm bảo backend đang chạy hoặc chỉnh lại API domain.
                    </p>
                </div>`;
            return;
        }

        endpoints.forEach(ep => {
            const card = renderEndpointCard(ep, successfulBase);
            container.appendChild(card);
        });

        container.querySelectorAll('.test-btn').forEach(button => {
            button.addEventListener('click', handleTestButtonClick);
        });

    } catch (error) {
        container.innerHTML = `<div class="endpoint-card glass-card">
            <p class="endpoint-description">Không thể tải endpoints.</p>
        </div>`;
    }
}

function initDocsPage() {
    console.log('📚 Docs page initialized');
    fetchAndRenderEndpoints();
}

document.addEventListener('DOMContentLoaded', initDocsPage);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleTestButtonClick,
        initDocsPage
    };
}
