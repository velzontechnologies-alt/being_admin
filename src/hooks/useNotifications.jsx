import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { eventApi } from '../api/eventApi';
import { enquiryService } from '../services/enquiryService';
import ToastContainer from '../components/layout/ToastContainer';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [toasts, setToasts] = useState([]);
    
    // Keep track of seen IDs to avoid stale closures in polling
    const seenIdsRef = useRef(new Set());

    // Load seen IDs from localStorage on mount
    useEffect(() => {
        const savedSeen = localStorage.getItem('seenItemIds');
        if (savedSeen) {
            seenIdsRef.current = new Set(JSON.parse(savedSeen));
        }
    }, []);

    // Save notifications to localStorage when changed
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Save seen IDs helper
    const saveSeenIds = (idsSet) => {
        localStorage.setItem('seenItemIds', JSON.stringify(Array.from(idsSet)));
    };

    const addToast = (title, message, link, type) => {
        const toastId = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id: toastId, title, message, link, type }]);
        // Automatically dismiss toast after 6 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 6000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const fetchNotifications = async (isFirstLoad = false) => {
        try {
            // Load both concurrently
            const [bookingData, enquiryData] = await Promise.allSettled([
                eventApi.bookingList(),
                enquiryService.list()
            ]);

            const bookings = bookingData.status === 'fulfilled' ? (bookingData.value || []) : [];
            const enquiries = enquiryData.status === 'fulfilled' ? (enquiryData.value || []) : [];

            const hasSeenInitialized = localStorage.getItem('seenItemIds') !== null;
            
            let isNewSeenAdded = false;
            const currentSeenIds = new Set(seenIdsRef.current);
            const newNotifications = [];

            // 1. Process bookings
            bookings.forEach(b => {
                const id = b._id || b.id;
                if (!id) return;
                
                if (!currentSeenIds.has(id)) {
                    currentSeenIds.add(id);
                    isNewSeenAdded = true;

                    // Only alert if we have already established baseline and this is not the initial authentication call
                    if (hasSeenInitialized && !isFirstLoad) {
                        const name = b.first_name ? `${b.first_name} ${b.last_name || ''}`.trim() : (b.name || 'A user');
                        const rawEventId = b.event_id?.id || b.event_id?._id || b.event_id || '';
                        const eventTitle = b.event_id?.title || rawEventId || 'an event';

                        const notif = {
                            id,
                            type: 'booking',
                            title: 'New Seat Reservation',
                            message: `${name} registered for "${eventTitle}"`,
                            createdAt: b.createdAt || new Date().toISOString(),
                            read: false,
                            link: '/reservations'
                        };
                        newNotifications.push(notif);
                    }
                }
            });

            // 2. Process enquiries
            enquiries.forEach(e => {
                const id = e.id || e._id;
                if (!id) return;

                if (!currentSeenIds.has(id)) {
                    currentSeenIds.add(id);
                    isNewSeenAdded = true;

                    // Only alert if we have already established baseline and this is not the initial authentication call
                    if (hasSeenInitialized && !isFirstLoad) {
                        const sourceLabel = e.sourceLabel || 'General Enquiry';
                        const notif = {
                            id,
                            type: 'enquiry',
                            title: `New ${sourceLabel}`,
                            message: `New message from ${e.name || 'Anonymous'}`,
                            createdAt: e.createdAt || new Date().toISOString(),
                            read: false,
                            link: '/enquiries'
                        };
                        newNotifications.push(notif);
                    }
                }
            });

            // If we have new notifications, update state and trigger toasts
            if (newNotifications.length > 0) {
                // Prepend new notifications to the top
                setNotifications(prev => [...newNotifications, ...prev]);
                // Trigger toast for each
                newNotifications.forEach(n => {
                    addToast(n.title, n.message, n.link, n.type);
                });
            }

            // Save the updated seen set if changed
            if (isNewSeenAdded) {
                seenIdsRef.current = currentSeenIds;
                saveSeenIds(currentSeenIds);
            }
            
            // Mark seen initialized if it wasn't
            if (!hasSeenInitialized) {
                localStorage.setItem('seenItemIds', JSON.stringify(Array.from(currentSeenIds)));
            }

        } catch (error) {
            console.error('Error polling notifications:', error);
        }
    };

    // Polling effect
    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        // On mount/auth, perform baseline checks
        fetchNotifications(true);

        const timer = setInterval(() => {
            fetchNotifications(false);
        }, 10000); // 10 seconds

        return () => clearInterval(timer);
    }, [isAuthenticated]);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const pollNow = () => {
        fetchNotifications(false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            clearAll,
            toasts,
            removeToast,
            pollNow
        }}>
            {children}
            <ToastContainer />
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
