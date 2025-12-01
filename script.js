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

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Show loading state
 */
function showLoading() {
    hideAllStates();
    loadingContainer.classList.add('active');
}

/**
 * Show error state
 */
function showError(message) {
    hideAllStates();
    errorContainer.classList.add('active');
    errorMessage.textContent = message;
}

/**
 * Show results state
 */
function showResults() {
    hideAllStates();
    resultsContainer.classList.add('active');
}

/**
 * Hide all state containers
 */
function hideAllStates() {
    loadingContainer.classList.remove('active');
    errorContainer.classList.remove('active');
    resultsContainer.classList.remove('active');
}

/**
 * Validate URL
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Format JSON with syntax highlighting
 */
function formatJSON(obj, indent = 2) {
    return JSON.stringify(obj, null, indent);
}

/**
 * Detect data type and return appropriate icon
 */
function getTypeIcon(value) {
    if (typeof value === 'string' && value.startsWith('http')) {
        return '🔗';
    }
    if (typeof value === 'string') {
        return '📝';
    }
    if (typeof value === 'number') {
        return '🔢';
    }
    if (typeof value === 'boolean') {
        return '✓';
    }
    if (Array.isArray(value)) {
        return '📋';
    }
    if (typeof value === 'object') {
        return '📦';
    }
    return '•';
}

/**
 * Render a single data item
 */
function renderDataItem(key, value) {
    const item = document.createElement('div');
    item.className = 'result-item';
    
    const label = document.createElement('div');
    label.className = 'result-label';
    label.textContent = `${getTypeIcon(value)} ${key}`;
    
    const valueDiv = document.createElement('div');
    valueDiv.className = 'result-value';
    
    // Special handling for title (make it large)
    if (key.toLowerCase() === 'title') {
        valueDiv.classList.add('large');
    }
    
    // Handle different value types
    if (typeof value === 'string' && value.startsWith('http')) {
        // It's a URL - make it clickable
        const link = document.createElement('a');
        link.href = value;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = value;
        link.innerHTML += ' <span style="font-size: 0.8em;">↗</span>';
        valueDiv.appendChild(link);
    } else if (Array.isArray(value)) {
        // It's an array - show empty message if no items
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
    } else if (typeof value === 'object' && value !== null) {
        // It's an object
        valueDiv.textContent = 'Object';
        const objContent = document.createElement('pre');
        objContent.style.marginTop = '0.5rem';
        objContent.style.padding = '0.5rem';
        objContent.style.background = 'rgba(0, 0, 0, 0.2)';
        objContent.style.borderRadius = '4px';
        objContent.style.fontSize = '0.9rem';
        objContent.textContent = JSON.stringify(value, null, 2);
        valueDiv.appendChild(objContent);
    } else {
        // Simple value
        valueDiv.textContent = value;
    }
    
    item.appendChild(label);
    item.appendChild(valueDiv);
    
    return item;
}

/**
 * Render API response data
 */
function renderData(data) {
    resultContent.innerHTML = '';
    
    // Handle different response structures
    let dataToRender = data;
    
    // If response has a 'data' property, use that
    if (data.data) {
        dataToRender = data.data;
    }
    
    // If it's an array, render each item
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
    // If it's an object, render each property
    else if (typeof dataToRender === 'object' && dataToRender !== null) {
        Object.entries(dataToRender).forEach(([key, value]) => {
            resultContent.appendChild(renderDataItem(key, value));
        });
    } 
    // If it's a primitive value
    else {
        resultContent.appendChild(renderDataItem('Result', dataToRender));
    }
    
    // Update raw JSON display
    rawJson.textContent = formatJSON(data);
}

/**
 * Fetch API data
 */
async function fetchAPI() {
    let url = apiInput.value.trim();
    
    // Validate URL
    if (!url) {
        showError('Vui lòng nhập URL API');
        return;
    }
    
    // If user only entered endpoint path (starts with /), prepend base URL
    if (url.startsWith('/')) {
        url = 'http://localhost:3001' + url;
    }
    
    if (!isValidUrl(url)) {
        showError('URL không hợp lệ. Vui lòng nhập URL đầy đủ (ví dụ: /gioithieu hoặc http://localhost:3001/tkb)');
        return;
    }
    
    
    // Show loading
    showLoading();
    
    try {
        // Fetch data
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        // Parse JSON
        const data = await response.json();
        
        // Store current data
        currentData = data;
        
        // Render data
        renderData(data);
        
        // Show results with animation delay
        setTimeout(() => {
            showResults();
        }, 300);
        
    } catch (error) {
        console.error('Fetch error:', error);
        
        // Show appropriate error message
        let errorMsg = 'Không thể kết nối đến API. ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMsg += 'Vui lòng kiểm tra:\n• Server có đang chạy không?\n• URL có đúng không?\n• CORS có được cấu hình không?';
        } else if (error.message.includes('HTTP Error')) {
            errorMsg += error.message;
        } else {
            errorMsg += error.message;
        }
        
        showError(errorMsg);
    }
}

/**
 * Copy JSON to clipboard
 */
async function copyToClipboard() {
    if (!currentData) {
        return;
    }
    
    try {
        const jsonString = formatJSON(currentData);
        await navigator.clipboard.writeText(jsonString);
        
        // Show success feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span style="color: var(--success);">✓ Đã copy!</span>';
        copyBtn.style.background = 'rgba(16, 185, 129, 0.2)';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
        }, 2000);
        
    } catch (error) {
        console.error('Copy error:', error);
        alert('Không thể copy. Vui lòng thử lại.');
    }
}

/**
 * Toggle raw JSON display
 */
function toggleRawJson() {
    rawJson.classList.toggle('active');
    toggleJsonBtn.classList.toggle('active');
}

// ========================================
// EVENT LISTENERS
// ========================================

// Fetch button click
fetchBtn.addEventListener('click', fetchAPI);

// Enter key in input
apiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchAPI();
    }
});

// Copy button click
copyBtn.addEventListener('click', copyToClipboard);

// Toggle JSON button click
toggleJsonBtn.addEventListener('click', toggleRawJson);

// ========================================
// INITIALIZATION
// ========================================

// Add some initial animation
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 API Explorer initialized');
    
    // Focus on input
    apiInput.focus();
    
    // Add keyboard shortcut (Ctrl/Cmd + Enter to fetch)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            fetchAPI();
        }
    });
    
    // If navigated from docs page, prefill input and auto-fetch
    try {
        const apiToTest = sessionStorage.getItem('apiToTest');
        if (apiToTest) {
            apiInput.value = apiToTest;
            // clear it so subsequent loads don't auto-fetch
            sessionStorage.removeItem('apiToTest');
            // small delay to allow UI to settle
            setTimeout(() => {
                fetchAPI();
            }, 200);
        }
    } catch (e) {
        // ignore storage errors
    }
});

// ========================================
// EXPORT FOR TESTING (if needed)
// ========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchAPI,
        renderData,
        isValidUrl,
        formatJSON
    };
}
