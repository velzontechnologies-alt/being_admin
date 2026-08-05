import React, { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Calendar as CalendarIcon,
    Search,
    Clock,
    MapPin,
    Eye,
    RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ImageUploader from '../components/shared/ImageUploader';
import { confirmDialog, showAlert } from '../components/shared/ConfirmDialog';
import { eventService } from '../services';
import { formatDate } from '../utils/cn';
import Skeleton from '../components/ui/Skeleton';

const Events = () => {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        location: '',
        status: true,
        img: null
    });
    const [previewUrl, setPreviewUrl] = useState(null); // For Live Preview
    const [saving, setSaving] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleOpenDetail = (event) => {
        setSelectedEvent(event);
        setIsDetailOpen(true);
    };

    // Initial fetch
    React.useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await eventService.list();
            setEvents(response.data || []);
        } catch (error) {
            console.error("Listing failed", error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = Array.isArray(events) ? events.filter(e =>
        e?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const handleOpenModal = (event = null) => {
        if (event) {
            setCurrentEvent(event);
            setFormData({
                title: event.title || '',
                description: event.description || '',
                start_date: event.start_date ? event.start_date.split('T')[0] : (event.date || ''),
                end_date: event.end_date ? event.end_date.split('T')[0] : (event.date || ''),
                start_time: event.start_time || '',
                end_time: event.end_time || '',
                location: event.location || '',
                status: event.status !== undefined ? Boolean(event.status) : true,
                img: null
            });
            setPreviewUrl(event.img || null);
        } else {
            setCurrentEvent(null);
            setFormData({ title: '', description: '', start_date: '', end_date: '', start_time: '', end_time: '', location: '', status: true, img: null });
            setPreviewUrl(null);
        }
        setIsModalOpen(true);
    };

    // Quick status toggle (no modal needed)
    const handleToggleStatus = async (event) => {
        const newStatus = !Boolean(event.status);
        // Optimistic UI update
        setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: newStatus } : e));
        try {
            await eventService.update({ _id: event.id, status: newStatus });
            showAlert({ title: 'Status Updated', text: `Event marked as ${newStatus ? 'Published' : 'Hidden'}`, icon: 'success' });
        } catch (err) {
            // Revert on failure
            setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: !newStatus } : e));
            showAlert({ title: 'Error', text: 'Could not update status', icon: 'error' });
        }
    };

    const handleImageChange = async (file, url) => {
        setFormData(prev => ({ ...prev, img: file }));
        setPreviewUrl(url);

        // Auto-upload if editing existing event
        if (currentEvent && file instanceof File) {
            try {
                await eventService.uploadImage(currentEvent.id, file);
                showAlert({ title: 'Success!', text: 'Image uploaded automatically', icon: 'success' });
                fetchEvents();
            } catch (error) {
                showAlert({ title: 'Upload Failed', text: 'Could not upload the new image', icon: 'error' });
            }
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmDialog({
            title: 'Delete Event?',
            text: 'This action cannot be undone. Are you sure you want to remove this event?'
        });

        if (confirmed) {
            try {
                await eventService.delete({ id, _id: id });
                setEvents(prev => prev.filter(e => e.id !== id));
                showAlert({ title: 'Deleted!', text: 'Event has been removed', icon: 'success' });
            } catch (error) {
                showAlert({ title: 'Error', text: 'Failed to delete event', icon: 'error' });
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const submissionData = {
            title: formData.title,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date || formData.start_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            location: formData.location,
            status: formData.status,
            img: formData.img
        };

        try {
            if (currentEvent) {
                await eventService.update({ ...submissionData, _id: currentEvent.id });
                showAlert({ title: 'Updated!', text: 'Event details updated successfully', icon: 'success' });
            } else {
                await eventService.create(submissionData);
                showAlert({ title: 'Created!', text: 'New event added successfully', icon: 'success' });
            }
            fetchEvents();
            setIsModalOpen(false);
        } catch (error) {
            showAlert({ title: 'Error', text: 'Failed to save event', icon: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Sort newest to the top
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        const idA = a.id || a._id || '';
        const idB = b.id || b._id || '';
        return idB.localeCompare(idA);
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Events Management</h1>
                    <p className="text-slate-500 text-sm">Create, edit, and organize upcoming events</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button 
                        variant="secondary" 
                        onClick={fetchEvents} 
                        isLoading={loading}
                        className="gap-2"
                    >
                        {!loading && <RefreshCw className="h-4 w-4 text-[#B3925B]" />}
                        Refresh
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="gap-2">
                        <Plus className="h-5 w-5" /> Add New
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search events..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Events List/Table */}
            {loading ? (
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex gap-4 border-b border-slate-100 pb-3">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="flex gap-4 items-center">
                                <Skeleton className="h-10 w-14 rounded-lg shrink-0" />
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-5 w-1/6" />
                                <Skeleton className="h-5 w-1/6" />
                                <Skeleton className="h-5 w-1/4" />
                            </div>
                        ))}
                    </div>
                </Card>
            ) : sortedEvents.length > 0 ? (
                <Table headers={['Cover', 'Event Title', 'Date & Time', 'Location', 'Description', 'Status', 'Actions']}>
                    {sortedEvents.map((event) => (
                        <TableRow key={event.id} className={!Boolean(event.status) ? 'opacity-60' : ''}>
                            <TableCell className="w-20">
                                {event.img ? (
                                    <img src={event.img} alt="" className="w-16 h-10 object-cover rounded-lg shadow-sm border border-slate-100" />
                                ) : (
                                    <div className="w-16 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 border border-slate-100">
                                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-bold text-slate-800 font-serif text-sm">
                                {event.title}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-0.5 text-xs text-slate-600">
                                    <div className="font-medium">{event.date ? formatDate(event.date) : 'No Date Set'}</div>
                                    {event.time && <div className="text-slate-400 font-normal">{event.time}</div>}
                                </div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-600 max-w-[150px] truncate">
                                {event.location}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                                {event.description}
                            </TableCell>
                            <TableCell>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(event); }}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer ${
                                        Boolean(event.status) ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                                >
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                        Boolean(event.status) ? 'translate-x-4.5' : 'translate-x-1'
                                    }`} />
                                </button>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        title="View Event"
                                        onClick={() => handleOpenDetail(event)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        title="Edit Event"
                                        onClick={() => handleOpenModal(event)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        className="h-8 w-8 p-0"
                                        title="Delete Event"
                                        onClick={() => handleDelete(event.id)}
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
                    <p className="text-slate-400">No events found matching your search.</p>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentEvent ? 'Edit Event' : 'Add New '}
                width="max-w-4xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={saving}>
                            {currentEvent ? 'Update Event' : 'Create Event'}
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Live Preview Side */}
                    <div className="lg:w-1/2 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Card Preview</h4>
                        <Card className="overflow-hidden border-none shadow-lg rounded-[2.5rem] border border-slate-100 bg-white sticky top-0">
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <CalendarIcon className="h-12 w-12 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-6 space-y-3">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-400 text-xs">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-3.5 w-3.5 text-purple-500" />
                                        <span>{formData.date ? formatDate(formData.date) : 'Select a date'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                                        <span>{formData.time || '2:00 PM - 5:00 PM'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>{formData.location || 'Online via Zoom'}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-[#B3925B] leading-tight">
                                    {formData.title || 'Inspirational Title'}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                                    {formData.description || 'Describe the activities and learnings participants can expect from this event...'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Side */}
                    <div className="lg:w-1/2">
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <ImageUploader
                                label="Upload Image"
                                initialImage={previewUrl}
                                onImageChange={handleImageChange}
                                aspectRatio="aspect-[16/10]"
                                cropAspect={16 / 10}
                            />
                            <Input
                                label="Event Title"
                                placeholder="e.g. Inspiring Speaker Sessions"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Start Date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="End Date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Start Time"
                                    placeholder="e.g. 2:00 PM"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                                />
                                <Input
                                    label="End Time"
                                    placeholder="e.g. 5:00 PM"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                                />
                            </div>
                            <Input
                                label="Location"
                                placeholder="e.g. Online via Zoom"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                required
                            />
                            <TextArea
                                label="Description"
                                placeholder="Describe details about this event..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={6}
                                required
                            />

                            {/* Status Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Visibility on Website</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {formData.status ? 'Published — visible to website visitors' : 'Hidden — not shown to website visitors'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B3925B] focus:ring-offset-2 ${
                                        formData.status ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                                        formData.status ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>

            {/* Event Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Event Preview"
                width="max-w-md"
            >
                {selectedEvent && (
                    <div className="flex justify-center py-2">
                        <div className="w-full overflow-hidden border-none shadow-lg rounded-[2.5rem] border border-slate-100 bg-[#FAF9F5] text-left flex flex-col">
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-100">
                                {selectedEvent.img ? (
                                    <img src={selectedEvent.img} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <CalendarIcon className="h-12 w-12 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-serif text-2xl text-slate-800 leading-tight">
                                            {selectedEvent.title}
                                        </h3>
                                        <div className="space-y-1.5 pt-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold border-t border-slate-100 mt-2">
                                            {selectedEvent.date && <div className="flex items-center gap-1.5">📅 {formatDate(selectedEvent.date)}</div>}
                                            {selectedEvent.time && <div className="flex items-center gap-1.5">🕒 {selectedEvent.time}</div>}
                                            {selectedEvent.location && <div className="flex items-center gap-1.5 text-[#B3925B]">📍 {selectedEvent.location}</div>}
                                        </div>
                                    </div>
                                    <p className="text-xs font-light text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                                <div className="pt-6">
                                    <button type="button" disabled className="w-full bg-[#1E242B] text-white text-[10px] uppercase tracking-[0.2em] py-3.5 px-6 font-semibold rounded-sm opacity-80 cursor-not-allowed">
                                        Reserve Your Seat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Events;
