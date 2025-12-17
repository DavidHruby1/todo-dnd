import type { TodoData , TodoList } from 'src/types/index';

const ACTION_TYPES = {
    ADD_TASK: "ADD_TASK",
    DELETE_TASK: "DELETE_TASK",
    FINISH_TASK: "FINISH_TASK"
} as const;

type TodoAction = 
    | { type: typeof ACTION_TYPES.ADD_TASK; payload: string; }
    | { type: typeof ACTION_TYPES.DELETE_TASK; payload: string; }
    | { type: typeof ACTION_TYPES.FINISH_TASK; payload: string; };


const calcMaxOrder = (state: TodoList): number => {
    if (state.length === 0) return 1;

    return Math.max(...state.map(t => t.order)) + 1;
};

const todoReducer = (state: TodoList, action: TodoAction): TodoList => {
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
            if (state.length === 0) return state;

            const filteredTasks: TodoList = state.filter(t => {
                return t.id !== action.payload;
            });

            return filteredTasks;
        case "FINISH_TASK":
            const updatedTasks: TodoList = state.map(t => {
                if (t.id === action.payload) {
                    return {
                        ...t,
                        isDone: !t.isDone,
                        order: !t.isDone ? calcMaxOrder(state) : t.order
                    };
                }

                return t;
            });

            return updatedTasks;
        default:
            return state;
    }
}