import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Search, Eye, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ImageUploader from '../components/shared/ImageUploader';
import { confirmDialog, showAlert } from '../components/shared/ConfirmDialog';
import { galleryService } from '../services';
import { formatDate } from '../utils/cn';
import Skeleton from '../components/ui/Skeleton';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        alt: '',
        img: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailAspect, setDetailAspect] = useState('aspect-[4/3]');

    const handleOpenDetail = (img) => {
        setSelectedImage(img);
        setIsDetailOpen(true);
        if (img.src) {
            const tempImg = new Image();
            tempImg.src = img.src;
            tempImg.onload = () => {
                const { naturalWidth: w, naturalHeight: h } = tempImg;
                if (h > w) {
                    setDetailAspect('aspect-[3/4]');
                } else if (w > h) {
                    setDetailAspect('aspect-[4/3]');
                } else {
                    setDetailAspect('aspect-square');
                }
            };
        }
    };

    const handleToggleStatus = async (img) => {
        const newStatus = !Boolean(img.status);
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: newStatus } : i));
        try {
            await galleryService.update(img.id, null, newStatus);
            showAlert({ title: 'Status Updated', text: `Image marked as ${newStatus ? 'Published' : 'Hidden'}`, icon: 'success' });
        } catch (err) {
            setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: !newStatus } : i));
            showAlert({ title: 'Error', text: 'Could not update status', icon: 'error' });
        }
    };

    React.useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            setLoading(true);
            const response = await galleryService.list();
            setImages(response.data || []);
        } catch (error) {
            console.error("Listing gallery failed", error);
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredImages = images.filter(img =>
        img.alt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = () => {
        setFormData({ alt: '', img: null });
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const handleImageChange = (file, url) => {
        setFormData(prev => ({ ...prev, img: file }));
        setPreviewUrl(url);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmDialog({
            title: 'Delete Image?',
            text: 'Are you sure you want to remove this image from the gallery? This cannot be undone.'
        });

        if (confirmed) {
            try {
                await galleryService.delete(id);
                setImages(prev => prev.filter(img => img.id !== id));
                showAlert({ title: 'Deleted!', text: 'Image removed from gallery', icon: 'success' });
            } catch (error) {
                showAlert({ title: 'Error', text: 'Failed to delete image', icon: 'error' });
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.img) {
            showAlert({ title: 'Missing Image', text: 'Please select an image file to upload', icon: 'error' });
            return;
        }

        setSaving(true);
        try {
            await galleryService.upload(formData.img, formData.alt);
            showAlert({ title: 'Uploaded!', text: 'Image added to gallery', icon: 'success' });
            fetchGallery();
            setIsModalOpen(false);
        } catch (error) {
            showAlert({ title: 'Error', text: 'Failed to upload image', icon: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Sort newest to the top
    const sortedImages = [...filteredImages].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        const idA = a.id || a._id || '';
        const idB = b.id || b._id || '';
        return idB.localeCompare(idA);
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-serif">Sanctuary Gallery</h1>
                    <p className="text-slate-500 text-sm">Upload, preview, and remove images displayed in the site gallery</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button 
                        variant="secondary" 
                        onClick={fetchGallery} 
                        isLoading={loading}
                        className="gap-2"
                    >
                        {!loading && <RefreshCw className="h-4 w-4 text-[#B3925B]" />}
                        Refresh
                    </Button>
                    <Button onClick={handleOpenModal} className="gap-2">
                        <Plus className="h-5 w-5" /> Upload to Gallery
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search images by description/alt text..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Gallery List/Table */}
            {loading ? (
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex gap-4 border-b border-slate-100 pb-3">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/6" />
                        </div>
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="flex gap-4 items-center">
                                <Skeleton className="h-10 w-14 rounded-lg shrink-0" />
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/6" />
                            </div>
                        ))}
                    </div>
                </Card>
            ) : sortedImages.length > 0 ? (
                <Table headers={['Thumbnail', 'Description / Alt Text', 'Created At', 'Status', 'Actions']}>
                    {sortedImages.map((img) => (
                        <TableRow key={img.id} className={!Boolean(img.status) ? 'opacity-60' : ''}>
                            <TableCell className="w-20">
                                {img.src ? (
                                    <img src={img.src} alt="" className="w-16 h-12 object-cover rounded-lg shadow-sm border border-slate-100" />
                                ) : (
                                    <div className="w-16 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 border border-slate-100">
                                        <ImageIcon className="h-4 w-4 text-slate-400" />
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-bold text-slate-800 font-serif text-sm">
                                {img.alt}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                                {img.createdAt ? formatDate(img.createdAt) : 'No Date'}
                            </TableCell>
                            <TableCell>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(img); }}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer ${
                                        Boolean(img.status) ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                                >
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                        Boolean(img.status) ? 'translate-x-4.5' : 'translate-x-1'
                                    }`} />
                                </button>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        title="View Image Details"
                                        onClick={() => handleOpenDetail(img)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        className="h-8 w-8 p-0"
                                        title="Delete Image"
                                        onClick={() => handleDelete(img.id)}
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
                    <p className="text-slate-400">No gallery images found matching your search.</p>
                </div>
            )}

            {/* Gallery Upload Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Upload Image to Gallery"
                className="max-w-xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={saving}>
                            Upload Image
                        </Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <ImageUploader
                        label="Select Image"
                        initialImage={previewUrl}
                        onImageChange={handleImageChange}
                        className="mb-4"
                        aspectRatio="dynamic"
                        cropAspect="dynamic"
                    />
                    <Input
                        label="Image Description (Alt Text)"
                        placeholder="e.g. Serene lake reflection representing mindfulness"
                        value={formData.alt}
                        onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                        required
                    />
                </form>
            </Modal>
 
            {/* Gallery Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Gallery Image Preview"
                className="max-w-md"
            >
                {selectedImage && (
                    <div className="flex justify-center py-2 w-full">
                        <div className="relative overflow-hidden shadow-lg rounded-2xl bg-white border border-slate-100 max-w-full">
                            {selectedImage.src ? (
                                <img 
                                    src={selectedImage.src} 
                                    alt={selectedImage.alt} 
                                    className="w-auto h-auto max-w-full max-h-[60vh] block rounded-2xl" 
                                />
                            ) : (
                                <div className="w-64 aspect-[4/3] flex items-center justify-center text-slate-300">
                                    <ImageIcon className="h-12 w-12 opacity-20" />
                                </div>
                            )}
                            
                            {/* Overlay representing website hover state */}
                            {selectedImage.src && (
                                <div className="absolute inset-0 bg-slate-900/60 flex flex-col justify-end p-6 text-left rounded-2xl">
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#B3925B] font-bold block mb-1">
                                        Website Preview
                                    </span>
                                    <p className="text-white text-sm font-light tracking-wide uppercase line-clamp-3">
                                        {selectedImage.alt || 'No Description'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Gallery;
