/**
 * galleryApi.js — Raw HTTP calls for /gallery/* endpoints.
 * No business logic here — only API transport.
 *
 * Routes:
 *   GET  /gallery/list           (admin authenticated)
 *   GET  /gallery/status/list    Public — returns only active images (no auth required)
 *   POST /gallery/create         Token, file, optional status
 *   POST /gallery/update         Token, _id, file, optional status
 *   POST /gallery/delete         Token, _id
 *   POST /gallery/add/sub/image    Token, _id, file
 *   POST /gallery/remove/sub/image Token, _id, sub_image
 *
 *  NOTE: Token is injected automatically by axiosInstance.js interceptor.
 */
import { apiBase, getToken } from '../services/axiosInstance';
import { buildFormData, extractList, MULTIPART } from './http';

export const galleryApi = {

    list: async () => {
        const res = await apiBase.get('/gallery/list');
        return extractList(res.data);
    },

    /** Public route — returns only images with status active (no Token required). */
    statusList: async () => {
        const res = await apiBase.get('/gallery/status/list');
        return extractList(res.data);
    },

    create: async ({ file, sub_image, heading, title, description, status }) => {
        const fd = buildFormData({
            heading,
            title,
            description,
            ...(status !== undefined && { status })
        });
        if (file instanceof File) {
            fd.append('file', file);
        }
        if (Array.isArray(sub_image)) {
            sub_image.forEach(item => {
                if (item instanceof File) {
                    fd.append('sub_image', item);
                } else if (typeof item === 'string') {
                    fd.append('sub_image_urls', item);
                }
            });
        }
        const res = await apiBase.post('/gallery/create', fd, MULTIPART);
        return res.data;
    },

    update: async ({ _id, file, image, sub_image, heading, title, description, status, remove_image }) => {
        const hasFiles = (file instanceof File) || (Array.isArray(sub_image) && sub_image.some(item => item instanceof File));

        if (hasFiles) {
            const fd = buildFormData({
                _id,
                id: _id,
                heading,
                title,
                description,
                image: typeof image === 'string' ? image : '',
                ...(remove_image ? { remove_image: 'true', remove_main_image: 'true' } : {}),
                ...(status !== undefined && { status })
            });
            if (file instanceof File) {
                fd.append('file', file);
            } else if (typeof file === 'string') {
                fd.append('image', file);
            }
            if (Array.isArray(sub_image)) {
                sub_image.forEach(item => {
                    if (item instanceof File) {
                        fd.append('sub_image', item);
                    } else if (typeof item === 'string') {
                        fd.append('sub_image', item);
                        fd.append('sub_image_urls', item);
                    }
                });
            }
            const res = await apiBase.post('/gallery/update', fd, MULTIPART);
            return res.data;
        }

        // Standard JSON POST request if no files are uploaded
        const jsonPayload = {
            _id,
            id: _id,
            heading,
            title,
            description,
            image: typeof image === 'string' ? image : (typeof file === 'string' ? file : ''),
            img: typeof image === 'string' ? image : (typeof file === 'string' ? file : ''),
            file: '',
            sub_image: Array.isArray(sub_image) ? sub_image : [],
            status,
            ...(remove_image ? { remove_image: true, remove_main_image: true } : {})
        };
        const res = await apiBase.post('/gallery/update', jsonPayload);
        return res.data;
    },

    delete: async (id) => {
        const res = await apiBase.post('/gallery/delete', { _id: id, id: id });
        return res.data;
    },

    details: async (id) => {
        const res = await apiBase.post('/gallery/details', { _id: id });
        return res.data;
    },

    addSubImage: async ({ _id, file }) => {
        const fd = buildFormData({ _id });
        if (file instanceof File) {
            fd.append('file', file);
        }
        const res = await apiBase.post('/gallery/add/sub/image', fd, MULTIPART);
        return res.data;
    },

    removeSubImage: async ({ _id, id, sub_image, token }) => {
        const docId = _id || id;
        const authToken = token || getToken();
        if (!authToken) {
            throw new Error('Authentication token is required. Please log in.');
        }

        const res = await apiBase.post('/gallery/remove/sub/image', {
            _id: docId,
            sub_image,
            token: authToken
        });
        return res.data;
    }
};
