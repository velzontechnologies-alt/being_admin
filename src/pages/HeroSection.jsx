import React, { useState } from 'react';
import { Save, RotateCcw, Layout } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Input, TextArea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import ImageUploader from '../components/shared/ImageUploader';
import { imageService } from '../services';
import { showAlert } from '../components/shared/ConfirmDialog';
import Skeleton from '../components/ui/Skeleton';

const HeroSection = () => {
    const [heroItem, setHeroItem] = useState(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const items = await imageService.listAll();
            // Find the dedicated 'hero' image slot by card_title
            const heroAsset = items.find(item => item.card_title === 'hero') || items[0];
            if (heroAsset) {
                setHeroItem({
                    id: heroAsset._id || heroAsset.id,
                    _id: heroAsset._id || heroAsset.id,
                    main_image: heroAsset.card_image || heroAsset.image || heroAsset.file || heroAsset.url || null,
                    card_title: heroAsset.card_title
                });
            } else {
                setHeroItem(null);
            }
        } catch (error) {
            console.error("Failed to load hero data", error);
            setHeroItem(null);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (file, url) => {
        if (!heroItem) return;

        const itemId = heroItem._id || heroItem.id;

        // Optimistically update the UI
        setHeroItem(prev => ({ ...prev, main_image: url }));

        // Auto-upload using the specific item's ID
        if (file instanceof File) {
            try {
                await imageService.upsertSlot(itemId, file);
                showAlert({ title: 'Success!', text: 'Hero image updated successfully', icon: 'success' });
            } catch (error) {
                showAlert({ title: 'Upload Failed', text: 'Could not upload the new hero image', icon: 'error' });
                loadData(); // Revert/Refresh
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                    <Layout className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Hero Section</h1>
                    <p className="text-slate-500 text-sm">Manage the primary visual for your homepage</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    <Card className="overflow-hidden border-none shadow-none bg-transparent">
                        <CardHeader className="px-0">
                            <Skeleton className="h-8 w-48 mb-2" />
                        </CardHeader>
                        <CardContent className="px-0 space-y-6">
                            <Skeleton className="aspect-video w-full rounded-2xl" />
                            <div className="space-y-3">
                                <Skeleton className="h-20 w-full rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : !heroItem ? (
                <Card className="p-16 text-center border-dashed border-2 flex flex-col items-center justify-center gap-4 bg-slate-50/50">
                    <div className="p-4 bg-white rounded-full shadow-sm">
                        <Layout className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">No hero data found in the system.</p>
                </Card>
            ) : (
                <Card className="overflow-hidden border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg">Homepage Background</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <ImageUploader
                                initialImage={heroItem.main_image || null}
                                onImageChange={handleImageChange}
                                label="Update Hero Image"
                            />
                            <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 flex gap-4 items-start">
                                <div className="mt-0.5 p-1.5 bg-white rounded-lg shadow-sm">
                                    <Layout className="h-4 w-4 text-primary-600" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-primary-800">
                                        Optimization Tip
                                    </h4>
                                    <p className="text-xs text-primary-700 leading-relaxed opacity-90">
                                        This visual is the first thing visitors see. High-resolution landscape images (1920x1080) work best for the hero section to ensure clarity across all devices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default HeroSection;
