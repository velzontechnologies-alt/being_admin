import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                'bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ className, children, ...props }) => {
    return (
        <div className={cn('px-6 py-4 border-b border-slate-100', className)} {...props}>
            {children}
        </div>
    );
};

const CardTitle = ({ className, children, ...props }) => {
    return (
        <h3 className={cn('text-lg font-semibold text-slate-900', className)} {...props}>
            {children}
        </h3>
    );
};

const CardContent = ({ className, children, ...props }) => {
    return (
        <div className={cn('px-6 py-4', className)} {...props}>
            {children}
        </div>
    );
};

const CardFooter = ({ className, children, ...props }) => {
    return (
        <div className={cn('px-6 py-4 bg-slate-50 border-t border-slate-100', className)} {...props}>
            {children}
        </div>
    );
};

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
