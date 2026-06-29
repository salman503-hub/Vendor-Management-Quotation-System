// Utility to make fetch calls to Django APIs with automatic CSRF token inclusion

// Helper to get cookie value by name
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export async function apiRequest(url, method = 'GET', data = null) {
    const headers = {
        'Accept': 'application/json',
    };

    if (data) {
        headers['Content-Type'] = 'application/json';
    }

    // Attach CSRF token for mutating requests
    if (method !== 'GET' && method !== 'HEAD') {
        const csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    
    // If 204 No Content, return null or empty
    if (response.status === 204) {
        return null;
    }
    
    const responseData = await response.json();
    
    if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Something went wrong');
    }
    
    return responseData;
}
