import { createContext, useState } from 'react';
import type { ModalData } from 'src/types/index';

export type ModalContextType = {
    modal: ModalData | null;
    showModal: (modalData: ModalData) => void;
    hideModal: () => void;
};

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [modal, setModal] = useState<ModalData | null>(null);

    const showModal = (modalData: ModalData): void => {
        setModal(modalData);
    };

    const hideModal = (): void => {
        setModal(null);
    };

    return (
        <ModalContext value={{ modal, showModal, hideModal }}>
            {children}
        </ModalContext>
    );
}