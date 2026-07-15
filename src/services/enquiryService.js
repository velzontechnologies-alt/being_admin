/**
 * enquiryService.js — Merges enquiries from two sources:
 *
 *   SOURCE A: /user/list   — Event seat reservation forms (Events.jsx)
 *   SOURCE B: /form/list   — Website contact forms:
 *               • "Start Your Journey" intake    (journey tab in Contact.jsx)
 *               • "General Enquiry" form         (general tab in Contact.jsx)
 *               • "Complimentary Call" form      (WhyUs.jsx clarity call)
 *
 * Each normalised record is tagged with a `source` field so the UI
 * can render a coloured badge indicating which form it came from.
 *
 *   source === 'event'    → "Seat Reservation"    (blue)
 *   source === 'journey'  → "Start Your Journey"  (amber/gold)
 *   source === 'general'  → "General Enquiry"     (slate)
 *   source === 'clarity'  → "Complimentary Call"  (teal/green)
 */

import { userApi } from '../api/userApi';
import { formApi } from '../api/formApi';

// ─── Normalisers ────────────────────────────────────────────────────────────

/**
 * Normalise a /user/* record.
 *
 * Two types of records land in /user/list:
 *   1. Event seat reservations (Events.jsx)
 *      → description starts with "Event Reservation:"
 *   2. Old complimentary call submissions (WhyUs.jsx, before migration to /form/create)
 *      → description starts with "Request for a complimentary"
 *
 * Going forward all complimentary call records go to /form/list,
 * but legacy records still need correct detection here.
 */
const normaliseUser = (u) => {
    const desc = u.description || '';

    // Detect legacy complimentary call records by description pattern
    const isClarityCall = desc.toLowerCase().includes('complimentary') ||
                          desc.toLowerCase().includes('clarity call') ||
                          (u.support_with === 'Clarity Conversation Form'); // old string value

    const source      = isClarityCall ? 'clarity' : 'event';
    const sourceLabel = isClarityCall ? 'Complimentary Call' : 'Seat Reservation';

    return {
        id:             u._id        || u.id,
        name:           u.name       || '',
        email:          u.email      || '',
        phone:          u.phone_number || '',
        enquiryAbout:   Array.isArray(u.interested_in) ? u.interested_in.join(', ') : (u.interested_in || 'Event'),
        supportWith:    Array.isArray(u.support_with)  ? u.support_with.join(', ')  : (u.support_with  || ''),
        sourceAboutUs:  u.source_about_us || '',
        message:        desc,
        status:         u.status      || 'New',
        createdAt:      u.created_by  || u.createdAt || new Date().toISOString(),
        source,
        sourceLabel,
    };
};

/**
 * Normalise a /form/* record (Contact.jsx journey or general form).
 * Distinguishes Journey vs General by whether support_with is populated:
 *   - Journey form always sends support_with[] (user selected support areas)
 *   - General form always sends support_with: []
 */
const normaliseForm = (f) => {
    const desc            = f.description || '';
    const hasSupportWith  = Array.isArray(f.support_with) && f.support_with.length > 0;

    // Detect Complimentary Call by description prefix written in WhyUs.jsx
    const isClarityCall = desc.startsWith('[Complimentary Call]');
    // Journey form always has support_with populated; general form sends []
    const isJourney     = !isClarityCall && hasSupportWith;
    const isGeneral     = !isClarityCall && !isJourney;

    let source, sourceLabel;
    if (isClarityCall) { source = 'clarity'; sourceLabel = 'Complimentary Call'; }
    else if (isJourney) { source = 'journey'; sourceLabel = 'Start Your Journey'; }
    else               { source = 'general'; sourceLabel = 'General Enquiry'; }

    return {
        id:             f._id        || f.id,
        name:           f.name       || '',
        email:          f.email      || '',
        phone:          f.phone_number || '',
        enquiryAbout:   Array.isArray(f.interested_in) ? f.interested_in.join(', ') : (f.interested_in || 'General Enquiry'),
        supportWith:    Array.isArray(f.support_with)  ? f.support_with.join(', ')  : (f.support_with  || ''),
        sourceAboutUs:  f.source_about_us || '',
        message:        desc,
        status:         f.status      || 'New',
        createdAt:      f.created_by  || f.createdAt || new Date().toISOString(),
        source,
        sourceLabel,
    };
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const enquiryService = {

    /**
     * Fetches from BOTH /user/list and /form/list concurrently,
     * normalises, tags, and merges into a single sorted list.
     */
    list: async () => {
        const [userResults, formResults] = await Promise.allSettled([
            userApi.list(),
            formApi.list(),
        ]);

        const users = userResults.status === 'fulfilled' ? (userResults.value || []) : [];
        const forms = formResults.status === 'fulfilled' ? (formResults.value || []) : [];

        if (userResults.status === 'rejected') {
            console.error('enquiryService: failed to fetch /user/list', userResults.reason);
        }
        if (formResults.status === 'rejected') {
            console.error('enquiryService: failed to fetch /form/list', formResults.reason);
        }

        const normalised = [
            ...users.map(normaliseUser),
            ...forms.map(normaliseForm),
        ];

        // Sort newest first
        return normalised.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    /**
     * Deletes an enquiry. Tries /user/delete first; if not found, tries /form/delete.
     * The `source` field on the record can be used to call the correct API directly.
     */
    delete: async (id, source) => {
        if (source === 'event') return userApi.delete(id);
        if (source === 'journey' || source === 'general') return formApi.delete(id);
        // Fallback: try both (legacy records without source tag)
        try { return await userApi.delete(id); } catch {
            return formApi.delete(id);
        }
    },

    details: async (id, source) => {
        if (source === 'event')   return userApi.details(id);
        if (source === 'journey' || source === 'general') return formApi.details(id);
        try { return await userApi.details(id); } catch {
            return formApi.details(id);
        }
    },
};
