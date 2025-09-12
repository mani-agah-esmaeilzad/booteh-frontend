
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {

        const errorData = await response.json().catch(() => ({ message: 'خطای ناشناخته در ارتباط با سرور' }));
        throw new Error(errorData.message || 'خطایی در شبکه رخ داد');
    }

    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
        return { success: true };
    }

    return response.json();
};

export default apiFetch;