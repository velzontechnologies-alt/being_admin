import axios from 'axios';

const BASE_URL = 'http://192.168.0.7:6202';

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

                // If the body is FormData, also append Token as a field
                // so backends that read from body (not headers) still get it
                if (config.data instanceof FormData) {
                    if (!config.data.has('Token')) {
                        config.data.append('Token', token);
                    }
                }
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
