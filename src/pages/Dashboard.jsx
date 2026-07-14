import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Calendar,
    Image as ImageIcon,
    Mail,
    ArrowRight,
    Clock,
    CheckCircle,
    Inbox
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { eventService, programService, galleryService, enquiryService } from '../services';
import { formatDate } from '../utils/cn';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        enquiriesTotal: 0,
        enquiriesNew: 0,
        programsTotal: 0,
        eventsTotal: 0,
        galleryTotal: 0
    });
    const [pendingEnquiries, setPendingEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Parallel API calls for all collections
            const [progRes, eventRes, galleryRes, enquiries] = await Promise.allSettled([
                programService.list(),
                eventService.list(),
                galleryService.list(),
                enquiryService.list()
            ]);

            const progs = progRes.status === 'fulfilled' ? (progRes.value?.data || []) : [];
            const events = eventRes.status === 'fulfilled' ? (eventRes.value?.data || []) : [];
            const gallery = galleryRes.status === 'fulfilled' ? (galleryRes.value?.data || []) : [];
            const enqList = enquiries.status === 'fulfilled' ? (enquiries.value || []) : [];

            const newEnquiries = enqList.filter(e => e.status === 'New');
            const pending = enqList.filter(e => e.status === 'New' || e.status === 'In Progress');

            setStats({
                enquiriesTotal: enqList.length,
                enquiriesNew: newEnquiries.length,
                programsTotal: progs.length,
                eventsTotal: events.length,
                galleryTotal: gallery.length
            });

            setPendingEnquiries(pending);
        } catch (error) {
            console.error("Failed to load dashboard statistics", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 font-serif">Dashboard</h1>
                <p className="text-slate-500 text-sm">Key website metrics and pending actions requiring your attention</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Enquiries Card */}
                <Card className="border-slate-100 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Form Enquiries</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-800">{stats.enquiriesTotal}</span>
                                {stats.enquiriesNew > 0 && (
                                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">
                                        {stats.enquiriesNew} new
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                            <Mail className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Programs Card */}
                <Card className="border-slate-100 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Programs</span>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.programsTotal}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                            <BookOpen className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Events Card */}
                <Card className="border-slate-100 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Upcoming Events</span>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.eventsTotal}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                            <Calendar className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Gallery Images Card */}
                <Card className="border-slate-100 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gallery Images</span>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.galleryTotal}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                            <ImageIcon className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Required Inbox Panel */}
            <Card className="border-slate-100 bg-white">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Inbox className="h-5 w-5 text-[#B3925B]" />
                            <h3 className="text-base font-bold text-slate-800 font-serif">Action Required Inbox</h3>
                        </div>
                        <button onClick={() => navigate('/enquiries')} className="text-xs font-semibold text-[#B3925B] hover:text-[#9A7D4C] flex items-center gap-1">
                            Go to Enquiries <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>

                    {pendingEnquiries.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {pendingEnquiries.map((enq) => (
                                <div key={enq.id} className="py-4 flex items-start justify-between gap-4 group">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-slate-800 text-sm">{enq.name}</span>
                                            <span className="text-slate-400 text-xs">•</span>
                                            <span className="text-slate-500 text-xs">{enq.email}</span>
                                            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-600 font-semibold uppercase tracking-wider">
                                                {enq.enquiryAbout}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-xs italic line-clamp-1">
                                            "{enq.message.replace(/^(Message: |Interests: )/, '')}"
                                        </p>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                                            <Clock className="h-3 w-3" />
                                            <span>Received {formatDate(enq.createdAt)}</span>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold shrink-0 border uppercase tracking-wider ${
                                        enq.status === 'New'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {enq.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                            <div className="p-3 bg-green-50 text-green-600 rounded-full">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="font-serif text-lg font-bold text-slate-800">All Caught Up!</h4>
                                <p className="text-slate-400 text-xs mt-1">There are no pending enquiries requiring follow-up action.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
