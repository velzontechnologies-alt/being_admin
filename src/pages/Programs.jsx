import React, { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    BookOpen,
    Search,
    Eye
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ImageUploader from '../components/shared/ImageUploader';
import { confirmDialog, showAlert } from '../components/shared/ConfirmDialog';
import { programService } from '../services';
import Skeleton from '../components/ui/Skeleton';

const Programs = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProgram, setCurrentProgram] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        outcome: '',
        description: '',
        status: true,
        img: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleOpenDetail = (program) => {
        setSelectedProgram(program);
        setIsDetailOpen(true);
    };

    React.useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const response = await programService.list();
            const data = response.data || [];
            setPrograms(data.map(p => ({
                id: p.id || p._id || Math.random().toString(36),
                title: p.title || '',
                outcome: p.outcome || '',
                description: p.description || '',
                img: p.img || p.main_image || '',
                status: p.status !== undefined ? Boolean(p.status) : true
            })));
        } catch (error) {
            console.error("Listing programs failed", error);
            setPrograms([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPrograms = programs.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.outcome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (program = null) => {
        if (program) {
            setCurrentProgram(program);
            setFormData({
                title: program.title || '',
                outcome: program.outcome || '',
                description: program.description || '',
                status: program.status !== undefined ? Boolean(program.status) : true,
                img: null
            });
            setPreviewUrl(program.img || null);
        } else {
            setCurrentProgram(null);
            setFormData({ title: '', outcome: '', description: '', status: true, img: null });
            setPreviewUrl(null);
        }
        setIsModalOpen(true);
    };

    // Quick status toggle from card
    const handleToggleStatus = async (prog) => {
        const newStatus = !Boolean(prog.status);
        setPrograms(prev => prev.map(p => p.id === prog.id ? { ...p, status: newStatus } : p));
        try {
            await programService.update({ _id: prog.id, id: prog.id, title: prog.title, outcome: prog.outcome, description: prog.description, status: newStatus });
            showAlert({ title: 'Status Updated', text: `Program marked as ${newStatus ? 'Published' : 'Hidden'}`, icon: 'success' });
        } catch (err) {
            setPrograms(prev => prev.map(p => p.id === prog.id ? { ...p, status: !newStatus } : p));
            showAlert({ title: 'Error', text: 'Could not update status', icon: 'error' });
        }
    };

    const handleImageChange = async (file, url) => {
        setFormData(prev => ({ ...prev, img: file }));
        setPreviewUrl(url);

        if (currentProgram && file instanceof File) {
            try {
                await programService.uploadImage(currentProgram.id, file);
                showAlert({ title: 'Success!', text: 'Image uploaded automatically', icon: 'success' });
                fetchPrograms();
            } catch (error) {
                showAlert({ title: 'Upload Failed', text: 'Could not upload the program image', icon: 'error' });
            }
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmDialog({
            title: 'Delete Program?',
            text: 'Are you sure you want to remove this program? This will remove it from the main website.'
        });

        if (confirmed) {
            try {
                await programService.delete(id);
                setPrograms(prev => prev.filter(p => p.id !== id));
                showAlert({ title: 'Deleted!', text: 'Program has been removed', icon: 'success' });
            } catch (error) {
                showAlert({ title: 'Error', text: 'Failed to delete program', icon: 'error' });
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const submissionData = {
            title: formData.title,
            outcome: formData.outcome,
            description: formData.description,
            status: formData.status,
            img: formData.img
        };

        try {
            if (currentProgram) {
                await programService.update({
                    ...submissionData,
                    id: currentProgram.id,
                    _id: currentProgram.id
                });
                showAlert({ title: 'Updated!', text: 'Program details updated successfully', icon: 'success' });
                fetchPrograms();
            } else {
                await programService.create(submissionData);
                showAlert({ title: 'Created!', text: 'New program added successfully', icon: 'success' });
                fetchPrograms();
            }
            setIsModalOpen(false);
        } catch (error) {
            showAlert({ title: 'Error', text: 'Failed to save program', icon: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Sort newest to the top
    const sortedPrograms = [...filteredPrograms].sort((a, b) => {
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
                    <h1 className="text-2xl font-bold text-slate-900">Programs Management</h1>
                    <p className="text-slate-500 text-sm">Create, edit, and organize core website coaching programs</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="gap-2 shrink-0">
                    <Plus className="h-5 w-5" /> Add New Program
                </Button>
            </div>

            {/* Toolbar */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search programs by title or description..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Programs List/Table */}
            {loading ? (
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex gap-4 border-b border-slate-100 pb-3">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="flex gap-4 items-center">
                                <Skeleton className="h-10 w-14 rounded-lg shrink-0" />
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/4" />
                            </div>
                        ))}
                    </div>
                </Card>
            ) : sortedPrograms.length > 0 ? (
                <Table headers={['Cover', 'Program Title', 'Outcome Tagline', 'Description', 'Status', 'Actions']}>
                    {sortedPrograms.map((prog) => (
                        <TableRow key={prog.id} className={!Boolean(prog.status) ? 'opacity-60' : ''}>
                            <TableCell className="w-20">
                                {prog.img ? (
                                    <img src={prog.img} alt="" className="w-16 h-12 object-cover rounded-lg shadow-sm border border-slate-100" />
                                ) : (
                                    <div className="w-16 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 border border-slate-100">
                                        <BookOpen className="h-4 w-4 text-slate-400" />
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-bold text-slate-800 font-serif text-sm">
                                {prog.title}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600 font-medium">
                                <span className="text-[10px] uppercase tracking-wider text-[#B3925B] font-bold">
                                    {prog.outcome}
                                </span>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 max-w-[250px] truncate">
                                {prog.description}
                            </TableCell>
                            <TableCell>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(prog); }}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer ${
                                        Boolean(prog.status) ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                                >
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                        Boolean(prog.status) ? 'translate-x-4.5' : 'translate-x-1'
                                    }`} />
                                </button>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        title="View Program"
                                        onClick={() => handleOpenDetail(prog)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        title="Edit Program"
                                        onClick={() => handleOpenModal(prog)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        className="h-8 w-8 p-0"
                                        title="Delete Program"
                                        onClick={() => handleDelete(prog.id)}
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
                    <p className="text-slate-400">No programs found matching your search.</p>
                </div>
            )}

            {/* Program Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentProgram ? 'Edit Program' : 'Add New Program'}
                width="max-w-4xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={saving}>
                            {currentProgram ? 'Update Program' : 'Create Program'}
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Live Preview Side */}
                    <div className="lg:w-1/2 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Website Layout Preview</h4>
                        <Card className="overflow-hidden border-none shadow-lg rounded-[2rem] border border-slate-100 bg-[#FAF9F5] sticky top-0 text-left">
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 border-b border-slate-100">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <BookOpen className="h-12 w-12 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                                <div className="space-y-3">
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#B3925B] font-bold block">
                                        {formData.outcome || 'DYNAMIC OUTCOME TAGLINE'}
                                    </span>
                                    <div>
                                        <h3 className="font-serif text-2xl text-slate-800 font-normal">
                                            {formData.title || 'Program Title'}
                                        </h3>
                                        <div className="w-12 h-[1px] bg-[#B3925B]/70 mt-2" />
                                    </div>
                                    <p className="text-xs font-light text-slate-600 leading-relaxed line-clamp-4">
                                        {formData.description || 'Describe the learning pathways, details, and target outcomes of this program container...'}
                                    </p>
                                </div>
                                <div className="pt-6 mt-auto">
                                    <button type="button" disabled className="w-full bg-[#1E242B] text-white text-[10px] uppercase tracking-[0.2em] py-3.5 px-4 font-semibold rounded-sm opacity-80">
                                        Enquire Now
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Form Side */}
                    <div className="lg:w-1/2">
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <ImageUploader
                                label="Upload Program Cover"
                                initialImage={previewUrl}
                                onImageChange={handleImageChange}
                                aspectRatio="aspect-[4/3]"
                                cropAspect={4 / 3}
                            />
                            <Input
                                label="Program Title"
                                placeholder="e.g. Personal Clarity Coaching"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                            />
                            <Input
                                label="Outcome Tagline"
                                placeholder="e.g. Gain Clarity. Move Forward with Confidence."
                                value={formData.outcome}
                                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                                required
                            />
                            <TextArea
                                label="Description / Promise"
                                placeholder="Describe details about this coaching container..."
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

            {/* Program Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Program Preview"
                width="max-w-md"
                footer={<Button onClick={() => setIsDetailOpen(false)}>Close</Button>}
            >
                {selectedProgram && (
                    <div className="flex justify-center py-2">
                        <div className="w-full overflow-hidden border-none shadow-lg rounded-[2rem] border border-slate-100 bg-[#FAF9F5] text-left flex flex-col">
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 border-b border-slate-100">
                                {selectedProgram.img ? (
                                    <img src={selectedProgram.img} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <BookOpen className="h-12 w-12 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                                <div className="space-y-3">
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#B3925B] font-bold block">
                                        {selectedProgram.outcome || 'PROGRAM OUTCOME'}
                                    </span>
                                    <div>
                                        <h3 className="font-serif text-2xl text-slate-800 font-normal">
                                            {selectedProgram.title}
                                        </h3>
                                        <div className="w-12 h-[1px] bg-[#B3925B]/70 mt-2" />
                                    </div>
                                    <p className="text-xs font-light text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {selectedProgram.description}
                                    </p>
                                </div>
                                <div className="pt-6">
                                    <button type="button" disabled className="w-full bg-[#1E242B] text-white text-[10px] uppercase tracking-[0.2em] py-3.5 px-4 font-semibold rounded-sm opacity-80 cursor-not-allowed">
                                        Enquire Now
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

export default Programs;
