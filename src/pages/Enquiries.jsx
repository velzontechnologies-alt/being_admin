import React, { useState, useEffect } from 'react';
import { Mail, Search, Eye, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { confirmDialog, showAlert } from '../components/shared/ConfirmDialog';
import { enquiryService } from '../services';
import { formatDate } from '../utils/cn';
import Skeleton from '../components/ui/Skeleton';

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
            const data = await enquiryService.list();
            setEnquiries(data || []);
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

    const handleStatusChange = (id, newStatus) => {
        // Optimistic local update — no backend status update route available
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
        showAlert({ title: 'Status Updated', text: `Enquiry marked as ${newStatus}`, icon: 'success' });
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmDialog({
            title: 'Delete Submission?',
            text: 'Are you sure you want to delete this enquiry submission? This cannot be undone.'
        });
        if (confirmed) {
            try {
                await enquiryService.delete(id);
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                        <Mail className="h-6 w-6 text-[#B3925B]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 font-serif">Enquiries / Form Submissions</h1>
                        <p className="text-slate-500 text-sm">Review and update statuses of messages submitted through the website</p>
                    </div>
                </div>
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
            ) : filteredEnquiries.length > 0 ? (
                <Table headers={['Submission Date', 'Name', 'Email Address', 'Interest', 'Status (Changeable)', 'Actions']}>
                    {filteredEnquiries.map((enq) => (
                        <TableRow key={enq.id}>
                            <TableCell>{formatDate(enq.createdAt)}</TableCell>
                            <TableCell className="font-bold text-slate-800">{enq.name}</TableCell>
                            <TableCell>{enq.email}</TableCell>
                            <TableCell>
                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs text-slate-600 font-medium block truncate max-w-[180px]">
                                    {enq.enquiryAbout}
                                </span>
                            </TableCell>
                            <TableCell>
                                <select
                                    value={enq.status || 'New'}
                                    onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#B3925B] ${
                                        enq.status === 'New'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : enq.status === 'In Progress'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-green-50 text-green-700 border-green-200'
                                    }`}
                                >
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Responded">Responded</option>
                                </select>
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
                footer={<Button onClick={() => setIsDetailOpen(false)}>Close</Button>}
            >
                {selectedEnquiry && (
                    <div className="space-y-6 text-left">
                        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400">Sender Name</h4>
                                <p className="font-bold text-slate-800 text-base">{selectedEnquiry.name}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400">Submission Date</h4>
                                <p className="text-slate-700 text-sm">{formatDate(selectedEnquiry.createdAt)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400">Email Address</h4>
                                <p className="text-slate-700 text-sm">{selectedEnquiry.email}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400">Phone Number</h4>
                                <p className="text-slate-700 text-sm">{selectedEnquiry.phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4 items-center">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Programme/Interest Topic</h4>
                                <span className="bg-primary-50 border border-primary-100 px-3 py-1 rounded-full text-xs font-bold text-[#B3925B] uppercase block w-fit">
                                    {selectedEnquiry.enquiryAbout}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1.5">Change Status</h4>
                                <select
                                    value={selectedEnquiry.status || 'New'}
                                    onChange={(e) => {
                                        handleStatusChange(selectedEnquiry.id, e.target.value);
                                        setSelectedEnquiry(prev => ({ ...prev, status: e.target.value }));
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#B3925B] ${
                                        selectedEnquiry.status === 'New'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : selectedEnquiry.status === 'In Progress'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-green-50 text-green-700 border-green-200'
                                    }`}
                                >
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Responded">Responded</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Message Content</h4>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                "{selectedEnquiry.message}"
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Enquiries;
