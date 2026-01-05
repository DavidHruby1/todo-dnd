import { useToast } from 'src/modules/common/context/toast/useToast';
import { ToastItem } from './ToastItem';
import styles from './ToastContainer.module.css';

export const ToastContainer = () => {
    const { state, hideToast } = useToast();

    return (
        <div className={styles['toast-container']}>
            {state.map((toast) => (
                <ToastItem
                    key={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => hideToast(toast.id)}
                />
            ))}
        </div>
    );
};
