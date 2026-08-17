import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, Ticket, CheckSquare, Trash2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationBell = () => {
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        clearAll 
    } = useNotifications();
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTimeAgo = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            
            if (isNaN(diffMs) || diffMs < 0) return 'Just now';
            
            const seconds = Math.floor(diffMs / 1000);
            if (seconds < 10) return 'Just now';
            if (seconds < 60) return `${seconds}s ago`;
            
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            
            const days = Math.floor(hours / 24);
            if (days === 1) return 'Yesterday';
            if (days < 7) return `${days}d ago`;
            
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch {
            return 'Just now';
        }
    };

    const handleItemClick = (n) => {
        markAsRead(n.id);
        setIsOpen(false);
        navigate(n.link);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full border bg-white shadow-sm transition-all relative outline-none hover:bg-slate-50 hover:border-slate-300 ${
                    isOpen ? 'border-primary-400 ring-2 ring-primary-100 text-primary-600' : 'border-slate-200 text-slate-600'
                }`}
                title="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1.5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-[11px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 hover:underline transition-colors cursor-pointer"
                                    title="Mark all as read"
                                >
                                    <CheckSquare className="h-3.5 w-3.5" />
                                    <span>Read all</span>
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-slate-400 hover:text-red-600 font-medium flex items-center gap-1 hover:underline transition-colors cursor-pointer"
                                    title="Clear notification list"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Clear</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content List */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                            <div className="py-12 px-4 flex flex-col items-center justify-center text-center text-slate-400">
                                <Bell className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
                                <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                                <p className="text-xs mt-1 text-slate-400 max-w-[200px]">
                                    We'll alert you here when new enquiries or bookings arrive.
                                </p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const isBooking = n.type === 'booking';
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleItemClick(n)}
                                        className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50/75 transition-colors relative group ${
                                            !n.read ? 'bg-primary-50/10' : ''
                                        }`}
                                    >
                                        {/* Status Dot */}
                                        {!n.read && (
                                            <span className="absolute top-4.5 right-4 h-2 w-2 rounded-full bg-primary-500" />
                                        )}

                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            {isBooking ? (
                                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <Ticket className="h-4.5 w-4.5" />
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                                    <Mail className="h-4.5 w-4.5" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Texts */}
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400 block mb-0.5">
                                                    {isBooking ? 'Reservation' : 'Enquiry'}
                                                </span>
                                            </div>
                                            <h4 className={`text-xs font-semibold text-slate-800 leading-snug group-hover:text-primary-600 transition-colors ${
                                                !n.read ? 'font-bold' : ''
                                            }`}>
                                                {n.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                {formatTimeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
                            <span className="text-[10px] text-slate-400">
                                Click notifications to view their detail pages
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
