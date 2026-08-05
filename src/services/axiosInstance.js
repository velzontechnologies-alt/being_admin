import axios from 'axios';

const BASE_URL = import.meta.env.DEV 
    ? '/api' 
    : 'https://api.beingandbeyond.life';

const getToken = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        return user?.token || null;
    } catch {
        return null;
    }
};

// Interceptor factory: injects Token into headers AND into FormData bodies
const addAuthInterceptor = (instance) => {
    instance.interceptors.request.use(
        (config) => {
            const token = getToken();
            if (token) {
                // Always inject into headers
                config.headers['Token'] = token;
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
    return instance;
};

// Instance for /admin/* routes
const api = addAuthInterceptor(axios.create({ baseURL: `${BASE_URL}/admin` }));

// Instance for /event, /gallery, /image, /user routes (non-admin prefix)
const apiBase = addAuthInterceptor(axios.create({ baseURL: BASE_URL }));

export { apiBase, getToken };
export default api;
