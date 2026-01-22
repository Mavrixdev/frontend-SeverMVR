// ========================================
// DOCS PAGE FUNCTIONALITY (WEB API VERSION)
// ========================================

// 🔥 Backend web cố định
const WEB_API_BASE = "https://api-mvr.vercel.app";

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
function renderEndpointCard(endpoint) {
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
    btn.setAttribute('data-url', WEB_API_BASE + endpoint.path);
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

/**
 * Fetch endpoints from backend and render them
 */
async function fetchAndRenderEndpoints() {
    const container = document.getElementById('apiEndpointsContainer');
    if (!container) return;

    try {
        const resp = await fetch(`${WEB_API_BASE}/__endpoints`, { cache: "no-store" });

        if (!resp.ok) throw new Error("Bad response");

        const endpoints = await resp.json();

        if (!Array.isArray(endpoints)) throw new Error("Invalid format");

        container.innerHTML = '';

        endpoints.forEach(ep => {
            const card = renderEndpointCard(ep);
            container.appendChild(card);
        });

        container.querySelectorAll('.test-btn').forEach(btn => {
            btn.addEventListener('click', handleTestButtonClick);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="endpoint-card glass-card">
                <p class="endpoint-description">
                    Không thể tải danh sách endpoints từ web API.<br>
                    Kiểm tra lại API Vercel: <code>${WEB_API_BASE}</code>
                </p>
            </div>`;
    }
}

/**
 * Initialize docs page
 */
function initDocsPage() {
    console.log("📚 Docs page initialized (WEB API MODE)");
    fetchAndRenderEndpoints();
}

document.addEventListener("DOMContentLoaded", initDocsPage);

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        handleTestButtonClick,
        initDocsPage
    };
}
