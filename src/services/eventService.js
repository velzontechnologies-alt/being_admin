// eventService.js - event management helpers
import { eventApi } from '../api/eventApi';

// Formats API data to be UI-ready
const normalise = (e) => ({
    id:          e._id || e.id,
    title:       e.title        || '',
    img:         e.image        || e.img   || '',
    description: e.description  || '',
    date:        e.start_date   ? e.start_date.split('T')[0] : '',
    time:        (e.start_time && e.end_time)
                    ? `${e.start_time} - ${e.end_time}`
                    : (e.start_time || ''),
    start_date:  e.start_date,
    end_date:    e.end_date,
    start_time:  e.start_time,
    end_time:    e.end_time,
    location:    e.location     || '',
    status:      e.status       !== undefined ? e.status : true
});

export const eventService = {
    // List all events
    list: async () => {
        const raw = await eventApi.list();
        return { data: raw.map(normalise) };
    },

    // Create a new event
    create: async (data) => {
        return eventApi.create({
            title:       data.title,
            description: data.description,
            start_date:  data.start_date,
            end_date:    data.end_date || data.start_date,
            start_time:  data.start_time,
            end_time:    data.end_time,
            location:    data.location || '',
            status:      data.status !== undefined ? data.status : true,
            file:        data.img instanceof File ? data.img : undefined
        });
    },

    // Update an existing event
    update: async (data) => {
        return eventApi.update({
            _id:         data._id || data.id,
            title:       data.title,
            description: data.description,
            start_date:  data.start_date,
            end_date:    data.end_date || data.start_date,
            start_time:  data.start_time,
            end_time:    data.end_time,
            location:    data.location || '',
            status:      data.status !== undefined ? data.status : true,
            file:        data.img instanceof File ? data.img : undefined,
            remove_image: data.remove_image
        });
    },

    // Delete an event by ID
    delete: async (idOrObj) => {
        const id = typeof idOrObj === 'object' ? (idOrObj._id || idOrObj.id) : idOrObj;
        return eventApi.delete(id);
    },

    // Upload cover image for an event safely preserving existing event details
    uploadImage: async (id, file) => {
        try {
            const raw = await eventApi.list();
            const existing = raw.find(e => (e._id || e.id) === id);
            if (existing) {
                return eventApi.update({
                    _id:         existing._id || existing.id,
                    title:       existing.title,
                    description: existing.description,
                    start_date:  existing.start_date,
                    end_date:    existing.end_date,
                    start_time:  existing.start_time,
                    end_time:    existing.end_time,
                    location:    existing.location,
                    status:      existing.status,
                    file
                });
            }
        } catch {
            // fallback to updateImage
        }
        return eventApi.updateImage({ _id: id, file });
    },

    // Get specific event details
    details: async (id) => {
        return eventApi.details(id);
    }
};
