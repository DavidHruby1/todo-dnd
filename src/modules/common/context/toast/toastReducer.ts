import type { ToastType, ToastList, ToastData } from 'src/types/index';

const ACTION_TYPES = {
    SHOW_TOAST: "SHOW_TOAST",
    HIDE_TOAST: "HIDE_TOAST",
} as const;

export type ToastAction =
    | { type: typeof ACTION_TYPES.SHOW_TOAST; payload: { id: string, type: ToastType, message: string }}
    | { type: typeof ACTION_TYPES.HIDE_TOAST; payload: string };

export const toastReducer = (state: ToastList, action: ToastAction) => {
    switch (action.type) {
        case "SHOW_TOAST":
            const toast: ToastData = {
                id: action.payload.id,
                type: action.payload.type,
                message: action.payload.message
            };
            if (state.find(toast => toast.message === action.payload.message)) return state;
            return [...state, toast];
        
        case "HIDE_TOAST":
            return state.filter(toast => toast.id !== action.payload);

        default:
            return state;
    }
}