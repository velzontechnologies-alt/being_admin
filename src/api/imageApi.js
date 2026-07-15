/**
 * imageApi.js — Raw HTTP calls for /program/* endpoints.
 * No business logic here — only API transport.
 *
 * Routes:
 *   GET  /program/list           Token (admin authenticated)
 *   GET  /program/status/list    Public — returns only active programs (no auth required)
 *   POST /program/create         Token, file, card_title, card_description, card_status, ideal, what_you_gain, suitable, tagline, key_out_come
 *   POST /program/update         Token, _id, file, card_title, card_description, card_status, ideal, what_you_gain, suitable, tagline, key_out_come
 *   POST /program/delete         Token, _id
 *   POST /program/details        Token, _id
 */

import { apiBase } from '../services/axiosInstance';
import { buildFormData, extractList, MULTIPART } from './http';

export const imageApi = {

    list: async () => {
        const res = await apiBase.get('/program/list');
        return extractList(res.data);
    },

    /** Public route — returns only programs with card_status: true (no Token required). */
    statusList: async () => {
        const res = await apiBase.get('/program/status/list');
        return extractList(res.data);
    },

    create: async ({ file, card_title, card_description, card_status = true, ideal, what_you_gain, suitable, tagline, key_out_come }) => {
        const fd = buildFormData({ card_title, card_description, card_status, ideal, what_you_gain, suitable, tagline, key_out_come });
        if (file instanceof File) fd.append('file', file);
        const res = await apiBase.post('/program/create', fd, MULTIPART);
        return res.data;
    },

    update: async ({ _id, file, card_title, card_description, card_status, ideal, what_you_gain, suitable, tagline, key_out_come }) => {
        const fd = buildFormData({
            _id,
            ...(card_title       !== undefined && { card_title }),
            ...(card_description !== undefined && { card_description }),
            ...(card_status      !== undefined && { card_status }),
            ...(ideal            !== undefined && { ideal }),
            ...(what_you_gain    !== undefined && { what_you_gain }),
            ...(suitable         !== undefined && { suitable }),
            ...(tagline          !== undefined && { tagline }),
            ...(key_out_come     !== undefined && { key_out_come })
        });
        if (file instanceof File) fd.append('file', file);
        const res = await apiBase.post('/program/update', fd, MULTIPART);
        return res.data;
    },

    updateImage: async ({ _id, file }) => {
        const fd = buildFormData({ _id });
        if (file instanceof File) fd.append('file', file);
        const res = await apiBase.post('/program/update', fd, MULTIPART);
        return res.data;
    },

    delete: async (id) => {
        // Token is injected automatically via the Axios interceptor (header + FormData)
        const res = await apiBase.post('/program/delete', { _id: id });
        return res.data;
    },

    details: async (id) => {
        // Token is injected automatically via the Axios interceptor (header + FormData)
        const res = await apiBase.post('/program/details', { _id: id });
        return res.data;
    }
};
