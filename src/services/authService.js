import api from './axiosInstance';

const extractUserInfo = (obj) => {
    let result = {};
    const search = (item) => {
        if (!item || typeof item !== 'object') return;

        if ('token' in item && item.token) result.token = item.token;
        if ('email' in item && item.email) result.email = item.email;
        if ('role' in item && item.role) result.role = item.role;

        if ('name' in item && item.name) result.name = item.name;
        if ('Name' in item && item.Name) result.name = item.Name;
        if ('_id' in item && item._id) result._id = item._id;
        if ('id' in item && item.id) result._id = item.id;

        if ('phone_number' in item && item.phone_number) result.phone_number = item.phone_number;
        if ('phone' in item && item.phone) result.phone_number = item.phone;

        if ('description' in item && item.description) result.description = item.description;
        if ('bio' in item && item.bio) result.description = item.bio;
        if ('profile_image' in item && item.profile_image) result.profile_image = item.profile_image;

        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                search(item[key]);
            }
        }
    };
    search(obj);
    return result;
};

export const authService = {
    // POST /admin/login
    login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        const userData = response.data;
        if (userData) {
            const extracted = extractUserInfo(userData);
            const processedUser = { ...userData, ...extracted };

            // Ensure email is set
            if (!processedUser.email && email) {
                processedUser.email = email;
            }

            if (processedUser.token) {
                localStorage.setItem('user', JSON.stringify(processedUser));
            }
            return processedUser;
        }
        return userData;
    },

    // POST /admin/logout
    logout: async () => {
        const user = authService.getUser();
        if (user && user.email) {
            try {
                await api.post('/logout', { email: user.email });
            } catch (error) {
                console.error('Logout API call failed:', error);
            }
        }
        localStorage.removeItem('user');
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // GET /admin/list
    listAdmins: async () => {
        const response = await api.get('/list');
        return response.data;
    },

    // POST /admin/create
    createAdmin: async (arg1, phone_number, name, password) => {
        let payload = {};
        if (typeof arg1 === 'object' && arg1 !== null) {
            payload = {
                name: arg1.name || '',
                email: arg1.email || '',
                password: arg1.password || '',
                phone_number: arg1.phone_number || arg1.phone || '',
            };
        } else {
            // Positional arguments compatibility: (email, phone_number, name, password)
            payload = {
                name: name || '',
                email: arg1 || '',
                password: password || '',
                phone_number: phone_number || '',
            };
        }
        const response = await api.post('/create', payload);
        return response.data;
    },

    // Alias for admin registration
    register: async (adminData) => {
        return authService.createAdmin(adminData);
    },

    // POST /admin/update — fields must match adminSchema: name, phone_number, description
    updateAdmin: async (name, phone_number, description, password) => {
        const payload = { name, phone_number, description };
        if (password) {
            payload.password = password;
        }
        const response = await api.post('/update', payload);
        return response.data;
    },

    // POST /admin/profile-update
    updateProfile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/profile-update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // POST /admin/delete
    deleteAdmin: async (id) => {
        const response = await api.post('/delete', { _id: id });
        return response.data;
    },

    // POST /admin/details
    getAdminDetails: async (id, token) => {
        const payload = { _id: id };
        if (token) {
            payload.token = token;
        }
        const response = await api.post('/details', payload);
        return response.data;
    }
};
