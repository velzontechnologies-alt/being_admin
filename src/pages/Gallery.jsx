import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Image as ImageIcon, Search, Eye, RefreshCw, FileText, UploadCloud, X as XIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { confirmDialog, showAlert } from '../components/shared/ConfirmDialog';
import { galleryService } from '../services';
import Skeleton from '../components/ui/Skeleton';

const DEFAULT_EVENTS = [
    {
        eventRef: 'Event 1',
        title: 'Figure to Future™ Session for Rotary Club Members',
        description: `What an inspiring evening at Raffles Town Club, where I had the privilege of conducting the Figure to Future™ session for members of the Rotary Club.
The room was filled with professionals, business leaders, entrepreneurs, and changemakers—people who have achieved much in life, yet remain deeply curious about understanding themselves at a deeper level.
One of the biggest takeaways from the evening was this:
Success answers what you've achieved. Self-awareness answers why you are the way you are.
Through timeless Yi Jing wisdom, we explored how our innate strengths, behavioural patterns, decision-making styles, and life tendencies influence the way we lead, communicate, build relationships, and create impact.
What touched me most wasn't just the insightful questions—it was witnessing so many moments of reflection, discovery, and genuine connection throughout the session.
Thank you to the Rotary Club for the warm hospitality and every participant who showed up with an open mind and a willingness to grow.
The greatest investment we can ever make is not just in our careers or businesses—it's in understanding ourselves.
Because when you understand yourself better, you lead better, love better, and live better.
Here's to more meaningful conversations, deeper clarity, and lives lived with greater purpose.`
    },
    {
        eventRef: 'Event 2',
        title: 'Figure to Future™ Experience at The Great Room',
        description: `What an amazing evening at The Great Room.
It was a joy sharing the Figure to Future™ experience with a wonderful group of professionals who came with curiosity and left with greater clarity.
There was plenty of laughter, many "Aha!" moments, and even a few surprised expressions as participants began uncovering their unique life blueprint through the timeless wisdom of Yi Jing.
It's always fascinating to watch the room come alive when people realise that many of their strengths, challenges, and life patterns suddenly make sense.
Sometimes, the greatest breakthrough doesn't come from learning something new—it comes from finally understanding yourself.
A heartfelt thank you to everyone who joined the session, asked thoughtful questions, and embraced the journey of self-discovery. I hope this is just the beginning of many more meaningful conversations and personal breakthroughs.
Here's to living with greater clarity, purpose, and alignment.`
    },
    {
        eventRef: 'Event 3',
        title: 'Figure to Future™ Immersive Session',
        description: `Sometimes, all it takes is one conversation to see your life from a different perspective.
Our recent Figure to Future™ session was more than just a learning experience—it was a journey of self-discovery.
Throughout the session, participants explored their unique life blueprint, gaining deeper insights into their natural strengths, communication style, decision-making patterns, relationships, career tendencies, and the opportunities that lie ahead.
What made the experience especially meaningful was witnessing so many moments of recognition. Participants shared how certain life experiences suddenly made sense, how they began to understand why they think and respond the way they do, and how this newfound clarity could help them make wiser decisions moving forward.
There were plenty of smiles, laughter, thoughtful discussions, and those priceless "Aha!" moments that reminded us all that the greatest journey we can take is the journey of understanding ourselves.
Knowledge is powerful, but self-awareness is transformational.
A heartfelt thank you to everyone who joined us and contributed to such an engaging and enriching session. We hope you walked away not only with greater clarity, but also with renewed confidence, purpose, and a deeper appreciation of your own unique journey.
Because when you understand yourself, you don't just change your future—you change the way you live every single day.`
    }
];

// ── Mini image carousel for the admin event preview ─────────────────────────
function EventCarousel({ images, onAddImages, eventRef }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef(null);

    const restart = useCallback(() => {
        clearInterval(timerRef.current);
        if (images.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % images.length);
            }, 3500);
        }
    }, [images.length]);

    useEffect(() => {
        setCurrentIndex(0);
        restart();
        return () => clearInterval(timerRef.current);
    }, [images.length, restart]);

    const prev = (e) => {
        e.stopPropagation();
        setCurrentIndex(p => (p - 1 + images.length) % images.length);
        restart();
    };
    const next = (e) => {
        e.stopPropagation();
        setCurrentIndex(p => (p + 1) % images.length);
        restart();
    };

    if (images.length === 0) {
        return (
            <div
                onClick={onAddImages}
                className="flex flex-col items-center justify-center gap-3 h-full rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-[#B3925B] hover:bg-amber-50/20 transition-all duration-200 text-center p-8"
            >
                <UploadCloud className="h-8 w-8 text-slate-300" />
                <p className="text-xs text-slate-400 font-medium">No images yet<br />Click to upload for {eventRef}</p>
            </div>
        );
    }

    const img = images[currentIndex];
    return (
        <div className="relative group aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
            {/* Image */}
            <img
                key={currentIndex}
                src={img.src}
                alt={img.alt || ''}
                className="w-full h-full object-cover transition-opacity duration-500"
                loading="lazy"
            />

            {/* Counter badge */}
            <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] tracking-wider font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Prev / Next arrows — visible on hover */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow transition-all opacity-0 group-hover:opacity-100 z-10 hover:scale-105"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow transition-all opacity-0 group-hover:opacity-100 z-10 hover:scale-105"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); restart(); }}
                            className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-[#B3925B]' : 'w-1.5 bg-white/60 hover:bg-white/90'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

const Gallery = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryEventId = searchParams.get('eventId') || 'all';

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterEventId, setSelectedFilterEventId] = useState(queryEventId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        eventRef: '',
        title: '',
        description: '',
        alt: ''
    });

    // Unified modal image array state (stores both existing and new files)
    const [modalImages, setModalImages] = useState([]);
    const [activeId, setActiveId] = useState(null);

    const [saving, setSaving] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [activePreviewSrc, setActivePreviewSrc] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailAspect, setDetailAspect] = useState('aspect-[4/3]');

    const [activeTab, setActiveTab] = useState('images');

    // Dedicated Showcase Modal States
    const [isShowcaseModalOpen, setIsShowcaseModalOpen] = useState(false);
    const [showcaseFormData, setShowcaseFormData] = useState({ title: '', description: '' });
    const [showcaseFile, setShowcaseFile] = useState(null);
    const [showcasePreviewSrc, setShowcasePreviewSrc] = useState(null);
    const [showcaseSaving, setShowcaseSaving] = useState(false);

    React.useEffect(() => {
        if (queryEventId) {
            setSelectedFilterEventId(queryEventId);
        }
    }, [queryEventId]);

    // Automatically calculate detailAspect when activePreviewSrc updates (handles both main and sub-images)
    useEffect(() => {
        if (!activePreviewSrc) return;
        const tempImg = new Image();
        tempImg.src = activePreviewSrc;
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
    }, [activePreviewSrc]);

    const handleOpenDetail = (img) => {
        setSelectedImage(img);
        setActivePreviewSrc(img.src);
        setIsDetailOpen(true);
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

    const handleMoveEvent = async (eventRef, direction) => {
        const idx = availableEvents.indexOf(eventRef);
        if (idx === -1) return;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= availableEvents.length) return;

        const targetEventRef = availableEvents[targetIdx];

        // Find the documents in the DB
        const doc1 = images.find(item => item.heading === eventRef);
        const doc2 = images.find(item => item.heading === targetEventRef);

        if (!doc1 || !doc2) {
            showAlert({
                title: 'Cannot Reorder',
                text: 'Please make sure both events have been edited and saved first.',
                icon: 'warning'
            });
            return;
        }

        setLoading(true);
        try {
            // Swap headings: to prevent unique constraint issues, update doc1 to a temporary heading first
            await galleryService.update(doc1.id, null, { heading: 'TEMP_SWAP_HEADING' });
            await galleryService.update(doc2.id, null, { heading: eventRef });
            await galleryService.update(doc1.id, null, { heading: targetEventRef });

            showAlert({
                title: 'Reordered!',
                text: `Successfully swapped ${eventRef} and ${targetEventRef}`,
                icon: 'success'
            });
            await fetchGallery();
        } catch (err) {
            console.error("Reordering events failed", err);
            showAlert({
                title: 'Error',
                text: 'Failed to swap event order. Please try again.',
                icon: 'error'
            });
            await fetchGallery();
        } finally {
            setLoading(false);
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

    // Flatten images to represent each individual image row (main + sub_images)
    const flatImagesList = [];
    images.forEach(imgDoc => {
        if (!imgDoc.heading) {
            // General gallery image
            flatImagesList.push({
                id: imgDoc.id,
                docId: imgDoc.id,
                src: imgDoc.src,
                heading: '',
                title: imgDoc.title,
                description: imgDoc.description || '',
                status: imgDoc.status,
                isSub: false,
                isMain: true
            });
        } else {
            // Event doc containing main image and/or sub_images — list exactly one row per event
            flatImagesList.push({
                id: imgDoc.id,
                docId: imgDoc.id,
                src: imgDoc.src || (imgDoc.sub_image && imgDoc.sub_image[0]) || '',
                heading: imgDoc.heading,
                title: imgDoc.title,
                description: imgDoc.description || '',
                sub_image: imgDoc.sub_image || [],
                status: imgDoc.status,
                isSub: false,
                isMain: true
            });
        }
    });

    const uniqueEvents = Array.from(new Set(
        images
            .map(img => img.heading)
            .filter(ref => ref && ref !== '')
    ));

    const availableEvents = Array.from(new Set([
        'Event 1',
        'Event 2',
        'Event 3',
        ...uniqueEvents
    ])).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
    });

    const filteredImages = flatImagesList.filter(img => {
        const matchesSearch = (img.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const eventRef = img.heading || '';

        if (selectedFilterEventId === 'all') {
            return matchesSearch;
        } else if (selectedFilterEventId === 'general') {
            return matchesSearch && !eventRef;
        } else {
            return matchesSearch && eventRef.toLowerCase() === selectedFilterEventId.toLowerCase();
        }
    });

    // ── Multi-file upload queue ─────────────────────────────────────────────
    const [uploadProgress, setUploadProgress] = useState(null); // null | { done, total }
    const multiFileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const handleOpenModal = (presetEventRef = '') => {
        // Only load existing data if a specific event reference is provided
        const existing = presetEventRef ? images.find(item => item.heading === presetEventRef) : null;
        const defaults = presetEventRef ? DEFAULT_EVENTS.find(e => e.eventRef === presetEventRef) : null;
        const pre = existing || defaults;

        setFormData({
            eventRef: presetEventRef,
            title: pre?.title || '',
            description: pre?.description || '',
            alt: ''
        });

        // Populate combined modal images state (E-commerce Style)
        const list = [];
        if (existing) {
            if (existing.src) {
                list.push({
                    id: 'ex-main',
                    src: existing.src,
                    file: null,
                    isMain: true,
                    isExisting: true,
                    alt: existing.title || ''
                });
            }
            if (Array.isArray(existing.sub_image)) {
                existing.sub_image.forEach((url, i) => {
                    if (url) {
                        list.push({
                            id: `ex-sub-${i}`,
                            src: url,
                            file: null,
                            isMain: false,
                            isExisting: true,
                            alt: existing.title || ''
                        });
                    }
                });
            }
        }

        setModalImages(list);
        if (list.length > 0) {
            setActiveId(list[0].id);
        } else {
            setActiveId(null);
        }

        setUploadProgress(null);
        setIsModalOpen(true);
    };

    const handleOpenShowcaseModal = () => {
        setShowcaseFormData({ title: '', description: '' });
        setShowcaseFile(null);
        setShowcasePreviewSrc(null);
        setIsShowcaseModalOpen(true);
    };

    const handleShowcaseFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setShowcaseFile(file);
            setShowcasePreviewSrc(URL.createObjectURL(file));
        }
    };

    const handleSaveShowcase = async (e) => {
        e.preventDefault();
        if (!showcaseFile) {
            showAlert({ title: 'Image Required', text: 'Please select an image to upload.', icon: 'error' });
            return;
        }
        setShowcaseSaving(true);
        try {
            const payload = {
                heading: '',
                title: showcaseFormData.title || 'Showcase Image',
                description: showcaseFormData.description || '',
                status: true
            };
            await galleryService.upload(showcaseFile, payload);
            showAlert({ title: 'Saved!', text: 'Showcase image uploaded successfully.', icon: 'success' });
            fetchGallery();
            setIsShowcaseModalOpen(false);
        } catch (err) {
            console.error("Showcase upload failed", err);
            showAlert({ title: 'Error', text: 'Failed to upload showcase image.', icon: 'error' });
        } finally {
            setShowcaseSaving(false);
        }
    };


    const handleRemoveExistingImage = (imgId) => {
        setModalImages(prev => {
            const remaining = prev.filter(img => img.id !== imgId);
            const wasMain = prev.find(img => img.id === imgId)?.isMain;
            if (wasMain && remaining.length > 0) {
                remaining[0].isMain = true;
            }
            if (activeId === imgId) {
                setActiveId(remaining.length > 0 ? remaining[0].id : null);
            }
            return remaining;
        });
    };

    const addFilesToQueue = (files) => {
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        const existingDoc = images.find(img => img.heading === formData.eventRef);
        const isExistingEvent = !!existingDoc;

        if (!isExistingEvent) {
            // For a brand new event, restrict to at most 1 image total (main image only)
            const currentCount = modalImages.length;
            const slotsAvailable = Math.max(0, 1 - currentCount);

            if (slotsAvailable === 0) {
                showAlert({
                    title: 'Limit Reached',
                    text: 'For new events, you can upload only the main featured image initially. Please save the event first before adding sub-images.',
                    icon: 'warning'
                });
                return;
            }

            const filesToQueue = imageFiles.slice(0, slotsAvailable);
            if (imageFiles.length > slotsAvailable) {
                showAlert({
                    title: 'Images Limited',
                    text: `Only the main image was added. Save the event to upload sub-images.`,
                    icon: 'warning'
                });
            }

            const newEntries = filesToQueue.map((file, i) => {
                const id = `new-${Date.now()}-${i}`;
                const previewUrl = URL.createObjectURL(file);
                return {
                    id,
                    src: previewUrl,
                    file,
                    isMain: false,
                    isExisting: false,
                    alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
                };
            });

            setModalImages(prev => {
                const updated = [...prev, ...newEntries];
                const hasMain = updated.some(img => img.isMain);
                if (!hasMain && updated.length > 0) {
                    updated[0].isMain = true;
                }
                return updated;
            });

            if (newEntries.length > 0) {
                setActiveId(newEntries[0].id);
            }
        } else {
            // For existing events, queue as many sub-images locally as desired to be uploaded on save
            const newEntries = imageFiles.map((file, i) => {
                const id = `new-${Date.now()}-${i}`;
                const previewUrl = URL.createObjectURL(file);
                return {
                    id,
                    src: previewUrl,
                    file,
                    isMain: false,
                    isExisting: false,
                    alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
                };
            });

            setModalImages(prev => {
                const updated = [...prev, ...newEntries];
                const hasMain = updated.some(img => img.isMain);
                if (!hasMain && updated.length > 0) {
                    updated[0].isMain = true;
                }
                return updated;
            });

            if (newEntries.length > 0) {
                setActiveId(newEntries[0].id);
            }
        }
    };

    const handleDropZoneChange = (e) => addFilesToQueue(e.target.files);

    const handleDrop = (e) => {
        e.preventDefault();
        dropZoneRef.current?.classList.remove('border-[#B3925B]', 'bg-amber-50/30');
        addFilesToQueue(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        dropZoneRef.current?.classList.add('border-[#B3925B]', 'bg-amber-50/30');
    };

    const handleDragLeave = () => {
        dropZoneRef.current?.classList.remove('border-[#B3925B]', 'bg-amber-50/30');
    };

    const handleUpdateActiveAlt = (value) => {
        setModalImages(prev => prev.map(img => img.id === activeId ? { ...img, alt: value } : img));
    };

    const handleSetAsMain = () => {
        setModalImages(prev => prev.map(img => ({
            ...img,
            isMain: img.id === activeId
        })));
    };

    const handleDeleteActive = () => {
        setModalImages(prev => {
            const remaining = prev.filter(img => img.id !== activeId);
            const wasMain = prev.find(img => img.id === activeId)?.isMain;
            if (wasMain && remaining.length > 0) {
                remaining[0].isMain = true;
            }

            const deletedItem = prev.find(img => img.id === activeId);
            if (deletedItem && !deletedItem.isExisting) {
                URL.revokeObjectURL(deletedItem.src);
            }

            if (remaining.length > 0) {
                setActiveId(remaining[0].id);
            } else {
                setActiveId(null);
            }
            return remaining;
        });
    };

    const handleDelete = async (flatImg) => {
        const confirmed = await confirmDialog({
            title: 'Delete Item?',
            text: 'Are you sure you want to remove this gallery item and all of its associated images? This cannot be undone.'
        });

        if (confirmed) {
            try {
                // Delete the entire document
                await galleryService.delete(flatImg.docId);
                showAlert({ title: 'Deleted!', text: 'Gallery item removed successfully', icon: 'success' });
                fetchGallery();
            } catch (error) {
                showAlert({ title: 'Error', text: 'Failed to delete item', icon: 'error' });
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (modalImages.length === 0 && !formData.eventRef && !formData.title) {
            showAlert({ title: 'Nothing to save', text: 'Please add at least one image or fill in the event details.', icon: 'error' });
            return;
        }

        setSaving(true);

        try {
            const existingDoc = images.find(img => img.heading === formData.eventRef);

            const mainItem = modalImages.find(img => img.isMain);
            const subItems = modalImages.filter(img => !img.isMain);

            let finalMainFile = null;
            let finalMainImage = '';

            if (mainItem) {
                if (mainItem.isExisting) {
                    finalMainImage = mainItem.src;
                } else {
                    finalMainFile = mainItem.file;
                }
            }

            // 1. If existing event, upload new sub-images sequentially in save process
            let uploadedSubImagesList = subItems.filter(item => item.isExisting).map(item => item.src);

            if (existingDoc) {
                const newSubItems = subItems.filter(item => !item.isExisting);
                if (newSubItems.length > 0) {
                    const total = newSubItems.length;
                    setUploadProgress({ done: 0, total });
                    let done = 0;
                    for (let item of newSubItems) {
                        await galleryService.addSubImage(existingDoc.id, item.file);
                        done += 1;
                        setUploadProgress({ done, total });
                    }

                    // Fetch updated details from server to sync the new sub-image URLs
                    const detailsRes = await galleryService.details(existingDoc.id);
                    const serverDoc = detailsRes.data || detailsRes;
                    uploadedSubImagesList = serverDoc.sub_image || [];
                }
            } else {
                // For new events, we restrict uploads to main image only at creation
                uploadedSubImagesList = subItems.map(item => item.file);
            }

            // 2. Build final update payload
            const payload = {
                heading: formData.eventRef || '',
                title: formData.title || '',
                description: formData.description || '',
                status: true,
                sub_image: uploadedSubImagesList
            };

            if (finalMainImage) {
                payload.image = finalMainImage;
            }

            if (existingDoc) {
                await galleryService.update(existingDoc.id, finalMainFile, payload);
            } else {
                await galleryService.upload(finalMainFile, payload);
            }

            showAlert({ title: 'Saved!', text: 'Event saved successfully.', icon: 'success' });
            fetchGallery();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Saving event failed", error);
            showAlert({ title: 'Error', text: 'Failed to save event.', icon: 'error' });
        } finally {
            setSaving(false);
            setUploadProgress(null);
        }
    };

    // Sort newest to the top by ID
    const sortedImages = [...filteredImages].sort((a, b) => {
        const idA = a.id || a._id || '';
        const idB = b.id || b._id || '';
        return idB.localeCompare(idA);
    });

    const activeImage = modalImages.find(img => img.id === activeId);

    const existingDoc = images.find(img => img.heading === formData.eventRef);
    const isExistingEvent = !!existingDoc;
    const canAddMore = isExistingEvent || modalImages.length < 1;

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
                    {activeTab === 'images' && (
                        <div className="flex gap-2">
                            <Button
                                onClick={handleOpenShowcaseModal}
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:border-emerald-700 font-semibold"
                            >
                                <Plus className="h-4 w-4" /> Upload Gallery Image
                            </Button>
                            <Button
                                onClick={() => handleOpenModal('')}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" /> Upload Event Images
                            </Button>
                        </div>
                    )}
                </div>
            </div>



            {activeTab === 'events' ? (
                <div className="grid grid-cols-1 gap-10 animate-in fade-in duration-300">
                    {availableEvents.map((eventRef, evtIdx) => {
                        const existing = images.find(item => item.heading === eventRef);
                        const defaults = DEFAULT_EVENTS.find(e => e.eventRef === eventRef);
                        const activeData = existing || defaults;

                        // Extract images from single document model
                        const eventImages = [];
                        if (existing) {
                            if (existing.src) {
                                eventImages.push({ src: existing.src, alt: existing.title });
                            }
                            if (Array.isArray(existing.sub_image)) {
                                existing.sub_image.forEach(url => {
                                    if (url) {
                                        eventImages.push({ src: url, alt: existing.title });
                                    }
                                });
                            }
                        }

                        const descParagraphs = activeData.description
                            ? activeData.description.split('\n').filter(Boolean)
                            : [];

                        return (
                            <Card key={eventRef} className="overflow-hidden border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                                {/* Admin action bar */}
                                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/60">
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#B3925B]">
                                        {eventRef}
                                        {!existing && <span className="text-slate-400 font-normal lowercase ml-2">(default text)</span>}
                                        <span className="text-slate-400 font-normal normal-case ml-2">· {eventImages.length} image{eventImages.length !== 1 ? 's' : ''}</span>
                                    </span>
                                    <div className="flex gap-2 items-center">
                                        <div className="flex gap-1 mr-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                disabled={evtIdx === 0}
                                                onClick={() => handleMoveEvent(eventRef, 'up')}
                                                title="Move Event Up"
                                                className="px-2"
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                disabled={evtIdx === availableEvents.length - 1}
                                                onClick={() => handleMoveEvent(eventRef, 'down')}
                                                title="Move Event Down"
                                                className="px-2"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Button size="sm" onClick={() => handleOpenModal(eventRef)} className="text-xs">
                                            Edit Event Details
                                        </Button>
                                    </div>
                                </div>

                                {/* Split layout: Left text | Right carousel */}
                                <CardContent className="p-6 md:p-8">
                                    <div className={`flex flex-col lg:flex-row gap-8 lg:gap-10 items-start ${evtIdx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                        }`}>

                                        {/* LEFT — text column */}
                                        <div className="w-full lg:w-[38%] space-y-5">
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase tracking-[0.2em] text-[#B3925B] font-bold block">
                                                    Recent Session Highlight
                                                </span>
                                                <h3 className="text-2xl md:text-3xl font-light font-serif text-slate-800 leading-tight">
                                                    {activeData.title}
                                                </h3>
                                            </div>
                                            <div className="space-y-3 text-sm text-slate-600 font-light leading-relaxed">
                                                {descParagraphs.length > 0
                                                    ? descParagraphs.map((para, i) => <p key={i}>{para}</p>)
                                                    : <p className="text-slate-400 italic">No description yet — click Edit Event Details to add one.</p>
                                                }
                                            </div>
                                        </div>

                                        {/* RIGHT — image carousel */}
                                        <div className="w-full lg:w-[62%]">
                                            <EventCarousel
                                                images={eventImages}
                                                onAddImages={() => handleOpenModal(eventRef)}
                                                eventRef={eventRef}
                                            />
                                            {/* Manage strip below carousel */}
                                            {eventImages.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {eventImages.slice(0, 8).map((img, i) => {
                                                        return (
                                                            <div key={i} className="relative group w-14 h-10 rounded-lg overflow-hidden border border-slate-100 shadow-sm flex-shrink-0">
                                                                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                                                            </div>
                                                        );
                                                    })}
                                                    {eventImages.length > 8 && (
                                                        <div className="w-14 h-10 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                                                            +{eventImages.length - 8}
                                                        </div>
                                                    )}
                                                    <div
                                                        onClick={() => handleOpenModal(eventRef)}
                                                        className="w-14 h-10 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#B3925B] hover:bg-amber-50/20 transition-all"
                                                    >
                                                        <Plus className="h-4 w-4 text-slate-300" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <>
                    {/* Toolbar */}
                    <Card>
                        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search images by description/title..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">Filter Event:</span>
                                <select
                                    className="flex h-10 w-full md:w-64 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3925B] focus-visible:ring-offset-2"
                                    value={selectedFilterEventId}
                                    onChange={(e) => {
                                        setSelectedFilterEventId(e.target.value);
                                        if (e.target.value === 'all') {
                                            setSearchParams({});
                                        } else {
                                            setSearchParams({ eventId: e.target.value });
                                        }
                                    }}
                                >
                                    <option value="all">Show All Images</option>
                                    <option value="general">General Gallery (Unlinked)</option>
                                    {availableEvents.map((evt) => (
                                        <option key={evt} value={evt}>
                                            {evt}
                                        </option>
                                    ))}
                                </select>
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
                        <Table headers={['Thumbnail', 'Event Reference', 'Title / Description', 'Status', 'Actions']}>
                            {sortedImages.map((img) => {
                                return (
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
                                        <TableCell className="text-xs font-semibold text-slate-600">
                                            {img.heading ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-[#B3925B] border border-amber-100 uppercase tracking-wider">
                                                    {img.heading}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-normal">General Gallery</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-800 font-serif text-sm">
                                            {img.title || <span className="text-slate-400 italic">No Title</span>}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(img); }}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer ${Boolean(img.status) ? 'bg-emerald-500' : 'bg-slate-300'
                                                    }`}
                                            >
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${Boolean(img.status) ? 'translate-x-4.5' : 'translate-x-1'
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
                                                {img.heading && img.isMain && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="h-8 w-8 p-0 bg-amber-50 border-amber-200 text-[#B3925B] hover:bg-amber-100 hover:text-[#A3845A]"
                                                        title="Add Sub Images"
                                                        onClick={() => handleOpenModal(img.heading)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    className="h-8 w-8 p-0"
                                                    title="Delete Image"
                                                    onClick={() => handleDelete(img)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </Table>
                    ) : (
                        <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400">No gallery images found matching your search.</p>
                        </div>
                    )}
                </>
            )}

            {/* Gallery Upload Modal — Unified Event + Images (E-commerce Style) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { if (!saving) setIsModalOpen(false); }}
                title={formData.eventRef ? `Manage ${formData.eventRef}` : 'Add Event to Gallery'}
                className="max-w-4xl"
                footer={
                    <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-slate-400">
                            {uploadProgress
                                ? `Uploading ${uploadProgress.done} of ${uploadProgress.total}…`
                                : modalImages.length > 0
                                    ? `${modalImages.length} image${modalImages.length !== 1 ? 's' : ''} configured`
                                    : 'Fill in event details and add images'}
                        </span>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
                            <Button onClick={handleSave} isLoading={saving}>
                                Save Event Details
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-6">

                    {/* ── SECTION 1: Event Heading ── */}
                    <div className="pb-5 border-b border-slate-100 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#B3925B]">Event Heading</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Event Reference Label"
                                placeholder="e.g. Event 1, Event 2"
                                value={formData.eventRef}
                                onChange={(e) => setFormData(prev => ({ ...prev, eventRef: e.target.value }))}
                            />
                            <Input
                                label="Event Title"
                                placeholder="e.g. Figure to Future™ Session for Rotary Club"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* ── SECTION 2: Description ── */}
                    <div className="pb-5 border-b border-slate-100 space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#B3925B]">Description</p>
                        <textarea
                            className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B3925B]/40 focus:border-[#B3925B] transition-colors resize-none leading-relaxed"
                            placeholder="Write the narrative paragraphs for this event. Each new line becomes a paragraph on the site."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    {/* ── SECTION 3: E-commerce Product Gallery Layout ── */}
                    <div className="pt-2 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#B3925B]">Gallery Manager</p>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">

                            {/* Left Side: Large Preview & Caption Editor (3/5 width) */}
                            <div className="md:col-span-3 space-y-4">
                                {activeImage ? (
                                    <>
                                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                                            <img src={activeImage.src} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] tracking-wider px-2.5 py-1 rounded-full font-semibold uppercase">
                                                {activeImage.isMain ? '★ Main Featured Image' : 'Additional Image'}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-end">
                                            <div className="flex-1 text-left">
                                                <Input
                                                    label="Active Image Caption"
                                                    placeholder="Caption for this specific image..."
                                                    value={activeImage.alt || ''}
                                                    onChange={(e) => handleUpdateActiveAlt(e.target.value)}
                                                />
                                            </div>
                                            {!activeImage.isMain && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleSetAsMain}
                                                    className="h-10 text-xs shrink-0"
                                                >
                                                    Set as Main
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="danger"
                                                onClick={handleDeleteActive}
                                                className="h-10 text-xs shrink-0 gap-1.5"
                                            >
                                                <Trash2 className="h-4 w-4" /> Remove
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-sm">
                                        <ImageIcon className="h-8 w-8 mb-2 opacity-30" />
                                        No images configured
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Image Thumbnails Grid (2/5 width) */}
                            <div className="md:col-span-2 space-y-3 text-left">
                                <p className="text-xs font-semibold text-slate-500">Thumbnails (Aside)</p>
                                <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1 p-1">
                                    {modalImages.map((img) => (
                                        <div
                                            key={img.id}
                                            onClick={() => setActiveId(img.id)}
                                            className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${img.id === activeId
                                                ? 'border-[#B3925B] ring-2 ring-[#B3925B]/20 scale-95 shadow-md'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <img src={img.src} alt="" className="w-full h-full object-cover" />
                                            {img.isMain && (
                                                <div className="absolute top-1 left-1 bg-[#B3925B] text-white text-[8px] px-1 rounded font-semibold uppercase">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Integrated Dropzone card at the end (conditional based on limits) */}
                                    {canAddMore ? (
                                        <div
                                            ref={dropZoneRef}
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onClick={() => multiFileInputRef.current?.click()}
                                            className="relative aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#B3925B] hover:bg-amber-50/20 transition-all text-slate-400"
                                            title="Add more images"
                                        >
                                            <Plus className="h-5 w-5 text-slate-400" />
                                            <span className="text-[10px] font-semibold mt-1">Add Image</span>
                                            <input
                                                ref={multiFileInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleDropZoneChange}
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative aspect-square rounded-xl border border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-center p-1.5 cursor-not-allowed">
                                            <span className="text-[9px] font-semibold text-slate-400">Limit Reached</span>
                                            <span className="text-[8px] mt-0.5 text-slate-400 leading-tight">Save event first to upload more.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Upload progress bar */}
                        {uploadProgress && (
                            <div className="space-y-1 pt-4">
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-[#B3925B] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-center text-slate-500 font-medium">
                                    {uploadProgress.done} / {uploadProgress.total} complete
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </Modal>

            {/* Gallery Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedImage?.heading ? `Event Details Preview (${selectedImage.heading})` : 'Gallery Image Preview'}
                className="max-w-2xl"
            >
                {selectedImage && (
                    <div className="space-y-6">
                        {/* Title & Badge */}
                        <div className="space-y-2">
                            {selectedImage.heading && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#B3925B] border border-amber-100 uppercase tracking-wider">
                                    {selectedImage.heading}
                                </span>
                            )}
                            <h2 className="text-2xl font-serif text-slate-800 leading-tight">
                                {selectedImage.title || 'Untitled Image'}
                            </h2>
                        </div>

                        {/* Large Main Image Preview */}
                        <div className={`relative overflow-hidden shadow-md rounded-2xl bg-slate-50 border border-slate-200 ${detailAspect} w-full max-w-md mx-auto flex items-center justify-center`}>
                            {activePreviewSrc ? (
                                <img
                                    src={activePreviewSrc}
                                    alt=""
                                    className="max-w-full max-h-full object-contain rounded-xl"
                                />
                            ) : (
                                <div className="text-slate-300 flex flex-col items-center">
                                    <ImageIcon className="h-12 w-12 opacity-20" />
                                    <span className="text-xs mt-2">No preview image</span>
                                </div>
                            )}
                        </div>

                        {/* Event description paragraphs */}
                        {selectedImage.description && (
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B3925B]">Narrative / Description</p>
                                <div className="text-sm text-slate-600 font-light leading-relaxed space-y-3 max-h-[180px] overflow-y-auto pr-1 break-words">
                                    {selectedImage.description.split('\n').filter(Boolean).map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Event sub-images thumbnails list */}
                        {selectedImage.heading && selectedImage.sub_image && selectedImage.sub_image.length > 0 && (
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B3925B]">Event Sub-Images ({selectedImage.sub_image.length})</p>
                                <div className="flex flex-wrap gap-2.5 max-h-[120px] overflow-y-auto p-1">
                                    {/* Main image thumbnail */}
                                    {selectedImage.src && (
                                        <div
                                            onClick={() => setActivePreviewSrc(selectedImage.src)}
                                            className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activePreviewSrc === selectedImage.src
                                                ? 'border-[#B3925B] ring-2 ring-[#B3925B]/20 scale-95 shadow-md'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <img src={selectedImage.src} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[7px] text-center font-bold py-0.5 uppercase tracking-wide">
                                                Main
                                            </div>
                                        </div>
                                    )}
                                    {/* Sub-image thumbnails */}
                                    {selectedImage.sub_image.map((url, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActivePreviewSrc(url)}
                                            className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activePreviewSrc === url
                                                ? 'border-[#B3925B] ring-2 ring-[#B3925B]/20 scale-95 shadow-md'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[7px] text-center font-bold py-0.5 uppercase tracking-wide">
                                                Sub {idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Dedicated Showcase Image Upload Modal */}
            <Modal
                isOpen={isShowcaseModalOpen}
                onClose={() => { if (!showcaseSaving) setIsShowcaseModalOpen(false); }}
                title="Add Showcase Image"
                className="max-w-2xl"
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="secondary" onClick={() => setIsShowcaseModalOpen(false)} disabled={showcaseSaving}>Cancel</Button>
                        <Button onClick={handleSaveShowcase} isLoading={showcaseSaving}>
                            Save Showcase Image
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Section 1: Title */}
                    <div className="space-y-2 text-left">
                        <Input
                            label="Image Title / Caption"
                            placeholder="e.g. Showcase Photo Title"
                            value={showcaseFormData.title}
                            onChange={(e) => setShowcaseFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>

                    {/* Section 2: Description */}
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#B3925B] block mb-1">Description</label>
                        <textarea
                            className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B3925B]/40 focus:border-[#B3925B] transition-colors resize-none leading-relaxed"
                            placeholder="Write a short description or caption for this showcase image."
                            value={showcaseFormData.description}
                            onChange={(e) => setShowcaseFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    {/* Section 3: File Upload */}
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#B3925B] block mb-1">Upload Image</label>
                        {showcasePreviewSrc ? (
                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group p-1">
                                <img src={showcasePreviewSrc} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowcaseFile(null);
                                        setShowcasePreviewSrc(null);
                                    }}
                                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => document.getElementById('showcase-file-input').click()}
                                className="flex flex-col items-center justify-center gap-3 h-48 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-[#B3925B] hover:bg-amber-50/20 transition-all duration-200 text-center p-8"
                            >
                                <UploadCloud className="h-8 w-8 text-slate-300" />
                                <p className="text-xs text-slate-400 font-medium">Click to select or drag image here</p>
                                <input
                                    id="showcase-file-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleShowcaseFileChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Gallery;
