// galleryService.js - gallery management helpers
import { galleryApi } from '../api/galleryApi';

// Formats API data to be UI-ready
const normalise = (item) => {
    let heading = item.heading || '';
    let title = item.title || '';
    let description = item.description || '';
    let status = typeof item.status === 'boolean' ? item.status : true;

    // Backward compatibility parsing
    if (!heading && !title && !description) {
        const altStr = (typeof item.status === 'string' && item.status) || item.alt || '';
        
        // 1. Check if it's an EventMeta record
        const eventMetaMatch = String(altStr).match(/^\[EventMeta:\s*([^\]]+)\]\s*(.*)$/i);
        if (eventMetaMatch) {
            heading = eventMetaMatch[1].trim();
            const parts = eventMetaMatch[2].split('||');
            title = parts[0]?.trim() || '';
            description = parts[3]?.trim() || parts.slice(1).join(' ').trim();
        } else {
            // 2. Check if it's a normal Image record
            const eventMatch = String(altStr).match(/^\[Event:\s*([^\]]+)\]\s*(.*)$/i);
            if (eventMatch) {
                heading = eventMatch[1].trim();
                title = eventMatch[2].trim();
            } else {
                title = altStr || 'Gallery Image';
            }
        }
    }

    return {
        id:  item._id  || item.id,
        src: item.image || item.file || item.src || item.url || '',
        heading,
        title,
        description,
        sub_image: Array.isArray(item.sub_image) ? item.sub_image : [],
        status
    };
};

export const galleryService = {
    // Get all gallery images
    list: async () => {
        const raw = await galleryApi.list();
        return { data: raw.map(normalise) };
    },

    // Upload new image with details
    upload: async (file, payload) => {
        if (typeof payload === 'string') {
            // Backward compatibility fallback
            return galleryApi.create({ file, status: payload });
        }
        return galleryApi.create({ file, ...payload });
    },

    // Update image file or details
    update: async (id, file, statusOrPayload) => {
        if (typeof statusOrPayload === 'boolean') {
            return galleryApi.update({ _id: id, file, status: statusOrPayload });
        }
        if (typeof statusOrPayload === 'string') {
            // Backward compatibility fallback
            return galleryApi.update({ _id: id, file, status: statusOrPayload });
        }
        return galleryApi.update({ _id: id, file, ...statusOrPayload });
    },

    // Delete image by ID
    delete: async (id) => galleryApi.delete(id),

    // Get specific image details
    details: async (id) => galleryApi.details(id),

    // Add single sub-image to event
    addSubImage: async (id, file) => galleryApi.addSubImage({ _id: id, file })
};
