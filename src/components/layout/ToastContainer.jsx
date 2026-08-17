import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Ticket, Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const ToastContainer = () => {
    const { toasts, removeToast } = useNotifications();
    const navigate = useNavigate();

    if (!toasts || toasts.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'booking':
                return (
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Ticket className="h-5 w-5" />
                    </div>
                );
            case 'enquiry':
                return (
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                        <Mail className="h-5 w-5" />
                    </div>
                );
            default:
                return (
                    <div className="p-2 rounded-lg bg-primary-50 text-primary-600 border border-primary-100">
                        <Bell className="h-5 w-5" />
                    </div>
                );
        }
    };

    const getBorderColor = (type) => {
        switch (type) {
            case 'booking': return 'border-l-emerald-500';
            case 'enquiry': return 'border-l-blue-500';
            default: return 'border-l-primary-500';
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-start gap-3 bg-white border border-slate-100 border-l-4 ${getBorderColor(toast.type)} rounded-xl shadow-lg hover:shadow-xl p-4 transition-all duration-300 transform translate-y-0 opacity-100`}
                >
                    {getIcon(toast.type)}
                    
                    <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                            if (toast.link) {
                                navigate(toast.link);
                            }
                            removeToast(toast.id);
                        }}
                    >
                        <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                            {toast.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {toast.message}
                        </p>
                        <span className="text-[10px] text-primary-600 font-medium hover:underline mt-2 inline-block">
                            View details &rarr;
                        </span>
                    </div>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        title="Dismiss alert"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
