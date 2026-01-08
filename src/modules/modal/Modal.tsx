import { useModal } from 'src/modules/common/context/modal/useModal';
import styles from './Modal.module.css';

export const Modal = () => {
    const { modal, hideModal } = useModal();

    if (!modal) return null;

    return (
        <div className={styles.overlay}>
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
