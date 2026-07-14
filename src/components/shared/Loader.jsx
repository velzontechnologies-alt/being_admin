import React from 'react';
import { cn } from '../../utils/cn';

const Loader = ({ fullScreen, size = 'md', className }) => {
    const sizes = {
        sm: 'h-6 w-6 border-2',
        md: 'h-10 w-10 border-4',
        lg: 'h-16 w-16 border-4',
    };

    const loader = (
        <div className={cn(
            'animate-spin rounded-full border-primary-600 border-t-transparent',
            sizes[size],
            className
        )} />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {loader}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-10">
            {loader}
        </div>
    );
};

export default Loader;
