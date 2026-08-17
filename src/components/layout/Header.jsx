import React from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import NotificationBell from './NotificationBell';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const getPageTitle = (pathname) => {
        switch (pathname) {
            case '/dashboard': return 'Dashboard';
            case '/programs': return 'Programs Management';
            case '/events': return 'Events Management';
            case '/gallery': return 'Sanctuary Gallery';
            case '/enquiries': return 'Form Enquiries';
            case '/site-images': return 'Site Images';
            case '/admins': return 'Admin Accounts';
            case '/profile': return 'My Profile Settings';
            default: return 'Admin Panel';
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="p-2 h-auto text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 shadow-sm lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="hidden sm:inline">Admin</span>
                    <ChevronRight className="h-4 w-4 hidden sm:inline" />
                    <h1 className="text-lg font-bold text-slate-800">{getPageTitle(location.pathname)}</h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationBell />

                <div
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity group select-none"
                    title="View Profile Settings"
                >
                    <div className="hidden sm:block mr-1 text-right">
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-primary-600 transition-colors">
                            {user?.name || user?.Name || user?.user?.name || user?.admin?.name || user?.email || ''}
                        </span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold group-hover:border-primary-400 transition-colors overflow-hidden">
                        {user?.profile_image || user?.user?.profile_image || user?.admin?.profile_image ? (
                            <img
                                src={user.profile_image || user.user?.profile_image || user.admin?.profile_image}
                                alt={user.name || 'Profile'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            (user?.name || user?.Name || user?.user?.name || 'A')[0]?.toUpperCase()
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
