/**
 * userApi.js — Raw HTTP calls for /user/* endpoints.
 * No business logic here — only API transport.
 *
 * Routes:
 *   GET  /user/list
 *   POST /user/create   name, email, phone_number, description
 *   POST /user/delete   Token, _id
 *   POST /user/details  Token, _id
 */

import { apiBase } from '../services/axiosInstance';
import { buildFormData, extractList, MULTIPART } from './http';

export const userApi = {

    list: async () => {
        const res = await apiBase.get('/user/list');
        return extractList(res.data);
    },

    create: async ({ name, email, phone_number, description }) => {
        const res = await apiBase.post('/user/create', { name, email, phone_number, description });
        return res.data;
    },

    delete: async (id) => {
        const res = await apiBase.post('/user/delete', { _id: id });
        return res.data;
    },

    details: async (id) => {
        const res = await apiBase.post('/user/details', { _id: id });
        return res.data;
    }
};
