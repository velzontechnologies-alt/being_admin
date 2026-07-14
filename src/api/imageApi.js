/**
 * imageApi.js — Raw HTTP calls for /image/* endpoints.
 * No business logic here — only API transport.
 *
 * Routes:
 *   GET  /image/list
 *   POST /image/create   Token, File (capital F), card_title, card_description, card_status
 *   POST /image/update   Token, _id, File, card_title, card_description, card_status
 *   POST /image/delete   Token, _id
 *   POST /image/details  Token, _id
 */

import { apiBase } from '../services/axiosInstance';
import { buildFormData, extractList, MULTIPART } from './http';

export const imageApi = {

    list: async () => {
        const res = await apiBase.get('/image/list');
        return extractList(res.data);
    },

    create: async ({ file, card_title, card_description, card_status = true }) => {
        const fd = buildFormData({ card_title, card_description, card_status });
        if (file instanceof File) fd.append('file', file);
        const res = await apiBase.post('/image/create', fd, MULTIPART);
        return res.data;
    },

    update: async ({ _id, file, card_title, card_description, card_status }) => {
        const fd = buildFormData({
            _id,
            ...(card_title       !== undefined && { card_title }),
            ...(card_description !== undefined && { card_description }),
            ...(card_status      !== undefined && { card_status })
        });
        if (file instanceof File) fd.append('file', file);
        const res = await apiBase.post('/image/update', fd, MULTIPART);
        return res.data;
    },

    updateImage: async ({ _id, file }) => {
        const fd = buildFormData({ _id });
        if (file instanceof File) fd.append('image', file);
        const res = await apiBase.post('/image/update/image', fd, MULTIPART);
        return res.data;
    },

    delete: async (id) => {
        const res = await apiBase.post('/image/delete', { _id: id });
        return res.data;
    },

    details: async (id) => {
        const res = await apiBase.post('/image/details', { _id: id });
        return res.data;
    }
};
