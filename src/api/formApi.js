/**
 * formApi.js — Raw HTTP calls for /form/* endpoints.
 * No business logic here — only API transport.
 *
 * Routes:
 *   GET  /form/list      Token (admin authenticated)
 *   POST /form/create    name, email, phone_number, description, interested_in[], support_with[], source_about_us
 *   POST /form/delete    Token, _id
 *   POST /form/details   Token, _id
 *
 *  NOTE: Token is injected automatically by axiosInstance.js interceptor.
 */

import { apiBase } from '../services/axiosInstance';
import { extractList } from './http';

export const formApi = {

    list: async () => {
        const res = await apiBase.get('/form/list');
        return extractList(res.data);
    },

    create: async ({ name, email, phone_number, description, support_with = [], interested_in = [], source_about_us }) => {
        const res = await apiBase.post('/form/create', {
            name,
            email,
            phone_number,
            description,
            support_with,
            interested_in,
            source_about_us
        });
        return res.data;
    },

    delete: async (id) => {
        const res = await apiBase.post('/form/delete', { _id: id });
        return res.data;
    },

    details: async (id) => {
        const res = await apiBase.post('/form/details', { _id: id });
        return res.data;
    }
};
