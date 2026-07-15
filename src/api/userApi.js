/**
 * userApi.js — Raw HTTP calls for /user/* endpoints.
 * No business logic here — only API transport.
 *
 * Routes:
 *   GET  /user/list
 *   POST /user/create   name, email, phone_number, description, support_with[], interested_in[]
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

    /**
     * Create a new user/enquiry.
     * @param {string} name
     * @param {string} email
     * @param {string} phone_number
     * @param {string} description
     * @param {string[]} support_with   - enum values from userSchema
     * @param {string[]} interested_in  - enum values from userSchema
     */
    create: async ({ name, email, phone_number, description, support_with = [], interested_in = [] }) => {
        const res = await apiBase.post('/user/create', {
            name,
            email,
            phone_number,
            description,
            support_with,
            interested_in
        });
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
