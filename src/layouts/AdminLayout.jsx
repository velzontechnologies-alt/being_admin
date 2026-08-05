import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { cn } from '../utils/cn';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return false;
    });

    useEffect(() => {
        let prevDesktop = window.innerWidth >= 1024;
        setSidebarOpen(prevDesktop);

        const handleResize = () => {
            const isDesktop = window.innerWidth >= 1024;
            if (isDesktop !== prevDesktop) {
                setSidebarOpen(isDesktop);
                prevDesktop = isDesktop;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            {/* Main Content */}
            <div
                className="flex-1 min-w-0 w-full flex flex-col min-h-screen transition-all duration-300 ease-in-out lg:pl-64"
            >
                <Header toggleSidebar={toggleSidebar} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
