import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import { showAlert } from '../components/shared/ConfirmDialog';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [profileLoading, setProfileLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);
    
    const [profileForm, setProfileForm] = useState({
        name: '',
        phone_number: '',
        description: ''
    });

    // Fetch details for the logged-in admin using the details route
    const fetchProfileDetails = async () => {
        if (!user || !user.email) return;
        setLoadingDetails(true);
        try {
            let adminId = user?._id || user?.id || user?.user?._id || user?.admin?._id || user?.data?._id;
            
            // If ID is missing, dynamically discover it from the list endpoint by matching the email
            if (!adminId) {
                const listData = await authService.listAdmins();
                const admins = Array.isArray(listData) ? listData : (listData?.data || []);
                const matchedAdmin = admins.find(adm => adm.email === user.email);
                
                if (matchedAdmin && matchedAdmin._id) {
                    adminId = matchedAdmin._id;
                    // Save to local storage session
                    const stored = authService.getUser();
                    localStorage.setItem('user', JSON.stringify({ ...stored, _id: adminId }));
                    refreshUser();
                }
            }
            
            if (!adminId) {
                console.warn('Could not discover admin ID for email:', user.email);
                return;
            }
            
            const data = await authService.getAdminDetails(adminId, user.token);
            // Handle if server returns nested object or directly
            const details = data?.data || data?.admin || data?.user || data || {};
            
            setProfileForm({
                name: details.name || details.Name || '',
                phone_number: details.phone_number || details.phone || '',
                description: details.description || '',
            });
            
            // Sync local storage so other headers/elements are up to date
            const stored = authService.getUser();
            const updated = {
                ...stored,
                name: details.name || details.Name || stored.name,
                phone_number: details.phone_number || details.phone || stored.phone_number,
                description: details.description || stored.description,
                profile_image: details.profile_image || stored.profile_image
            };
            localStorage.setItem('user', JSON.stringify(updated));
            refreshUser();
        } catch (error) {
            console.error('Failed to load profile details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        fetchProfileDetails();
    }, [user?.email, user?._id, user?.id]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            await authService.updateAdmin(
                profileForm.name,
                profileForm.phone_number,
                profileForm.description
            );
            
            // Sync local storage user structure with updated values
            const stored = authService.getUser();
            const updated = {
                ...stored,
                name: profileForm.name,
                phone_number: profileForm.phone_number,
                description: profileForm.description
            };
            localStorage.setItem('user', JSON.stringify(updated));
            refreshUser();

            showAlert({ title: 'Profile Updated', text: 'Your profile has been updated successfully', icon: 'success' });
            
            // Refetch details to ensure consistency
            fetchProfileDetails();
        } catch (error) {
            showAlert({ title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update profile', icon: 'error' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const res = await authService.updateProfile(file);
            const imageUrl = res?.profile_image || res?.data?.profile_image || res?.url || res?.data?.url;

            if (imageUrl) {
                const stored = authService.getUser();
                const updated = {
                    ...stored,
                    profile_image: imageUrl
                };
                localStorage.setItem('user', JSON.stringify(updated));
                refreshUser();
            }
            
            showAlert({ title: 'Success', text: 'Profile picture updated successfully', icon: 'success' });
            fetchProfileDetails();
        } catch (error) {
            showAlert({ title: 'Upload Failed', text: error.response?.data?.message || error.message || 'Failed to upload profile image', icon: 'error' });
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 font-serif">Profile Settings</h2>
                <p className="text-slate-500 text-sm mt-0.5">Manage your user details and access configuration.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Summary & Avatar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-md shadow-slate-100/50">
                        <CardContent className="flex flex-col items-center p-8 text-center">
                            <div 
                                onClick={handleAvatarClick}
                                className="relative w-24 h-24 rounded-full overflow-hidden bg-primary-100 border-2 border-primary-200 flex items-center justify-center text-primary-700 font-bold text-4xl shadow-inner cursor-pointer group"
                                title="Click to Change Profile Picture"
                            >
                                {uploadingImage ? (
                                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-10">
                                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                )}
                                
                                {user?.profile_image || user?.user?.profile_image || user?.admin?.profile_image ? (
                                    <img
                                        src={user.profile_image || user.user?.profile_image || user.admin?.profile_image}
                                        alt={user.name || 'User Profile'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    (user?.name || user?.user?.name || user?.admin?.name || user?.email || 'A')[0]?.toUpperCase()
                                )}
                            </div>
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />

                            <h3 className="mt-4 text-xl font-bold text-slate-800 font-serif">
                                {user?.name || user?.user?.name || user?.admin?.name || ''}
                            </h3>
                             {/* Role badge removed */}
                            
                            <div className="mt-6 pt-6 border-t border-slate-100 w-full text-left space-y-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
                                    <span className="text-sm truncate" title={user?.email || user?.user?.email}>{user?.email || user?.user?.email || ''}</span>
                                </div>
                                {(user?.phone_number || user?.phone || user?.user?.phone_number) && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
                                        <span className="text-sm">{user?.phone_number || user?.phone || user?.user?.phone_number}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Card: Detail Form Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-md shadow-slate-100/50">
                        <CardHeader>
                            <CardTitle className="text-slate-800 font-serif">Account Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loadingDetails ? (
                                <div className="p-12 flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                </div>
                            ) : (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Display Name"
                                            type="text"
                                            name="name"
                                            value={profileForm.name}
                                            onChange={handleProfileChange}
                                            required
                                        />
                                        <Input
                                            label="Phone Number"
                                            type="text"
                                            name="phone_number"
                                            value={profileForm.phone_number}
                                            onChange={handleProfileChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">
                                            Email Address (Username)
                                        </label>
                                        <div className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-400 font-medium select-none flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            {user?.email || user?.user?.email || ''}
                                        </div>
                                    </div>

                                    <TextArea
                                        label="Bio / Profile Description"
                                        name="description"
                                        placeholder="Enter details about your administration roles..."
                                        value={profileForm.description}
                                        onChange={handleProfileChange}
                                        rows={4}
                                    />

                                    <div className="flex justify-end pt-4 border-t border-slate-100">
                                        <Button
                                            type="submit"
                                            isLoading={profileLoading}
                                            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 py-2.5 font-medium shadow-sm transition-all"
                                        >
                                            Save Profile Changes
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
