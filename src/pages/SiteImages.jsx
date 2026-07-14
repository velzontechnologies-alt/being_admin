import React, { useState } from 'react';
import { Images, RefreshCcw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import ImageUploader from '../components/shared/ImageUploader';
import { imageService } from '../services';
import { showAlert, confirmDialog } from '../components/shared/ConfirmDialog';
import Skeleton from '../components/ui/Skeleton';

const SiteImages = () => {
    const [sections, setSections] = useState([
        { id: 'logo', name: 'Main Logo', image: null, loading: false },
        { id: 'about', name: 'About Section', image: null, loading: false },
        { id: 'programs', name: 'Programs Overview', image: null, loading: false },
        { id: 'facilities', name: 'Our Facilities', image: null, loading: false },
    ]);
    const [fetching, setFetching] = useState(true);

    React.useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            setFetching(true);
            const items = await imageService.listAll();

            setSections(prev => prev.map(section => {
                const found = items.find(item => item.card_title === section.id);
                const imageUrl = found?.card_image || found?.image || found?.file || found?.url || null;
                return found ? { ...section, image: imageUrl } : section;
            }));
        } catch (error) {
            console.error("Failed to load site images", error);
        } finally {
            setFetching(false);
        }
    };

    const handleImageChange = async (id, file, url) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, image: url, loading: true } : s));

        try {
            if (file instanceof File) {
                // Auto-upload
                await imageService.upsertSlot(id, file);
                showAlert({ title: 'Updated!', text: `${id} image has been updated`, icon: 'success' });
            } else if (file === null) {
                // Auto-delete
                await imageService.deleteSlot(id);
                showAlert({ title: 'Deleted', text: `${id} image removed`, icon: 'success' });
            }
        } catch (error) {
            showAlert({ title: 'Error', text: 'Action failed. Please try again.', icon: 'error' });
        } finally {
            setSections(prev => prev.map(s => s.id === id ? { ...s, loading: false } : s));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Site Images</h1>
                <p className="text-slate-500 text-sm">Update static images across different website sections</p>
            </div>

            {fetching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map((n) => (
                        <Card key={n} className="overflow-hidden border-none shadow-sm bg-white">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-16 rounded-full" />
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <Skeleton className="aspect-video w-full rounded-2xl" />
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3 w-40" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section) => (
                        <Card key={section.id} className="overflow-hidden border-slate-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Images className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                                    {section.name}
                                </h3>
                                <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 uppercase tracking-wider">
                                    {section.id}
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <ImageUploader
                                    initialImage={section.image}
                                    onImageChange={(file, url) => handleImageChange(section.id, file, url)}
                                    label="Set section image"
                                    fit={section.id === 'logo' ? 'contain' : 'cover'}
                                    aspectRatio={section.id === 'logo' ? 'aspect-square' : 'aspect-video'}
                                />
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-xs text-slate-400 max-w-[200px] italic">
                                        Updates are saved automatically as soon as you select a file.
                                    </p>
                                    {section.loading && (
                                        <div className="flex items-center gap-2 text-primary-600 font-bold text-sm">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                                            <span>Syncing...</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Card className="bg-primary-600 text-white border-none">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold mb-2 text-white">Need more sections?</h3>
                        <p className="text-primary-100 opacity-90">
                            Contact technical support to add more manageable image slots to your dashboard.
                        </p>
                    </div>
                    <Button variant="secondary" className="bg-white text-primary-600 hover:bg-primary-50 border-none shrink-0">
                        Request New Slot
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default SiteImages;
