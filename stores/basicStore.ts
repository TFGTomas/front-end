const API_URL = 'http://localhost:3001/api';

async function fetchAPI(path: string, options?: RequestInit) {
    // If the path starts with 'http', assume it's a full URL
    const url = path.startsWith('http') ? path : `${API_URL}/${path}`;

    const response = await fetch(url, options);

    if (!response.ok) {
        console.error("BASIC STORE::ERROR -> " + response.statusText);
        throw new Error(response.statusText);
    }

    return await response.json();
}

export default fetchAPI;
