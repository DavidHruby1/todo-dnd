export type TodoData = {
    id: string;
    text: string;
    isDone: boolean;
    isEditing: boolean;
    order: number;
}

export type TodoList = TodoData[];