// enquiryService.js - enquiry/contact-form management helpers
import { userApi } from '../api/userApi';

// Formats API user data to be UI-ready enquiry objects
const normalise = (u) => ({
    id:           u._id  || u.id,
    name:         u.name         || '',
    email:        u.email        || '',
    phone:        u.phone_number || '',
    enquiryAbout: u.description  || 'General Enquiry',
    message:      u.description  || '',
    status:       u.status       || 'New',
    createdAt:    u.created_by   || u.createdAt || new Date().toISOString()
});

export const enquiryService = {
    // List all contact-form enquiries
    list: async () => {
        const users = await userApi.list();
        return users.map(normalise);
    },

    // Delete an enquiry by ID
    delete: async (id) => userApi.delete(id),

    // Get specific enquiry details
    details: async (id) => userApi.details(id)
};
