// ========================================
// DOM ELEMENTS
// ========================================

const apiInput = document.getElementById('apiInput');
const fetchBtn = document.getElementById('fetchBtn');
const loadingContainer = document.getElementById('loadingContainer');
const errorContainer = document.getElementById('errorContainer');
const resultsContainer = document.getElementById('resultsContainer');
const errorMessage = document.getElementById('errorMessage');
const resultContent = document.getElementById('resultContent');
const rawJson = document.getElementById('rawJson');
const toggleJsonBtn = document.getElementById('toggleJsonBtn');
const copyBtn = document.getElementById('copyBtn');

let currentData = null;

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showLoading() {
    hideAllStates();
    loadingContainer.classList.add('active');
}

function showError(message) {
    hideAllStates();
    errorContainer.classList.add('active');
    errorMessage.textContent = message;
}

function showResults() {
    hideAllStates();
    resultsContainer.classList.add('active');
}

function hideAllStates() {
    loadingContainer.classList.remove('active');
    errorContainer.classList.remove('active');
    resultsContainer.classList.remove('active');
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function formatJSON(obj, indent = 2) {
    return JSON.stringify(obj, null, indent);
}

function getTypeIcon(value) {
    if (typeof value === 'string' && value.startsWith('http')) return '🔗';
    if (typeof value === 'string') return '📝';
    if (typeof value === 'number') return '🔢';
    if (typeof value === 'boolean') return '✓';
    if (Array.isArray(value)) return '📋';
    if (typeof value === 'object') return '📦';
    return '•';
}

function renderDataItem(key, value) {
    const item = document.createElement('div');
    item.className = 'result-item';
    
    const label = document.createElement('div');
    label.className = 'result-label';
    label.textContent = `${getTypeIcon(value)} ${key}`;
    
    const valueDiv = document.createElement('div');
    valueDiv.className = 'result-value';

    if (key.toLowerCase() === 'title') valueDiv.classList.add('large');

    if (typeof value === 'string' && value.startsWith('http')) {
        const link = document.createElement('a');
        link.href = value;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = value;
        link.innerHTML += ' <span style="font-size: 0.8em;">↗</span>';
        valueDiv.appendChild(link);
    } 
    else if (Array.isArray(value)) {
        if (value.length === 0) {
            valueDiv.textContent = 'Chưa có dữ liệu';
            valueDiv.style.color = 'var(--text-secondary)';
            valueDiv.style.fontStyle = 'italic';
        } else {
            valueDiv.textContent = `Array (${value.length} items)`;
            const arrayContent = document.createElement('div');
            arrayContent.className = 'array-content';
            const arrayPre = document.createElement('pre');
            arrayPre.textContent = JSON.stringify(value, null, 2);
            arrayContent.appendChild(arrayPre);
            valueDiv.appendChild(arrayContent);
        }
    } 
    else if (typeof value === 'object' && value !== null) {
        valueDiv.textContent = 'Object';
        const objContent = document.createElement('pre');
        objContent.style.marginTop = '0.5rem';
        objContent.style.padding = '0.5rem';
        objContent.style.background = 'rgba(0, 0, 0, 0.2)';
        objContent.style.borderRadius = '4px';
        objContent.style.fontSize = '0.9rem';
        objContent.textContent = JSON.stringify(value, null, 2);
        valueDiv.appendChild(objContent);
    } 
    else {
        valueDiv.textContent = value;
    }

    item.appendChild(label);
    item.appendChild(valueDiv);
    return item;
}

function renderData(data) {
    resultContent.innerHTML = '';
    let dataToRender = data;

    if (data.data) dataToRender = data.data;

    if (Array.isArray(dataToRender)) {
        dataToRender.forEach((item, index) => {
            const header = document.createElement('h3');
            header.style.marginTop = index > 0 ? '1.5rem' : '0';
            header.style.marginBottom = '1rem';
            header.style.color = 'var(--primary-hover)';
            header.textContent = `Item ${index + 1}`;
            resultContent.appendChild(header);
            
            if (typeof item === 'object') {
                Object.entries(item).forEach(([key, value]) => {
                    resultContent.appendChild(renderDataItem(key, value));
                });
            } else {
                resultContent.appendChild(renderDataItem(`Item ${index + 1}`, item));
            }
        });
    } 
    else if (typeof dataToRender === 'object' && dataToRender !== null) {
        Object.entries(dataToRender).forEach(([key, value]) => {
            resultContent.appendChild(renderDataItem(key, value));
        });
    } 
    else {
        resultContent.appendChild(renderDataItem('Result', dataToRender));
    }

    rawJson.textContent = formatJSON(data);
}

// ========================================
// FIX: FETCH API USING WEB API
// ========================================

async function fetchAPI() {
    let url = apiInput.value.trim();

    if (!url) {
        showError('Vui lòng nhập URL API');
        return;
    }

    // Nếu bé nhập "/gioithieu" thì auto dùng API WEB
    if (url.startsWith('/')) {
        url = "https://api-mvr.vercel.app" + url;
    }

    // Validate URL
    if (!isValidUrl(url)) {
        showError('URL không hợp lệ. Ví dụ: /gioithieu hoặc https://api-mvr.vercel.app/gioithieu');
        return;
    }

    showLoading();

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        currentData = data;

        renderData(data);

        setTimeout(() => showResults(), 300);

    } catch (error) {
        console.error('Fetch error:', error);
        let msg = 'Không thể kết nối đến API. ';
        if (error.message.includes('Failed to fetch')) {
            msg += 'Vui lòng kiểm tra API Vercel hoặc CORS.';
        } else msg += error.message;

        showError(msg);
    }
}

// ========================================
// CLIPBOARD & TOGGLE RAW JSON
// ========================================

async function copyToClipboard() {
    if (!currentData) return;

    try {
        const jsonString = formatJSON(currentData);
        await navigator.clipboard.writeText(jsonString);

        const original = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span style="color: var(--success);">✓ Đã copy!</span>';
        copyBtn.style.background = 'rgba(16,185,129,0.2)';

        setTimeout(() => {
            copyBtn.innerHTML = original;
            copyBtn.style.background = '';
        }, 2000);

    } catch (err) {
        alert('Không thể copy.');
    }
}

function toggleRawJson() {
    rawJson.classList.toggle('active');
    toggleJsonBtn.classList.toggle('active');
}

// ========================================
// EVENT LISTENERS
// ========================================

fetchBtn.addEventListener('click', fetchAPI);
apiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchAPI();
});
copyBtn.addEventListener('click', copyToClipboard);
toggleJsonBtn.addEventListener('click', toggleRawJson);

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 API Explorer Ready');

    apiInput.focus();

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            fetchAPI();
        }
    });

    // Tự lấy URL từ Docs
    try {
        const apiToTest = sessionStorage.getItem('apiToTest');
        if (apiToTest) {
            apiInput.value = apiToTest;
            sessionStorage.removeItem('apiToTest');

            setTimeout(() => fetchAPI(), 200);
        }
    } catch {}
});

