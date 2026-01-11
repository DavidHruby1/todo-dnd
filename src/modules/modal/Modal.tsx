import { useEffect } from 'react';
import { useModal } from 'src/modules/common/context/modal/useModal';
import styles from './Modal.module.css';

export const Modal = () => {
    const { modal, hideModal } = useModal();

    useEffect(() => {
        if (!modal) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                hideModal();
            } else if (e.key === 'Enter') {
                modal.onConfirm();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [modal, hideModal]);

    if (!modal) return null;

    return (
        <div
            className={styles.overlay}
            onClick={hideModal}
        >
            <div className={styles.modal}>
                <p>{modal.text}</p>
                <div className={styles.buttons}>
                    <button onClick={hideModal} className={styles.button}>Cancel</button>
                    <button onClick={modal.onConfirm} className={styles.button}>Delete</button>
                </div>
            </div>
        </div>
    );
};
