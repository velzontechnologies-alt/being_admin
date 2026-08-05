import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Star, MessageSquare, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { confirmDialog, showAlert } from '../components/shared/ConfirmDialog';
import { reviewService } from '../services';
import { formatDate } from '../utils/cn';
import Skeleton from '../components/ui/Skeleton';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        tag: '',
        description: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewService.list();
            setReviews(response.data || []);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({ name: '', tag: '', description: '' });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmDialog({
            title: 'Delete Review?',
            text: 'Are you sure you want to remove this client testimonial? This action is irreversible.'
        });

        if (confirmed) {
            try {
                await reviewService.delete(id);
                setReviews(prev => prev.filter(r => r.id !== id));
                showAlert({ title: 'Deleted!', text: 'Review has been removed.', icon: 'success' });
            } catch (error) {
                showAlert({ title: 'Error', text: 'Failed to delete review.', icon: 'error' });
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.tag || !formData.description) {
            showAlert({ title: 'Validation Error', text: 'Please fill in all fields.', icon: 'error' });
            return;
        }

        setSaving(true);
        try {
            await reviewService.create(formData);
            showAlert({ title: 'Created!', text: 'Client review added successfully.', icon: 'success' });
            fetchReviews();
            setIsModalOpen(false);
        } catch (error) {
            showAlert({ title: 'Error', text: 'Failed to save review.', icon: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const filteredReviews = reviews.filter(r =>
        (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.tag || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort newest to the top
    const sortedReviews = [...filteredReviews].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        const idA = a.id || a._id || '';
        const idB = b.id || b._id || '';
        return idB.localeCompare(idA);
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                        <Star className="h-6 w-6 text-[#B3925B]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 font-serif">Client Reviews</h1>
                        <p className="text-slate-500 text-sm">Manage testimonials displayed on the public website</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button 
                        variant="secondary" 
                        onClick={fetchReviews} 
                        isLoading={loading}
                        className="gap-2"
                    >
                        {!loading && <RefreshCw className="h-4 w-4 text-[#B3925B]" />}
                        Refresh
                    </Button>
                    <Button onClick={handleOpenModal} className="gap-2">
                        <Plus className="h-5 w-5" /> Add Newcd
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by client name, tag, or description..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Reviews List/Table */}
            {loading ? (
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex gap-4 border-b border-slate-100 pb-3">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/6" />
                        </div>
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="flex gap-4 items-center">
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-5 w-1/6" />
                            </div>
                        ))}
                    </div>
                </Card>
            ) : sortedReviews.length > 0 ? (
                <Table headers={['Client Name', 'Tag / Category', 'Testimonial Quote', 'Date Added', 'Actions']}>
                    {sortedReviews.map((rev) => (
                        <TableRow key={rev.id}>
                            <TableCell className="font-bold text-slate-800 whitespace-nowrap">
                                {rev.name}
                            </TableCell>
                            <TableCell>
                                <span className="bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs text-amber-700 font-semibold uppercase tracking-wider">
                                    {rev.tag}
                                </span>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 max-w-[300px] truncate">
                                "{rev.description}"
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                {rev.createdAt ? formatDate(rev.createdAt) : 'N/A'}
                            </TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleDelete(rev.id)}
                                    title="Delete Review"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </Table>
            ) : (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-400">No client reviews found.</p>
                </div>
            )}

            {/* Create Review Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Client Review"
                width="max-w-lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={saving}>
                            Add Review
                        </Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <Input
                        label="Client Name"
                        placeholder="e.g. Sarah Jenkins"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                    />
                    <Input
                        label="Tag / Programe / Category"
                        placeholder="e.g. Personal Coaching, Youth Coaching"
                        value={formData.tag}
                        onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                        required
                    />
                    <TextArea
                        label="Testimonial Quote"
                        placeholder="Describe the client's transformational experience..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        required
                    />
                </form>
            </Modal>
        </div>
    );
};

export default Reviews;
