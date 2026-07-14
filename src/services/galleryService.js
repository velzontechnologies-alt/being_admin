// galleryService.js - gallery management helpers
import { galleryApi } from '../api/galleryApi';

// Formats API data to be UI-ready
const normalise = (item) => ({
    id:  item._id  || item.id,
    src: item.image || item.file || item.src || item.url || '',
    alt: item.alt  || (typeof item.status === 'string' ? item.status : '') || 'Gallery Image',
    status: typeof item.status === 'boolean' ? item.status : true,
    createdAt: item.created_by || item.createdAt || item.created_at || null
});

export const galleryService = {
    // Get all gallery images
    list: async () => {
        const raw = await galleryApi.list();
        return { data: raw.map(normalise) };
    },

    // Upload new image with description (saved to status field)
    upload: async (file, alt) => {
        return galleryApi.create({ file, status: alt });
    },

    // Update image file or status
    update: async (id, file, status) => {
        return galleryApi.update({ _id: id, file, status });
    },

    // Delete image by ID
    delete: async (id) => galleryApi.delete(id),

    // Get specific image details
    details: async (id) => galleryApi.details(id)
};
