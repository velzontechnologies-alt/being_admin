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
import { Table, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { eventService, programService, galleryService, enquiryService } from '../services';
import { formatDate } from '../utils/cn';
import { showAlert } from '../components/shared/ConfirmDialog';

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

            const sortedEnqs = [...enqList].sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                const idA = a.id || a._id || '';
                const idB = b.id || b._id || '';
                return idB.localeCompare(idA);
            });

            const recentEnquiries = sortedEnqs.slice(0, 5);

            setStats({
                enquiriesTotal: enqList.length,
                programsTotal: progs.length,
                eventsTotal: events.length,
                galleryTotal: gallery.length
            });

            setPendingEnquiries(recentEnquiries);
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

            {/* Recent Enquiries Inbox Panel */}
            <Card className="border-slate-100 bg-white">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Inbox className="h-5 w-5 text-[#B3925B]" />
                            <h3 className="text-base font-bold text-slate-800 font-serif">Recent Enquiries Inbox</h3>
                        </div>
                        <button onClick={() => navigate('/enquiries')} className="text-xs font-semibold text-[#B3925B] hover:text-[#9A7D4C] flex items-center gap-1">
                            Go to Enquiries <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>

                    {pendingEnquiries.length > 0 ? (
                        <Table headers={['Submission Date', 'Name', 'Email Address', 'Interest']}>
                            {pendingEnquiries.map((enq) => (
                                <TableRow key={enq.id}>
                                    <TableCell className="text-xs">{formatDate(enq.createdAt)}</TableCell>
                                    <TableCell className="font-bold text-slate-800 text-xs">{enq.name}</TableCell>
                                    <TableCell className="text-xs">{enq.email}</TableCell>
                                    <TableCell>
                                        <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] text-slate-600 font-medium block truncate max-w-[150px]">
                                            {enq.enquiryAbout}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                            <div className="p-3 bg-green-50 text-green-600 rounded-full">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="font-serif text-lg font-bold text-slate-800">No Enquiries Yet</h4>
                                <p className="text-slate-400 text-xs mt-1">There are no submission records stored on the server.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
