/**
 * eventApi.js — Raw HTTP calls for /event/* endpoints.
 * No business logic here — only API transport.
 *
 * Routes:
 *   GET  /event/list             Token (admin authenticated)
 *   GET  /event/status/list      Public — returns only active events (no auth required)
 *   POST /event/create           Token, title, file, description, start_date, end_date, start_time, end_time, status, location
 *   POST /event/update           Token, _id, title, file, description, start_date, end_date, start_time, end_time, status, location
 *   POST /event/delete           Token, _id
 *   POST /event/details          Token, _id
 *
 *  NOTE: `location` is sent to the backend — ensure the Event schema includes `location: { type: String }`
 *  NOTE: Token is injected automatically by axiosInstance.js interceptor; never add it manually here.
 */

import { apiBase } from '../services/axiosInstance';
import { buildFormData, extractList, MULTIPART } from './http';

export const eventApi = {

    list: async () => {
        const res = await apiBase.get('/event/list');
        return extractList(res.data);

    },

    /** Public route — returns only events with status: true (no Token required). */
    statusList: async () => {
        const res = await apiBase.get('/event/status/list');
        return extractList(res.data);
    },

    create: async (payload) => {
        const fd = buildFormData({
            title: payload.title,
            description: payload.description,
            start_date: payload.start_date,
            end_date: payload.end_date || payload.start_date,
            start_time: payload.start_time,
            end_time: payload.end_time,
            status: payload.status !== undefined ? payload.status : true,
            location: payload.location || ''
        });
        if (payload.file instanceof File) fd.append('file', payload.file);
        const res = await apiBase.post('/event/create', fd, MULTIPART);
        return res.data;
    },

    update: async (payload) => {
        const fd = buildFormData({
            _id: payload._id,
            title: payload.title,
            description: payload.description,
            start_date: payload.start_date,
            end_date: payload.end_date || payload.start_date,
            start_time: payload.start_time,
            end_time: payload.end_time,
            status: payload.status !== undefined ? payload.status : true,
            location: payload.location || ''
        });
        if (payload.file instanceof File) fd.append('file', payload.file);
        const res = await apiBase.post('/event/update', fd, MULTIPART);
        return res.data;
    },

    updateImage: async ({ _id, file }) => {
        // Uses 'file' key — consistent with create/update
        const fd = buildFormData({ _id });
        if (file instanceof File) fd.append('file', file);
        const res = await apiBase.post('/event/update/image', fd, MULTIPART);
        return res.data;
    },

    delete: async (id) => {
        const res = await apiBase.post('/event/delete', { _id: id });
        return res.data;
    },

    details: async (id) => {
        const res = await apiBase.post('/event/details', { _id: id });
        return res.data;
    },

    book: async ({ event_id, first_name, last_name, email, phone_number, country, occupation, description }) => {
        const res = await apiBase.post('/event/book', {
            event_id,
            first_name,
            last_name,
            email,
            phone_number,
            country,
            occupation,
            description
        });
        return res.data;
    },

    bookingList: async () => {
        const res = await apiBase.get('/event/book/list');
        console.log('bookingList res.data:', res.data);
        return extractList(res.data);
    },

    bookingDelete: async (id) => {
        const res = await apiBase.post('/eventbook/delete', { _id: id });
        return res.data;
    }
};
