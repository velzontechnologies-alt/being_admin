import React, { useState, useEffect } from 'react';
import { ImageIcon, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

// API request placeholder — match this to your Axios instance configuration
const fetchUserGallery = async () => {
    const res = await fetch('/api/gallery/status/list');
    if (!res.ok) throw new Error('Failed to fetch gallery');
    return res.json(); // Expected structure: { status: 'success', data: [...] }
};

function ArtDecoFrame() {
    return (
        <>
            {/* Corners */}
            <svg 
                viewBox="0 0 32 32" 
                className="absolute top-0 left-0 w-8 h-8 text-[#B3925B]/80 pointer-events-none z-10"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
            >
                <path d="M 2 32 L 2 10 L 10 10 L 10 2 L 32 2" />
                <path d="M 6 32 L 6 14 L 14 14 L 14 6 L 32 6" />
            </svg>
            <svg 
                viewBox="0 0 32 32" 
                className="absolute top-0 right-0 w-8 h-8 text-[#B3925B]/80 pointer-events-none z-10"
                style={{ transform: 'scaleX(-1)' }}
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
            >
                <path d="M 2 32 L 2 10 L 10 10 L 10 2 L 32 2" />
                <path d="M 6 32 L 6 14 L 14 14 L 14 6 L 32 6" />
            </svg>
            <svg 
                viewBox="0 0 32 32" 
                className="absolute bottom-0 left-0 w-8 h-8 text-[#B3925B]/80 pointer-events-none z-10"
                style={{ transform: 'scaleY(-1)' }}
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
            >
                <path d="M 2 32 L 2 10 L 10 10 L 10 2 L 32 2" />
                <path d="M 6 32 L 6 14 L 14 14 L 14 6 L 32 6" />
            </svg>
            <svg 
                viewBox="0 0 32 32" 
                className="absolute bottom-0 right-0 w-8 h-8 text-[#B3925B]/80 pointer-events-none z-10"
                style={{ transform: 'scale(-1)' }}
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
            >
                <path d="M 2 32 L 2 10 L 10 10 L 10 2 L 32 2" />
                <path d="M 6 32 L 6 14 L 14 14 L 14 6 L 32 6" />
            </svg>

            {/* Connecting Lines */}
            <div className="absolute top-[2px] left-8 right-8 h-[1.5px] bg-[#B3925B]/80 pointer-events-none z-10" />
            <div className="absolute top-[6px] left-8 right-8 h-[1.5px] bg-[#B3925B]/80 pointer-events-none z-10" />
            <div className="absolute bottom-[2px] left-8 right-8 h-[1.5px] bg-[#B3925B]/80 pointer-events-none z-10" />
            <div className="absolute bottom-[6px] left-8 right-8 h-[1.5px] bg-[#B3925B]/80 pointer-events-none z-10" />
            
            <div className="absolute left-[2px] top-8 bottom-8 w-[1.5px] bg-[#B3925B]/80 pointer-events-none z-10" />
            <div className="absolute left-[6px] top-8 bottom-8 w-[1.5px] bg-[#B3925B]/80 pointer-events-none z-10" />
            <div className="absolute right-[2px] top-8 bottom-8 w-[1.5px] bg-[#B3925B]/80 pointer-events-none z-10" />
            <div className="absolute right-[6px] top-8 bottom-8 w-[1.5px] bg-[#B3925B]/80 pointer-events-none z-10" />
        </>
    );
}

/**
 * EventCarousel — Mini responsive slider for client-side events.
 */
function EventCarousel({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[16/10] bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">
                <ImageIcon className="h-10 w-10 opacity-25" />
            </div>
        );
    }

    const next = () => setCurrentIndex((currentIndex + 1) % images.length);
    const prev = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length);

    return (
        <div className="relative aspect-[16/10] w-full rounded-sm shadow-sm bg-white border border-[#B3925B]/30 p-2.5 group">
            <ArtDecoFrame />
            <div className="relative w-full h-full overflow-hidden select-none flex items-center justify-center">
                <img 
                    src={images[currentIndex].src} 
                    alt={images[currentIndex].alt || ''} 
                    className="w-full h-full object-cover transition-all duration-500 rounded-sm" 
                />
            </div>
            {images.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1 rounded-full transition-all ${
                                    idx === currentIndex ? 'w-4 bg-[#B3925B]' : 'w-1 bg-white/60'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * UserGalleryExample — Copy-pasteable component for your client application.
 */
export default function UserGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Detail Modal states
    const [selectedImage, setSelectedImage] = useState(null);
    const [activePreviewSrc, setActivePreviewSrc] = useState(null);
    const [detailAspect, setDetailAspect] = useState('aspect-[4/3]');

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

    useEffect(() => {
        fetchUserGallery()
            .then(res => {
                setImages(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="py-20 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#B3925B] mx-auto mb-4" />
                <p className="text-sm font-light">Loading Sanctuary Gallery...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20 text-center text-red-500">
                <p className="text-sm">Failed to load gallery: {error}</p>
            </div>
        );
    }

    const eventsList = images.filter(img => img.heading);
    const generalImagesList = [];
    images
        .filter(img => !img.heading)
        .forEach(item => {
            const mainUrl = item.src || item.image || item.file;
            if (mainUrl) {
                generalImagesList.push({
                    id: item.id || item._id,
                    src: mainUrl,
                    title: item.title || 'Showcase Image',
                    description: item.description || ''
                });
            }
            if (Array.isArray(item.sub_image)) {
                item.sub_image.forEach((url, idx) => {
                    if (url) {
                        generalImagesList.push({
                            id: `${item.id || item._id}-sub-${idx}`,
                            src: url,
                            title: item.title ? `${item.title} (${idx + 1})` : 'Showcase Image',
                            description: item.description || ''
                        });
                    }
                });
            }
        });

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
            
            {/* Header */}
            <div className="text-center space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B3925B]">Visual Narrative</span>
                <h1 className="text-3xl md:text-4xl font-serif text-slate-800">Sanctuary Gallery</h1>
                <div className="h-0.5 w-16 bg-[#B3925B] mx-auto mt-2" />
            </div>

            {/* Section 1: Events Section (Rich Narrative Content + Carousel) */}
            {eventsList.length > 0 && (
                <div className="space-y-12">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100 pb-2">
                        Featured Experiences & Narratives
                    </h2>
                    <div className="grid grid-cols-1 gap-12">
                        {eventsList.map((event) => {
                            const carouselImages = [];
                            if (event.src) {
                                carouselImages.push({ src: event.src, alt: event.title });
                            }
                            if (Array.isArray(event.sub_image)) {
                                event.sub_image.forEach(url => {
                                    if (url) carouselImages.push({ src: url, alt: event.title });
                                });
                            }

                            return (
                                <div key={event.id || event._id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Left text data */}
                                    <div className="lg:col-span-5 space-y-4 text-left">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#B3925B] border border-amber-100 uppercase tracking-wider">
                                            {event.heading}
                                        </span>
                                        <h3 className="text-2xl font-serif text-slate-800 font-bold leading-tight">
                                            {event.title}
                                        </h3>
                                        <div className="text-sm text-slate-600 font-light leading-relaxed space-y-3 break-words">
                                            {event.description?.split('\n').filter(Boolean).map((para, idx) => (
                                                <p key={idx}>{para}</p>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Right images carousel */}
                                    <div className="lg:col-span-7">
                                        <EventCarousel images={carouselImages} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Section 2: General Images (Grid Format Showcase - Dynamic Aspect Ratios) */}
            {generalImagesList.length > 0 && (
                <div className="space-y-8 pt-8 border-t border-slate-100">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100 pb-2 text-left">
                        Gallery Showcase
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {generalImagesList.map((img) => (
                            <div 
                                key={img.id || img._id} 
                                onClick={() => {
                                    setSelectedImage(img);
                                    setActivePreviewSrc(img.src);
                                }}
                                className="group relative overflow-hidden rounded-sm bg-white border border-[#B3925B]/30 shadow-sm hover:shadow-md transition-all duration-300 aspect-square cursor-pointer p-2.5"
                            >
                                <ArtDecoFrame />
                                <div className="relative w-full h-full overflow-hidden">
                                    <img 
                                        src={img.src} 
                                        alt={img.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-left z-20">
                                        <p className="text-white text-xs font-semibold uppercase">
                                            {img.title || 'Showcase Image'}
                                        </p>
                                        {img.description && (
                                            <p className="text-slate-200 text-[10px] mt-1 line-clamp-2 break-words">
                                                {img.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Client-Side Detail/Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1 text-left">
                                {selectedImage.heading && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#B3925B] border border-amber-100 uppercase tracking-wider">
                                        {selectedImage.heading}
                                    </span>
                                )}
                                <h4 className="text-xl font-serif text-slate-800">{selectedImage.title || 'Untitled Image'}</h4>
                            </div>
                            <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">&times;</button>
                        </div>

                        <div className={`relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 ${detailAspect} w-full max-w-md mx-auto flex items-center justify-center p-2`}>
                            <img src={activePreviewSrc} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
                        </div>

                        {selectedImage.description && (
                            <div className="space-y-2 pt-2 border-t border-slate-100 text-left">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B3925B]">Description</p>
                                <div className="text-sm text-slate-600 font-light leading-relaxed space-y-3 break-words">
                                    {selectedImage.description.split('\n').filter(Boolean).map((para, idx) => (
                                        <p key={idx}>{para}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedImage.sub_image && selectedImage.sub_image.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-100 text-left">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B3925B]">More Images</p>
                                <div className="flex flex-wrap gap-2.5">
                                    <div 
                                        onClick={() => setActivePreviewSrc(selectedImage.src)}
                                        className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                            activePreviewSrc === selectedImage.src ? 'border-[#B3925B]' : 'border-slate-200'
                                        }`}
                                    >
                                        <img src={selectedImage.src} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    {selectedImage.sub_image.map((url, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => setActivePreviewSrc(url)}
                                            className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                                activePreviewSrc === url ? 'border-[#B3925B]' : 'border-slate-200'
                                            }`}
                                        >
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
