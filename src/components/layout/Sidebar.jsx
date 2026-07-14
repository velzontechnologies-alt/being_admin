import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Images,
    LogOut,
    ChevronLeft,
    Menu,
    X,
    Mail,
    BookOpen,
    Grid,
    Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
    const { logout } = useAuth();

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Programs', icon: BookOpen, path: '/programs' },
        { label: 'Events', icon: Calendar, path: '/events' },
        { label: 'Gallery', icon: Grid, path: '/gallery' },
        { label: 'Form Enquiries', icon: Mail, path: '/enquiries' },
        { label: 'Admins', icon: Users, path: '/admins' },
    ];

    const sidebarClasses = cn(
        'fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out',
        'w-64',
        isMobile && !isOpen && '-translate-x-full',
        isMobile && isOpen && 'translate-x-0'
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            <aside className={sidebarClasses}>
                <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
                    {/* Logo Area */}
                    <div className="flex items-center h-16 w-full flex-shrink-0 border-b border-slate-100 px-6">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl leading-none">BB</span>
                        </div>
                        <span className="ml-3 font-bold text-slate-800 text-lg whitespace-nowrap font-serif">
                            Being & Beyond
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                                    isActive
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                )}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm whitespace-nowrap">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-3 border-t border-slate-100">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
                        >
                            <LogOut className="h-4 w-4 flex-shrink-0" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
