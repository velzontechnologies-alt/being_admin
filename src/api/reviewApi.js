/**
 * reviewApi.js — Raw HTTP calls for /review/* endpoints.
 *
 * Routes:
 *   GET  /review/list             Public/Admin
 *   POST /review/create           Name, tag, description
 *   POST /review/delete           _id
 */

import { apiBase } from '../services/axiosInstance';
import { extractList } from './http';

export const reviewApi = {

    list: async () => {
        const res = await apiBase.get('/review/list');
        return extractList(res.data);
    },

    create: async ({ name, tag, description }) => {
        const res = await apiBase.post('/review/create', {
            name,
            tag,
            description
        });
        return res.data;
    },

    delete: async (id) => {
        const res = await apiBase.post('/review/delete', { _id: id });
        return res.data;
    }
};
