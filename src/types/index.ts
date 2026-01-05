export type TodoData = {
    id: string;
    text: string;
    isDone: boolean;
    isEditing: boolean;
    order: number;
}

export type TodoList = TodoData[];

export type ToastType = 'error' | 'warning';

export type ToastData = {
    id: string;
    type: ToastType;
    message: string;
}

export type ToastList = ToastData[];