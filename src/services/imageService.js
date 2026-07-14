/**
 * imageService.js — Business logic for Site Images AND Programs.
 *
 * Both use the /image/* endpoints. Programs are distinguished from
 * static site-image slots by their card_title value:
 *   Static slots: 'logo', 'about', 'programs', 'facilities', 'hero', 'founder'
 *   Programs:     everything else
 *
 * Pages should import from this service, NOT from imageApi directly.
 */

import { imageApi } from '../api/imageApi';

const STATIC_SLOTS = ['logo', 'about', 'programs', 'facilities', 'hero', 'founder'];

// ─── Site Images ──────────────────────────────────────────────────────────────

export const imageService = {

    /** Fetch the raw image list (used internally and by HeroSection). */
    listAll: async () => imageApi.list(),

    /**
     * Upsert a static site-image slot.
     * Looks up existing record by card_title; creates if absent, updates if found.
     */
    upsertSlot: async (sectionId, file) => {
        const items = await imageApi.list();
        const existing = items.find(item => item.card_title === sectionId);
        if (existing?._id) {
            return imageApi.update({ _id: existing._id, file });
        }
        return imageApi.create({
            file,
            card_title:       sectionId,
            card_description: `${sectionId} Section Image`,
            card_status:      true
        });
    },

    /** Delete a static site-image slot by sectionId (card_title). */
    deleteSlot: async (sectionId) => {
        const items = await imageApi.list();
        const existing = items.find(item => item.card_title === sectionId);
        if (existing?._id) {
            return imageApi.delete(existing._id);
        }
        return { success: false, message: 'Image slot not found' };
    }
};

// ─── Programs ─────────────────────────────────────────────────────────────────

/** Normalise a raw image record into a UI-ready program object. */
const normaliseProgram = (p) => ({
    id:          p._id  || p.id,
    title:       p.card_title       || '',
    outcome:     p.card_description || '',
    description: p.card_description || '',
    img:         p.card_image || p.image || p.file || p.url || '',
    status:      p.card_status !== undefined ? Boolean(p.card_status) : true
});

export const programService = {

    /** List all programs (image records that are NOT static slots). */
    list: async () => {
        const items = await imageApi.list();
        const programs = items.filter(item => !STATIC_SLOTS.includes(item.card_title));
        return { data: programs.map(normaliseProgram) };
    },

    /** Create a new program. `data.img` should be a File from ImageUploader. */
    create: async (data) => {
        return imageApi.create({
            file:             data.img instanceof File ? data.img : undefined,
            card_title:       data.title,
            card_description: data.outcome || data.description,
            card_status:      data.status !== undefined ? data.status : true
        });
    },

    /** Update an existing program by _id. */
    update: async (data) => {
        return imageApi.update({
            _id:              data._id || data.id,
            file:             data.img instanceof File ? data.img : undefined,
            card_title:       data.title,
            card_description: data.outcome || data.description,
            card_status:      data.status !== undefined ? data.status : true
        });
    },

    /** Delete a program by _id. */
    delete: async (id) => imageApi.delete(id),

    /** Upload/replace only the image for a program. */
    uploadImage: async (id, file) => imageApi.updateImage({ _id: id, file })
};
