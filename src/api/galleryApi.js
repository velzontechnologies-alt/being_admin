// galleryApi.js - API calls for gallery endpoints
import { apiBase } from '../services/axiosInstance';
import { buildFormData, extractList, MULTIPART } from './http';

export const galleryApi = {

    list: async () => {
        const res = await apiBase.get('/gallery/list');
        return extractList(res.data);
    },

    create: async ({ file, status }) => {
        const fd = buildFormData({ ...(status && { status }) });
        fd.append('file', file);
        const res = await apiBase.post('/gallery/create', fd, MULTIPART);
        return res.data;
    },

    update: async ({ _id, file, status }) => {
        const fd = buildFormData({
            _id,
            ...(status !== undefined && { status })
        });
        if (file instanceof File) fd.append('file', file);
        const res = await apiBase.post('/gallery/update', fd, MULTIPART);
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
