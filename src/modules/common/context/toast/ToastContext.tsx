import { createContext, useReducer, useCallback } from 'react';
import { toastReducer } from './toastReducer';
import type { ToastList, ToastType } from 'src/types/index';

const DISMISS_TIME = 3000;

export type ToastContextType = {
    state: ToastList;
    showToast: (type: ToastType, message: string) => void;
    hideToast: (id: string) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(toastReducer, []);

    const hideToast = useCallback((id: string): void => {
        dispatch({ type: "HIDE_TOAST", payload: id});
    }, []);

    const showToast = useCallback((type: ToastType, message: string): void => {
        const id: string = crypto.randomUUID();
        dispatch({ type: "SHOW_TOAST", payload: { id, type, message } });

        setTimeout(() => {
            hideToast(id);
        }, DISMISS_TIME);
    }, [hideToast]);

    return (
        <ToastContext value={{ state, showToast, hideToast }}>
            { children }
        </ToastContext>
    );
}