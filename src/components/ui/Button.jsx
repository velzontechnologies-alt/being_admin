import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none',
        secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm active:scale-95 disabled:bg-slate-50 disabled:text-slate-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-95 disabled:bg-red-200',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-50',
        outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 active:scale-95',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
