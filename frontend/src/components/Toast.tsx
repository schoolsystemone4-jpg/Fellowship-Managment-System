import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const Toast = ({ id, type, message, duration = 4000, onClose }: ToastProps) => {
    const [progress, setProgress] = useState(100);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 50));
                if (newProgress <= 0) {
                    clearInterval(interval);
                    handleClose();
                    return 0;
                }
                return newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    const styles = {
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        error: 'bg-red-500/10 border-red-500/30 text-red-400',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    };

    const progressStyles = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500',
    };

    return (
        <div
            className={`
                pointer-events-auto max-w-md w-full backdrop-blur-xl rounded-xl border p-4 shadow-2xl 
                transition-all duration-300 ${styles[type]}
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5">{icons[type]}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="text-white/60 hover:text-white transition-colors shrink-0"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-50 linear ${progressStyles[type]}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Toast;
