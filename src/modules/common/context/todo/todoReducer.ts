import type { TodoData , TodoList } from 'src/types/index';

const ACTION_TYPES = {
    ADD_TASK: "ADD_TASK",
    DELETE_TASK: "DELETE_TASK",
    FINISH_TASK: "FINISH_TASK",
    SYNC_STORAGE: "SYNC_STORAGE",
    TOGGLE_TASK_EDITING: "TOGGLE_TASK_EDITING",
} as const;

export type TodoAction = 
    | { type: typeof ACTION_TYPES.ADD_TASK; payload: string; }
    | { type: typeof ACTION_TYPES.DELETE_TASK; payload: string; }
    | { type: typeof ACTION_TYPES.FINISH_TASK; payload: string; }
    | { type: typeof ACTION_TYPES.SYNC_STORAGE; payload: TodoList; }
    | { type: typeof ACTION_TYPES.TOGGLE_TASK_EDITING; payload: Record<string, string>; }


const calcMaxOrder = (state: TodoList): number => {
    if (state.length === 0) return 1;
    return Math.max(...state.map(t => t.order)) + 1;
};

export const todoReducer = (state: TodoList, action: TodoAction): TodoList => {
    switch (action.type) {
        case "ADD_TASK":
            const newTask: TodoData = {
                id: crypto.randomUUID(),
                text: action.payload,
                isDone: false,
                isEditing: false,
                order: calcMaxOrder(state)
            };
            return [...state, newTask];
            
        case "DELETE_TASK":
            return state.filter(task => task.id !== action.payload);

        case "FINISH_TASK":
            return state.map(task => {
                if (task.id === action.payload) {
                    return {
                        ...task,
                        isDone: !task.isDone,
                    };
                }
                return task;
            });

        case "SYNC_STORAGE":
            return action.payload;

        case "TOGGLE_TASK_EDITING":
            return state.map(task => {
                if (task.id === action.payload.id) {
                    return {
                        ...task,
                        text: action.payload.inputText,
                        isEditing: !task.isEditing,
                    };
                }
                return task;
            });

        default:
            return state;
    }
}