import React, { useState, useEffect } from 'react';
import { Mail, Search, Eye, Trash2, Ticket, Phone, Calendar, Globe, Building, Clock, MessageSquare, Compass, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { confirmDialog, showAlert } from '../components/shared/ConfirmDialog';
import { eventApi } from '../api/eventApi';
import { formatDate } from '../utils/cn';
import Skeleton from '../components/ui/Skeleton';

const parseMessageDescription = (rawMessage) => {
    if (!rawMessage) return { message: '', metadata: {} };
    
    const metadata = {};
    let messageContent = rawMessage;

    // 1. Try to parse pipe-separated first (like in Contact.jsx general form)
    if (rawMessage.includes('|')) {
        const parts = rawMessage.split('|').map(p => p.trim());
        let mainMsg = [];
        parts.forEach(part => {
            const colonIndex = part.indexOf(':');
            if (colonIndex > 0) {
                const key = part.substring(0, colonIndex).trim();
                const value = part.substring(colonIndex + 1).trim();
                metadata[key] = value;
            } else {
                mainMsg.push(part);
            }
        });
        messageContent = mainMsg.join(' | ');
        return { message: messageContent, metadata };
    }

    // 2. Try to parse "Reason: ... Occupation: ... Country: ..." style (like from legacy booking description)
    const keys = ['Reason', 'Occupation', 'Country', 'Focus Topic', 'Organisation', 'DOB', 'Event Timing', 'Event Location', 'Event Reservation'];
    
    let tempMsg = rawMessage;
    keys.forEach(key => {
        const regex = new RegExp(`(?:^|\\.|\\b)${key}\\s*:\\s*([^\\.]+)(?:\\b|\\.|$)`, 'i');
        const match = tempMsg.match(regex);
        if (match) {
            metadata[key] = match[1].trim();
            tempMsg = tempMsg.replace(match[0], '').trim();
        }
    });
    
    messageContent = tempMsg.replace(/^\.+|\.+$/g, '').trim();
    if (!messageContent && Object.keys(metadata).length > 0) {
        messageContent = rawMessage;
    }

    return { message: messageContent, metadata };
};

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRes, setSelectedRes] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            setLoading(true);
            
            // Load both reservations and events in parallel
            const [bookingData, eventData] = await Promise.all([
                eventApi.bookingList(),
                eventApi.list()
            ]);

            // Create a lookup map of eventId -> eventTitle
            const eventMap = {};
            (eventData || []).forEach(e => {
                const id = e._id || e.id;
                if (id) eventMap[id] = e.title;
            });

            // Normalise event bookings list data
            const normalised = (bookingData || []).map(u => {
                const rawEventId = u.event_id?.id || u.event_id?._id || u.event_id || '';
                const eventTitle = u.event_id?.title || eventMap[rawEventId] || rawEventId || 'Event Booking';

                return {
                    id:            u._id        || u.id,
                    name:          u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : (u.name || ''),
                    email:         u.email      || '',
                    phone:         u.phone_number || '',
                    enquiryAbout:  eventTitle,
                    supportWith:   u.occupation || '',
                    message:       `Occupation: ${u.occupation || 'N/A'} | Country: ${u.country || 'N/A'} | Reason: ${u.description || ''}`,
                    createdAt:     u.created_by  || u.createdAt || new Date().toISOString()
                };
            });
            setReservations(normalised);
        } catch (error) {
            console.error("Failed to load reservations", error);
            setReservations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (res) => {
        setSelectedRes(res);
        setIsDetailOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmDialog({
            title: 'Delete Reservation?',
            text: 'Are you sure you want to delete this seat reservation? This cannot be undone.'
        });
        if (confirmed) {
            try {
                await eventApi.bookingDelete(id);
                setReservations(prev => prev.filter(r => r.id !== id));
                showAlert({ title: 'Deleted!', text: 'Reservation removed', icon: 'success' });
            } catch (error) {
                showAlert({ title: 'Error', text: 'Failed to delete reservation', icon: 'error' });
            }
        }
    };

    const filtered = reservations.filter(r =>
        (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.enquiryAbout || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                        <Ticket className="h-6 w-6 text-[#B3925B]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 font-serif">Event Reservations</h1>
                        <p className="text-slate-500 text-sm">Review seats reserved by users for signature programs and events</p>
                    </div>
                </div>
                <Button 
                    variant="secondary" 
                    onClick={loadReservations} 
                    className="gap-2 shrink-0"
                    isLoading={loading}
                >
                    {!loading && <RefreshCw className="h-4 w-4 text-[#B3925B]" />}
                    Refresh
                </Button>
            </div>

            {/* Search Toolbar */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, or event title..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <Card className="p-6">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </Card>
            ) : sorted.length > 0 ? (
                <Table headers={['Date', 'Name', 'Email Address', 'Phone Number', 'Details / Programe', 'Actions']}>
                    {sorted.map((res) => (
                        <TableRow key={res.id}>
                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">{formatDate(res.createdAt)}</TableCell>
                            <TableCell className="font-bold text-slate-800 whitespace-nowrap">{res.name}</TableCell>
                            <TableCell>{res.email}</TableCell>
                            <TableCell className="text-slate-500 whitespace-nowrap">{res.phone || 'N/A'}</TableCell>
                            <TableCell>
                                <span className="bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs text-blue-700 font-medium block truncate max-w-[180px]">
                                    {res.enquiryAbout}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleViewDetail(res)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleDelete(res.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </Table>
            ) : (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400">No event reservations found.</p>
                </div>
            )}

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Reservation Detail"
                width="max-w-2xl"
            >
                {selectedRes && (() => {
                    const { message, metadata } = parseMessageDescription(selectedRes.message);
                    return (
                        <div className="space-y-6 text-left">
                            {/* Profile Card Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-[#B3925B] text-white flex items-center justify-center text-xl font-bold font-serif shadow-sm">
                                        {selectedRes.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg font-serif">
                                            {selectedRes.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(selectedRes.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1.5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap bg-blue-50 border-blue-200 text-blue-700">
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500" />
                                        Seat Reservation
                                    </span>
                                </div>
                            </div>

                            {/* Contact Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Contact info */}
                                <div className="space-y-4 border border-slate-100 rounded-2xl p-5 bg-white shadow-sm shadow-slate-100/40">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#B3925B] mb-2 flex items-center gap-2">
                                        <Compass className="h-3.5 w-3.5" />
                                        Contact Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] uppercase font-semibold text-slate-400">Email Address</p>
                                                <a href={`mailto:${selectedRes.email}`} className="text-sm text-slate-700 font-medium hover:text-[#B3925B] transition-colors break-all">
                                                    {selectedRes.email}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] uppercase font-semibold text-slate-400">Phone Number</p>
                                                <p className="text-sm text-slate-700 font-medium">{selectedRes.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Preferences */}
                                <div className="space-y-4 border border-slate-100 rounded-2xl p-5 bg-white shadow-sm shadow-slate-100/40">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#B3925B] mb-2 flex items-center gap-2">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        Event & Context Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5">Programe / Event</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(selectedRes.enquiryAbout || '').split(', ').filter(Boolean).map((item, i) => (
                                                    <span key={i} className="bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-700">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedRes.supportWith && (
                                            <div>
                                                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5">Support Needed With</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedRes.supportWith.split(', ').filter(Boolean).map((item, i) => (
                                                        <span key={i} className="bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-600">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dynamically Extracted Metadata Fields */}
                            {Object.keys(metadata).length > 0 && (
                                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Reservation Metadata (Extracted)
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {Object.entries(metadata).map(([key, val]) => (
                                            <div key={key} className="bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                                                    {key}
                                                </span>
                                                <span className="text-sm text-slate-700 font-semibold">
                                                    {val}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Message Block */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Additional Notes / Message
                                </h4>
                                <div className="bg-[#FAF9F5] border border-amber-100/40 rounded-2xl p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line shadow-xs">
                                    {message ? (
                                        <p className="font-light text-slate-600 italic">"{message}"</p>
                                    ) : (
                                        <span className="text-slate-400 italic">No notes provided.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
};

export default Reservations;
