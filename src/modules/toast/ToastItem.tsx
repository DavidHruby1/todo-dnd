import type { ToastType } from 'src/types/index'; 
import { X } from 'lucide-react';
import styles from './ToastItem.module.css';

type ToastItemProps = {
    type: ToastType;
    message: string;
    onClose: () => void;
};

export const ToastItem = ({ type, message, onClose }: ToastItemProps) => {
    return (
        <div className={`${ type === 'error' ? styles['toast-item-error'] : styles['toast-item-warning'] }`}>
            <p>{message}</p>
            <button 
                onClick={onClose}
                className="close-btn" 
                aria-label="Close"
            >
                <X size={24} /> 
            </button>
        </div>
    );
}