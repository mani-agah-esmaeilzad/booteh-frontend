// فایل کامل و اصلاح شده: src/services/apiService.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = (endpoint: string): string | null => {
    // اگر مسیر درخواست مربوط به پنل ادمین بود، توکن ادمین را برگردان
    if (endpoint.startsWith('admin/')) {
        return localStorage.getItem('adminAuthToken');
    }
    // در غیر این صورت، توکن کاربر عادی را برگردان
    return localStorage.getItem('authToken');
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    // توکن مناسب را بر اساس مسیر درخواست دریافت می‌کنیم
    const token = getToken(endpoint);
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `خطای ${response.status} در ارتباط با سرور` }));
        // پرتاب خطا برای مدیریت در کامپوننت‌ها
        throw new Error(errorData.message || 'خطایی در شبکه رخ داد');
    }

    // اگر پاسخ محتوایی نداشت (مانند status 204)
    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
        return { success: true, message: "عملیات با موفقیت انجام شد" };
    }

    return response.json();
};

export default apiFetch;
