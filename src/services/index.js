/**
 * services/index.js — Single entry point for all service imports.
 *
 * Pages should import exclusively from here:
 *   import { eventService, programService, galleryService, enquiryService, imageService } from '../services';
 *
 * Never import directly from api/* in a page component.
 */

export { eventService }   from './eventService';
export { imageService, programService } from './imageService';
export { galleryService } from './galleryService';
export { enquiryService } from './enquiryService';
export { authService }    from './authService';
