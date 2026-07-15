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
 *   POST /gallery/details        Token, _id
 *
 *  NOTE: Token is injected automatically by axiosInstance.js interceptor.
 */
import { apiBase } from '../services/axiosInstance';
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

    create: async ({ file, status }) => {
        const fd = buildFormData({ ...(status && { status }) });
        fd.append('file', file);
        const res = await apiBase.post('/gallery/create', fd, MULTIPART);
        return res.data;
    },

    update: async ({ _id, file, status }) => {
        // 1. If updating image file, use FormData / multipart request
        if (file instanceof File) {
            const fd = buildFormData({
                _id,
                id: _id,
                ...(status !== undefined && { status })
            });
            fd.append('file', file);
            const res = await apiBase.post('/gallery/update', fd, MULTIPART);
            return res.data;
        }

        // 2. If updating status only, send as standard JSON POST request
        const res = await apiBase.post('/gallery/update', {
            _id,
            id: _id,
            status
        });
        return res.data;
    },

    delete: async (id) => {
        const res = await apiBase.post('/gallery/delete', { _id: id });
        return res.data;
    },

    details: async (id) => {
        const res = await apiBase.post('/gallery/details', { _id: id });
        return res.data;
    }
};
