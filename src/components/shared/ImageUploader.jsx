import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload, Crop, Check, X, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Produces a centred initial crop for a given aspect ratio */
function buildInitialCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

/** Draws the cropped region onto a canvas and returns a blob */
function getCroppedBlob(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Output at natural resolution
    canvas.width  = crop.width  * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width  * scaleX,
        crop.height * scaleY,
        0, 0,
        canvas.width,
        canvas.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) return;
            blob.name = fileName;
            resolve({ blob, dataUrl: canvas.toDataURL('image/jpeg', 0.95) });
        }, 'image/jpeg', 0.95);
    });
}

// ─── Crop Modal ───────────────────────────────────────────────────────────────

const CropModal = ({ src, fileName, aspect, onConfirm, onCancel }) => {
    const imgRef = useRef(null);
    const [crop, setCrop]           = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [currentAspect, setCurrentAspect] = useState(aspect);

    const onImageLoad = useCallback((e) => {
        const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
        let finalAspect = aspect;
        if (aspect === 'dynamic') {
            if (h > w) {
                finalAspect = 3 / 4; // Portrait
            } else if (w > h) {
                finalAspect = 4 / 3; // Landscape
            } else {
                finalAspect = 1; // Square
            }
            setCurrentAspect(finalAspect);
        }
        setCrop(buildInitialCrop(w, h, finalAspect));
    }, [aspect]);

    const handleConfirm = async () => {
        if (!completedCrop || !imgRef.current) return;
        const { blob, dataUrl } = await getCroppedBlob(imgRef.current, completedCrop, fileName);
        const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
        onConfirm(croppedFile, dataUrl);
    };

    return (
        /* Backdrop */
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>

            {/* Panel */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
                 style={{ maxHeight: '90vh' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#B3925B]/10">
                            <Crop className="h-4 w-4 text-[#B3925B]" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">Crop Image</h3>
                    </div>
                    <button onClick={onCancel}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Crop Area */}
                <div className="flex-1 overflow-auto bg-slate-900 flex items-center justify-center p-4"
                     style={{ minHeight: '320px', maxHeight: '55vh' }}>
                    <ReactCrop
                        crop={crop}
                        onChange={(_, pct) => setCrop(pct)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={currentAspect === 'dynamic' ? undefined : currentAspect}
                        minWidth={50}
                        minHeight={50}
                        keepSelection
                        className="max-w-full max-h-full"
                    >
                        <img
                            ref={imgRef}
                            src={src}
                            alt="Crop preview"
                            onLoad={onImageLoad}
                            style={{ maxHeight: '50vh', maxWidth: '100%', display: 'block' }}
                        />
                    </ReactCrop>
                </div>

                {/* Hint */}
                <p className="text-center text-xs text-slate-400 py-2 bg-slate-50 border-t border-slate-100">
                    Drag the handles to adjust the crop area
                    {currentAspect && currentAspect !== 'dynamic' ? ` · ${currentAspect === 16/10 ? '16:10' : currentAspect === 1 ? '1:1' : currentAspect === 16/9 ? '16:9' : currentAspect === 4/3 ? '4:3' : currentAspect === 3/4 ? '3:4' : currentAspect.toFixed(2)} ratio` : ''}
                </p>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white">
                    <Button variant="secondary" onClick={onCancel} className="gap-1.5">
                        <RotateCcw className="h-3.5 w-3.5" /> Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!completedCrop?.width || !completedCrop?.height}
                        className="gap-1.5 bg-[#B3925B] hover:bg-[#9A7D4C] text-white border-none"
                    >
                        <Check className="h-4 w-4" /> Apply Crop
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ─── Main ImageUploader ───────────────────────────────────────────────────────

/**
 * ImageUploader
 *
 * Props:
 *  label        — field label
 *  initialImage — URL/base64 pre-populated (reactive to async parent loads)
 *  onImageChange(file, url) — called after crop confirmed or file cleared
 *  className    — extra wrapper classes
 *  fit          — 'cover' | 'contain'  (default 'cover')
 *  aspectRatio  — Tailwind aspect-* class  (default 'aspect-video')
 *  cropAspect   — numeric aspect ratio for crop tool, e.g. 16/9, 1, 4/3
 *                 undefined = free crop
 *  enableCrop   — boolean, default true
 */
const ImageUploader = ({
    label,
    initialImage,
    onImageChange,
    className,
    fit          = 'cover',
    aspectRatio  = 'aspect-video',
    cropAspect,          // e.g. 16/9 or 1 — default: match the display aspect
    enableCrop   = true,
}) => {
    const [preview, setPreview]         = useState(initialImage || null);
    const [rawSrc, setRawSrc]           = useState(null);  // original file src for crop
    const [pendingFile, setPendingFile] = useState(null);  // original File object
    const [cropOpen, setCropOpen]       = useState(false);
    const [previewAspect, setPreviewAspect] = useState(
        aspectRatio === 'dynamic' ? 'aspect-[4/3]' : aspectRatio
    );

    // Sync when parent asynchronously provides the image URL
    useEffect(() => {
        setPreview(initialImage || null);
    }, [initialImage]);

    // Update dynamic preview aspect ratio
    useEffect(() => {
        if (aspectRatio !== 'dynamic') {
            setPreviewAspect(aspectRatio);
            return;
        }
        if (!preview) {
            setPreviewAspect('aspect-[4/3]');
            return;
        }
        const img = new Image();
        img.src = preview;
        img.onload = () => {
            const { naturalWidth: w, naturalHeight: h } = img;
            if (h > w) {
                setPreviewAspect('aspect-[3/4]');
            } else if (w > h) {
                setPreviewAspect('aspect-[4/3]');
            } else {
                setPreviewAspect('aspect-square');
            }
        };
    }, [preview, aspectRatio]);

    // Derive numeric aspect for the crop tool from the aspectRatio Tailwind class
    const resolvedCropAspect = cropAspect === 'dynamic' ? 'dynamic' : (cropAspect ?? (() => {
        if (aspectRatio === 'aspect-square')     return 1;
        if (aspectRatio === 'aspect-video')      return 16 / 9;
        if (aspectRatio === 'aspect-[16/10]')    return 16 / 10;
        if (aspectRatio === 'aspect-[4/3]')      return 4 / 3;
        return undefined; // free crop
    })());

    const inputId = `upload-${label?.replace(/\s+/g, '-') ?? Math.random()}`;
    const objectClass = fit === 'contain' ? 'object-contain' : 'object-cover';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Reset input so same file can be re-selected
        e.target.value = '';

        const reader = new FileReader();
        reader.onloadend = () => {
            if (enableCrop) {
                setRawSrc(reader.result);
                setPendingFile(file);
                setCropOpen(true);
            } else {
                setPreview(reader.result);
                if (onImageChange) onImageChange(file, reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCropConfirm = (croppedFile, croppedUrl) => {
        setCropOpen(false);
        setRawSrc(null);
        setPendingFile(null);
        setPreview(croppedUrl);
        if (onImageChange) onImageChange(croppedFile, croppedUrl);
    };

    const handleCropCancel = () => {
        setCropOpen(false);
        setRawSrc(null);
        setPendingFile(null);
    };

    const clearImage = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setPreview(null);
        if (onImageChange) onImageChange(null, null);
    };

    return (
        <>
            {/* Crop Modal (portal-style, fixed) */}
            {cropOpen && rawSrc && (
                <CropModal
                    src={rawSrc}
                    fileName={pendingFile?.name ?? 'image.jpg'}
                    aspect={resolvedCropAspect}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}

            <div className={cn('w-full', className)}>
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}

                <div className="relative group">
                    {preview ? (
                        <div className={cn(
                            'relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100',
                            previewAspect
                        )}>
                            <img
                                src={preview}
                                alt="Preview"
                                className={cn('absolute inset-0 w-full h-full', objectClass)}
                            />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                {/* Change triggers crop again */}
                                <label htmlFor={inputId}
                                       className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/95 hover:bg-white text-slate-800 shadow-md transition-colors">
                                    <Crop className="h-3.5 w-3.5" /> Change & Crop
                                </label>
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" /> Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label
                            htmlFor={inputId}
                            className={cn(
                                'flex flex-col items-center justify-center w-full rounded-xl',
                                'border-2 border-dashed border-slate-200 bg-slate-50',
                                'hover:bg-slate-100 hover:border-[#B3925B]/50 cursor-pointer transition-all group',
                                previewAspect
                            )}
                        >
                            <div className="flex flex-col items-center justify-center gap-2 p-4">
                                <div className="p-3 rounded-full bg-slate-100 group-hover:bg-[#B3925B]/10 transition-colors text-slate-400 group-hover:text-[#B3925B]">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <p className="text-sm text-slate-500 text-center">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Crop className="h-3 w-3" />
                                    <span>Crop tool included · PNG, JPG, WEBP</span>
                                </div>
                            </div>
                        </label>
                    )}

                    <input
                        id={inputId}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
        </>
    );
};

export default ImageUploader;
