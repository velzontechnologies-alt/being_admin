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

                // Inject token into request body (for both FormData and JSON objects)
                if (config.data instanceof FormData) {
                    if (!config.data.has('Token')) {
                        config.data.append('Token', token);
                    }
                    if (!config.data.has('token')) {
                        config.data.append('token', token);
                    }
                } else if (config.data && typeof config.data === 'object' && !(config.data instanceof ArrayBuffer || config.data instanceof Blob)) {
                    // For standard JSON payloads, inject if not already present
                    if (config.data.Token === undefined) {
                        config.data.Token = token;
                    }
                    if (config.data.token === undefined) {
                        config.data.token = token;
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
