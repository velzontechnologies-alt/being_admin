// reviewService.js - review/testimonial management helpers
import { reviewApi } from '../api/reviewApi';

// Formats API data to be UI-ready
const normalise = (r) => ({
    id:          r._id || r.id,
    name:        r.name        || '',
    tag:         r.tag         || '',
    description: r.description  || '',
    createdAt:   r.created_by  || r.createdAt || null
});

export const reviewService = {
    // List all reviews
    list: async () => {
        const raw = await reviewApi.list();
        return { data: raw.map(normalise) };
    },

    // Create a new review
    create: async (data) => {
        return reviewApi.create({
            name:        data.name,
            tag:         data.tag,
            description: data.description
        });
    },

    // Delete a review by ID
    delete: async (id) => {
        return reviewApi.delete(id);
    }
};
