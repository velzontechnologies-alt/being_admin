/**
 * http.js — Shared HTTP helpers used across all API modules.
 * 
 * - buildFormData: converts a plain object into multipart FormData
 * - extractList:   normalises varied server response shapes into a plain array
 * - MULTIPART:     axios config shorthand for multipart/form-data requests
 */

/** Build a FormData object from a plain key-value object. Skips null/undefined. */
export const buildFormData = (fields) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        if (value !== null && value !== undefined) fd.append(key, value);
    });
    return fd;
};

/** Extract a plain array from varied server response shapes. */
export const extractList = (responseData) => {
    if (Array.isArray(responseData))                         return responseData;
    if (responseData && Array.isArray(responseData.data))   return responseData.data;
    return [];
};

/** Axios config to send as multipart/form-data. */
export const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };
