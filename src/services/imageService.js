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
const normaliseProgram = (p) => {
    const idealList = p.ideal ? p.ideal.split('\n').map(item => item.trim()).filter(Boolean) : [];
    const gainList = p.what_you_gain ? p.what_you_gain.split('\n').map(item => item.trim()).filter(Boolean) : [];
    const suitableList = p.suitable ? p.suitable.split('\n').map(item => item.trim()).filter(Boolean) : [];

    const id = p._id || p.id || '';
    const titleLower = (p.card_title || '').toLowerCase();

    // Identify the program category based on its title or original ID
    const isPersonal = id.includes('personal') || titleLower.includes('personal') || titleLower.includes('clarity');
    const isSpeaking = id.includes('speaking') || titleLower.includes('speaking') || titleLower.includes('keynote');
    const isAlignment = id.includes('align') || titleLower.includes('alignment');
    const isYouth = id.includes('youth') || titleLower.includes('youth') || titleLower.includes('young');
    const isWomens = id.includes('women') || titleLower.includes('women') || titleLower.includes('growth & renewal');
    const isCorporate = id.includes('corporate') || titleLower.includes('corporate') || titleLower.includes('group') || titleLower.includes('workshop');

    // Clean fallbacks so if it is none of these categories, we display standard idealFor and gains
    const isOther = !isPersonal && !isSpeaking && !isAlignment && !isYouth && !isWomens && !isCorporate;

    return {
        id:          p._id  || p.id,
        title:       p.card_title       || '',
        outcome:     p.tagline          || '',
        description: p.card_description || '',
        ideal:       p.ideal            || '',
        what_you_gain: p.what_you_gain  || '',
        suitable:    p.suitable         || '',
        tagline:     p.tagline          || '',
        key_out_come: p.key_out_come     || '',
        
        idealFor:    (isPersonal || isSpeaking || isOther) ? idealList : [],
        discoveries: isAlignment ? idealList : [],
        focusAreas:  isWomens ? idealList : [],
        
        gains:       (isPersonal || isYouth || isWomens || isCorporate || isSpeaking || isOther) ? gainList : [],
        topics:      isCorporate ? gainList : [],
        suitableFor: (isYouth || isCorporate) ? suitableList : [],
        
        keyOutcome:  p.key_out_come     || '',
        img:         p.card_image || p.image || p.file || p.url || p.img || '',
        status:      p.card_status !== undefined ? Boolean(p.card_status) : true
    };
};

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
            card_description: data.description,
            card_status:      data.status !== undefined ? data.status : true,
            ideal:            Array.isArray(data.idealFor) ? data.idealFor.join('\n') : (data.ideal || ''),
            what_you_gain:    Array.isArray(data.gains) ? data.gains.join('\n') : (data.what_you_gain || ''),
            suitable:         Array.isArray(data.suitableFor) ? data.suitableFor.join('\n') : (data.suitable || ''),
            tagline:          data.outcome || data.tagline || '',
            key_out_come:     data.keyOutcome || data.key_out_come || ''
        });
    },

    /** Update an existing program by _id. */
    update: async (data) => {
        return imageApi.update({
            _id:              data._id || data.id,
            file:             data.img instanceof File ? data.img : undefined,
            card_title:       data.title,
            card_description: data.description,
            card_status:      data.status !== undefined ? data.status : true,
            ideal:            Array.isArray(data.idealFor) ? data.idealFor.join('\n') : (data.ideal || ''),
            what_you_gain:    Array.isArray(data.gains) ? data.gains.join('\n') : (data.what_you_gain || ''),
            suitable:         Array.isArray(data.suitableFor) ? data.suitableFor.join('\n') : (data.suitable || ''),
            tagline:          data.outcome || data.tagline || '',
            key_out_come:     data.keyOutcome || data.key_out_come || '',
            remove_image:     data.remove_image
        });
    },

    /** Delete a program by _id. */
    delete: async (id) => imageApi.delete(id),

    /** Upload/replace only the image for a program safely preserving existing fields. */
    uploadImage: async (id, file) => {
        try {
            const items = await imageApi.list();
            const existing = items.find(item => (item._id || item.id) === id);
            if (existing) {
                return imageApi.update({
                    _id:              existing._id || existing.id,
                    file,
                    card_title:       existing.card_title,
                    card_description: existing.card_description,
                    card_status:      existing.card_status,
                    ideal:            existing.ideal,
                    what_you_gain:    existing.what_you_gain,
                    suitable:         existing.suitable,
                    tagline:          existing.tagline,
                    key_out_come:     existing.key_out_come
                });
            }
        } catch {
            // fallback to updateImage
        }
        return imageApi.updateImage({ _id: id, file });
    }
};
