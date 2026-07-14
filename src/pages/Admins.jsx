import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Phone, Eye, EyeOff, Users, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { showAlert, confirmDialog } from '../components/shared/ConfirmDialog';

const Admins = () => {
    const { user } = useAuth();

    // Admins List State
    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [error, setError] = useState(null);

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        phone_number: '',
        password: ''
    });

    // Fetch Admins List
    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        setError(null);
        try {
            const data = await authService.listAdmins();
            const adminList = Array.isArray(data) ? data : (data?.data || []);
            setAdmins(adminList);
        } catch (err) {
            console.error('Failed to fetch admins:', err);
            setError(err.message || 'Failed to retrieve administrators from backend');
            showAlert({ title: 'Error', text: 'Failed to fetch admin list from server', icon: 'error' });
            setAdmins([]);
        } finally {
            setLoadingAdmins(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Handle Create Form Input
    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin(prev => ({ ...prev, [name]: value }));
    };

    // Handle Create Submit
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await authService.createAdmin(
                newAdmin.email,
                newAdmin.phone_number,
                newAdmin.name,
                newAdmin.password
            );
            showAlert({ title: 'Success', text: 'Admin account created successfully', icon: 'success' });
            setIsCreateOpen(false);
            setNewAdmin({ name: '', email: '', phone_number: '', password: '' });
            setShowPassword(false);
            fetchAdmins();
        } catch (err) {
            showAlert({ title: 'Error', text: err.response?.data?.message || err.message || 'Failed to create admin', icon: 'error' });
        } finally {
            setCreateLoading(false);
        }
    };

    // Handle Delete Admin
    const handleDeleteAdmin = async (id, email) => {
        if (email === user?.email) {
            showAlert({ title: 'Action Denied', text: 'You cannot delete your own logged-in account.', icon: 'warning' });
            return;
        }

        const confirmed = await confirmDialog({
            title: 'Delete Admin?',
            text: `Are you sure you want to delete administrator ${email}? This action is irreversible.`,
            confirmText: 'Yes, delete admin'
        });

        if (confirmed) {
            try {
                await authService.deleteAdmin(id);
                showAlert({ title: 'Deleted', text: 'Admin account has been removed.', icon: 'success' });
                fetchAdmins();
            } catch (err) {
                showAlert({ title: 'Error', text: err.response?.data?.message || err.message || 'Failed to delete admin', icon: 'error' });
            }
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-serif">Administrators</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Manage user access and details for the Being & Beyond CMS.</p>
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                </Button>
            </div>

            {/* Connection Error Warning */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in duration-200">
                    <div className="p-1 rounded bg-red-100 text-red-700">
                        <Settings className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-red-800">Connection Error</h4>
                        <p className="text-xs text-red-700 mt-0.5">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            <Card className="border-none shadow-md shadow-slate-100/50">
                <CardContent className="p-0">
                    {loadingAdmins ? (
                        <div className="p-12 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : admins.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Users className="h-12 w-12 mx-auto text-slate-300 mb-3 animate-pulse" />
                            No admin users found
                        </div>
                    ) : (
                        <Table headers={['Name & Info', 'Email Address', 'Phone Number', 'Actions']}>
                            {admins.map((adm) => (
                                <TableRow key={adm._id || adm.email}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                                                {adm.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800">
                                                    {adm.name}
                                                </div>
                                                {adm.description && (
                                                    <div className="text-xs text-slate-400 mt-0.5 max-w-sm line-clamp-1">
                                                        {adm.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            {adm.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            {adm.phone_number || <span className="text-slate-300 italic text-xs">Not Set</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={adm.email === user?.email}
                                            onClick={() => handleDeleteAdmin(adm._id, adm.email)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent p-2 rounded-lg"
                                            title={adm.email === user?.email ? "You cannot delete your own account" : "Delete Admin"}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create Admin Account"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="Name"
                            type="text"
                            name="name"
                            placeholder="Jane Doe"
                            value={newAdmin.name}
                            onChange={handleCreateChange}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="jane@beingandbeyond.com"
                            value={newAdmin.email}
                            onChange={handleCreateChange}
                            required
                        />
                        <Input
                            label="Phone Number"
                            type="text"
                            name="phone_number"
                            placeholder="+65 9876 5432"
                            value={newAdmin.phone_number}
                            onChange={handleCreateChange}
                            required
                        />
                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={newAdmin.password}
                                onChange={handleCreateChange}
                                className="pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-700 focus:outline-none"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                            className="border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createLoading}
                            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2"
                        >
                            Create Account
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Admins;
