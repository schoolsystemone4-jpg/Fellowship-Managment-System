import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
    size?: SpinnerSize;
    className?: string;
    text?: string;
}

const LoadingSpinner = ({ size = 'md', className = '', text }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2
                className={`${sizeClasses[size]} text-indigo-500 animate-spin`}
                aria-hidden="true"
            />
            {text && (
                <p className={`${textSizeClasses[size]} text-slate-400 font-medium animate-pulse`}>
                    {text}
                </p>
            )}
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;
