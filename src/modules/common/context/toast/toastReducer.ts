import type { ToastType, ToastList, ToastData } from 'src/types/index';

const ACTION_TYPES = {
    SHOW_TOAST: "SHOW_TOAST",
    HIDE_TOAST: "HIDE_TOAST",
} as const;

export type ToastAction =
    | { type: typeof ACTION_TYPES.SHOW_TOAST; payload: Record<ToastType, string> }
    | { type: typeof ACTION_TYPES.HIDE_TOAST; payload: string }

export const toastReducer = (state: ToastList, action: ToastAction) => {
    switch (action.type) {
        case "SHOW_TOAST":
            const toast: ToastData = {
                id: crypto.randomUUID(),
                type: action.payload.type,
                message: action.payload.message
            };
            return [...state, toast];
        
        case "HIDE_TOAST":
            return state.filter(toast => toast.id === action.payload);

        default:
            return state;
    }
}