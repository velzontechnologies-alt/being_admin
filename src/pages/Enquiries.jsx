import React, { useState, useEffect } from 'react';
import { Mail, Search, Eye, Trash2, Phone, Calendar, Globe, Building, Clock, MessageSquare, Compass, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { confirmDialog, showAlert } from '../components/shared/ConfirmDialog';
import { formApi } from '../api/formApi';
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

/**
 * Colour config for each form source badge.
 * Labels match the exact form names shown on the public website.
 *
  *   'journey' → Contact page  "Start Your Journey" tab    → /form/create
 *   'general' → Contact page  "General Enquiry" tab       → /form/create
 *   'clarity' → Contact page  "Complimentary Call" tab    → /form/create
 *   'guide'   → Blog page     "Free Guide Download" popup → /form/create
 */
const SOURCE_CONFIG = {
    journey: { label: 'Start Your Journey',  dot: 'bg-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700' },
    general: { label: 'General Enquiry',     dot: 'bg-slate-400',  bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600' },
    clarity: { label: 'Complimentary Call',  dot: 'bg-teal-500',   bg: 'bg-teal-50',   border: 'border-teal-200',  text: 'text-teal-700'  },
    guide:   { label: 'Guide Download',      dot: 'bg-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
};

const SourceBadge = ({ source }) => {
    const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG.general;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap ${cfg.bg} ${cfg.border} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        loadEnquiries();
    }, []);

    const loadEnquiries = async () => {
        try {
            setLoading(true);
            const data = await formApi.list();
            // Normalise form data
            const normalised = (data || []).map(f => {
                const desc            = f.description || '';
                const hasSupportWith  = Array.isArray(f.support_with) && f.support_with.length > 0;
                const isClarityCall   = desc.startsWith('[Complimentary Call]');
                const isGuideDownload = desc.startsWith('[Guide Download]');
                const isJourney       = !isClarityCall && !isGuideDownload && hasSupportWith;

                let source, sourceLabel;
                if (isClarityCall) { source = 'clarity'; sourceLabel = 'Complimentary Call'; }
                else if (isGuideDownload) { source = 'guide'; sourceLabel = 'Guide Download'; }
                else if (isJourney) { source = 'journey'; sourceLabel = 'Start Your Journey'; }
                else               { source = 'general'; sourceLabel = 'General Enquiry'; }

                const { metadata } = parseMessageDescription(desc);
                
                const getMetadataVal = (variants) => {
                    const lowercaseKeys = Object.keys(metadata).reduce((acc, key) => {
                        acc[key.toLowerCase()] = metadata[key];
                        return acc;
                    }, {});
                    for (const variant of variants) {
                        const val = lowercaseKeys[variant.toLowerCase()];
                        if (val) return val;
                    }
                    return null;
                };

                const program = getMetadataVal(['Programme', 'Programe', 'Program']) || metadata['Focus Topic'] || null;
                const programId = f.program_id || getMetadataVal(['Program ID', 'Programme ID', 'Programe ID']) || null;

                return {
                    id:             f._id        || f.id,
                    name:           f.name       || '',
                    email:          f.email      || '',
                    phone:          f.phone_number || '',
                    enquiryAbout:   Array.isArray(f.interested_in) ? f.interested_in.join(', ') : (f.interested_in || 'General Enquiry'),
                    supportWith:    Array.isArray(f.support_with)  ? f.support_with.join(', ')  : (f.support_with  || ''),
                    sourceAboutUs:  f.source_about_us || '',
                    message:        desc,
                    createdAt:      f.created_by  || f.createdAt || new Date().toISOString(),
                    source,
                    sourceLabel,
                    program,
                    programId
                };
            });
            setEnquiries(normalised);
        } catch (error) {
            console.error("Failed to load enquiries", error);
            setEnquiries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (enq) => {
        setSelectedEnquiry(enq);
        setIsDetailOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmDialog({
            title: 'Delete Submission?',
            text: 'Are you sure you want to delete this enquiry submission? This cannot be undone.'
        });
        if (confirmed) {
            try {
                await formApi.delete(id);
                setEnquiries(prev => prev.filter(e => e.id !== id));
                showAlert({ title: 'Deleted!', text: 'Enquiry removed', icon: 'success' });
            } catch (error) {
                showAlert({ title: 'Error', text: 'Failed to delete enquiry', icon: 'error' });
            }
        }
    };

    const filteredEnquiries = enquiries.filter(enq =>
        (enq.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (enq.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (enq.enquiryAbout || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedEnquiries = [...filteredEnquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                        <Mail className="h-6 w-6 text-[#B3925B]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 font-serif">Form Enquiries</h1>
                        <p className="text-slate-500 text-sm">Review messages and requests submitted through the contact forms</p>
                    </div>
                </div>
                <Button 
                    variant="secondary" 
                    onClick={loadEnquiries} 
                    className="gap-2 shrink-0"
                    isLoading={loading}
                >
                    {!loading && <RefreshCw className="h-4 w-4 text-[#B3925B]" />}
                    Refresh
                </Button>
            </div>

            {/* Toolbar */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, or program interest..."
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
            ) : sortedEnquiries.length > 0 ? (
                <Table headers={['Date', 'Source', 'Name', 'Email Address', 'Phone Number', 'Interest', 'Actions']}>
                    {sortedEnquiries.map((enq) => (
                        <TableRow key={enq.id}>
                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">{formatDate(enq.createdAt)}</TableCell>
                            <TableCell>
                                <SourceBadge source={enq.source} />
                            </TableCell>
                            <TableCell className="font-bold text-slate-800 whitespace-nowrap">{enq.name}</TableCell>
                            <TableCell>{enq.email}</TableCell>
                            <TableCell className="text-slate-500 whitespace-nowrap">{enq.phone || 'N/A'}</TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 items-start">
                                    <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs text-slate-600 font-medium inline-block truncate max-w-[160px]">
                                        {enq.enquiryAbout}
                                    </span>
                                    {enq.program && (
                                        <span className="bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-700 inline-block truncate max-w-[160px]" title={enq.program}>
                                            Prog: {enq.program}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleViewDetail(enq)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleDelete(enq.id)}
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
                    <p className="text-slate-400">No form enquiries found.</p>
                </div>
            )}

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Enquiry Detail"
                width="max-w-2xl"
            >
                {selectedEnquiry && (() => {
                    const { message, metadata } = parseMessageDescription(selectedEnquiry.message);
                    return (
                        <div className="space-y-6 text-left">
                            {/* Profile Card Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-[#B3925B] text-white flex items-center justify-center text-xl font-bold font-serif shadow-sm">
                                        {selectedEnquiry.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg font-serif">
                                            {selectedEnquiry.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(selectedEnquiry.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1.5">
                                    <SourceBadge source={selectedEnquiry.source} />
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
                                                <a href={`mailto:${selectedEnquiry.email}`} className="text-sm text-slate-700 font-medium hover:text-[#B3925B] transition-colors break-all">
                                                    {selectedEnquiry.email}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] uppercase font-semibold text-slate-400">Phone Number</p>
                                                <p className="text-sm text-slate-700 font-medium">{selectedEnquiry.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Preferences */}
                                <div className="space-y-4 border border-slate-100 rounded-2xl p-5 bg-white shadow-sm shadow-slate-100/40">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#B3925B] mb-2 flex items-center gap-2">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        Intent & Enquiry Context
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5">programs of Interest</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(selectedEnquiry.enquiryAbout || '').split(', ').filter(Boolean).map((item, i) => (
                                                    <span key={i} className="bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-700">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedEnquiry.supportWith && (
                                            <div>
                                                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5">Support Needed With</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedEnquiry.supportWith.split(', ').filter(Boolean).map((item, i) => (
                                                        <span key={i} className="bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-600">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedEnquiry.sourceAboutUs && (
                                            <div className="flex items-start gap-2 pt-1">
                                                <Globe className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-semibold text-slate-400">Heard About Us Via</p>
                                                    <p className="text-xs text-slate-600 font-medium">{selectedEnquiry.sourceAboutUs}</p>
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
                                        Form Metadata (Extracted)
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
                                    Client Message
                                </h4>
                                <div className="bg-[#FAF9F5] border border-amber-100/40 rounded-2xl p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line shadow-xs">
                                    {message ? (
                                        <p className="font-light text-slate-600 italic">"{message}"</p>
                                    ) : (
                                        <span className="text-slate-400 italic">No message text provided.</span>
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

export default Enquiries;
