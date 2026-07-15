import React, { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    BookOpen,
    Search,
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
        img: null,
        ideal: '',
        what_you_gain: '',
        suitable: '',
        key_out_come: ''
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
                ideal: p.ideal || '',
                what_you_gain: p.what_you_gain || '',
                suitable: p.suitable || '',
                key_out_come: p.key_out_come || '',
                idealFor: p.idealFor || [],
                discoveries: p.discoveries || [],
                focusAreas: p.focusAreas || [],
                gains: p.gains || [],
                topics: p.topics || [],
                suitableFor: p.suitableFor || [],
                keyOutcome: p.keyOutcome || '',
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
                img: null,
                ideal: program.ideal || (Array.isArray(program.idealFor) ? program.idealFor.join('\n') : ''),
                what_you_gain: program.what_you_gain || (Array.isArray(program.gains) ? program.gains.join('\n') : ''),
                suitable: program.suitable || (Array.isArray(program.suitableFor) ? program.suitableFor.join('\n') : ''),
                key_out_come: program.key_out_come || program.keyOutcome || ''
            });
            setPreviewUrl(program.img || null);
        } else {
            setCurrentProgram(null);
            setFormData({
                title: '',
                outcome: '',
                description: '',
                status: true,
                img: null,
                ideal: '',
                what_you_gain: '',
                suitable: '',
                key_out_come: ''
            });
            setPreviewUrl(null);
        }
        setIsModalOpen(true);
    };

    // Quick status toggle from card
    const handleToggleStatus = async (prog) => {
        const newStatus = !Boolean(prog.status);
        setPrograms(prev => prev.map(p => p.id === prog.id ? { ...p, status: newStatus } : p));
        try {
            await programService.update({ ...prog, status: newStatus });
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
            img: formData.img,
            ideal: formData.ideal,
            what_you_gain: formData.what_you_gain,
            suitable: formData.suitable,
            key_out_come: formData.key_out_come,
            idealFor: formData.ideal.split('\n').map(l => l.trim()).filter(Boolean),
            gains: formData.what_you_gain.split('\n').map(l => l.trim()).filter(Boolean),
            suitableFor: formData.suitable.split('\n').map(l => l.trim()).filter(Boolean),
            keyOutcome: formData.key_out_come
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
                <div className="flex items-center gap-2 shrink-0">
                    <Button 
                        variant="secondary" 
                        onClick={fetchPrograms} 
                        isLoading={loading}
                        className="gap-2"
                    >
                        {!loading && <RefreshCw className="h-4 w-4 text-[#B3925B]" />}
                        Refresh
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="gap-2">
                        <Plus className="h-5 w-5" /> Add New Program
                    </Button>
                </div>
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

                            <div className="border-t border-slate-100 pt-4 mt-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Additional Details (One bullet per line)</h4>
                                <div className="space-y-4">
                                    <TextArea
                                        label="Ideal For"
                                        placeholder="e.g. Individuals feeling stuck or lost&#10;Career transitions"
                                        value={formData.ideal}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ideal: e.target.value }))}
                                        rows={3}
                                    />
                                    <TextArea
                                        label="What You May Gain"
                                        placeholder="e.g. Greater clarity on your goals&#10;Increased confidence"
                                        value={formData.what_you_gain}
                                        onChange={(e) => setFormData(prev => ({ ...prev, what_you_gain: e.target.value }))}
                                        rows={3}
                                    />
                                    <TextArea
                                        label="Suitable For"
                                        placeholder="e.g. School students of all stages&#10;Young working adults"
                                        value={formData.suitable}
                                        onChange={(e) => setFormData(prev => ({ ...prev, suitable: e.target.value }))}
                                        rows={3}
                                    />
                                    <Input
                                        label="Key Outcome Statement"
                                        placeholder="e.g. When you are aligned, you stop forcing life and start flowing..."
                                        value={formData.key_out_come}
                                        onChange={(e) => setFormData(prev => ({ ...prev, key_out_come: e.target.value }))}
                                    />
                                </div>
                            </div>

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
                className="max-w-xl bg-[#FDFBF7]"
            >
                {selectedProgram && (
                    <div className="space-y-6 text-left font-sans text-[#1C1C1C]">
                        {/* Header */}
                        <div>
                            <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] font-bold block mb-1">
                                Offering Detail
                            </span>
                            <h3 className="font-serif text-3xl text-[#1C1C1C]">{selectedProgram.title}</h3>
                            <p className="text-xs text-[#C5A880] font-serif italic mt-1">{selectedProgram.outcome}</p>
                        </div>

                        {/* Image */}
                        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#F0EAE1]">
                            {selectedProgram.img ? (
                                <img src={selectedProgram.img} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                    <BookOpen className="h-12 w-12 opacity-20" />
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <p className="text-xs leading-relaxed font-light text-[#1C1C1C]/85 bg-white/40 p-4 border border-[#F0EAE1] rounded-xl whitespace-pre-wrap">
                                {selectedProgram.description}
                            </p>

                            {/* Ideal For */}
                            {selectedProgram.idealFor && selectedProgram.idealFor.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] uppercase tracking-wider text-[#C5A880] font-bold">Ideal For:</h4>
                                    <ul className="space-y-1.5 text-xs font-light text-[#1C1C1C]/85 pl-4 list-disc">
                                        {selectedProgram.idealFor.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Discoveries */}
                            {selectedProgram.discoveries && selectedProgram.discoveries.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] uppercase tracking-wider text-[#C5A880] font-bold">What You Will Discover:</h4>
                                    <ul className="space-y-1.5 text-xs font-light text-[#1C1C1C]/85 pl-4 list-disc">
                                        {selectedProgram.discoveries.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Gains */}
                            {selectedProgram.gains && selectedProgram.gains.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] uppercase tracking-wider text-[#C5A880] font-bold">What You May Gain:</h4>
                                    <ul className="space-y-1.5 text-xs font-light text-[#1C1C1C]/85 pl-4 list-disc">
                                        {selectedProgram.gains.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Focus Areas */}
                            {selectedProgram.focusAreas && selectedProgram.focusAreas.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] uppercase tracking-wider text-[#C5A880] font-bold">Focus Areas:</h4>
                                    <ul className="space-y-1.5 text-xs font-light text-[#1C1C1C]/85 pl-4 list-disc">
                                        {selectedProgram.focusAreas.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Suitable For */}
                            {selectedProgram.suitableFor && selectedProgram.suitableFor.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] uppercase tracking-wider text-[#C5A880] font-bold">Suitable For:</h4>
                                    <ul className="space-y-1.5 text-xs font-light text-[#1C1C1C]/85 pl-4 list-disc">
                                        {selectedProgram.suitableFor.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Topics */}
                            {selectedProgram.topics && selectedProgram.topics.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] uppercase tracking-wider text-[#C5A880] font-bold">Popular Workshop Topics:</h4>
                                    <ul className="space-y-1.5 text-xs font-light text-[#1C1C1C]/85 pl-4 list-disc">
                                        {selectedProgram.topics.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Key Outcome */}
                            {selectedProgram.keyOutcome && (
                                <div className="p-3 bg-[#C5A880]/5 border border-[#C5A880]/25 rounded-lg text-xs italic text-center text-[#1C1C1C]/90 font-serif">
                                    Key Outcome: {selectedProgram.keyOutcome}
                                </div>
                            )}
                        </div>

                        {/* CTA Footer */}
                        <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-end">
                            <button type="button" disabled className="bg-[#1E242B] text-white text-[10px] uppercase tracking-[0.2em] py-3.5 px-8 font-semibold rounded-sm opacity-80 cursor-not-allowed">
                                Enquire for This Container
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Programs;
