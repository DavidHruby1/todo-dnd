import { createContext, useReducer } from 'react';
import { todoReducer } from './todoReducer';
import type { TodoList } from 'src/types/index';
import type { TodoAction } from './todoReducer';


type TodoContextType = {
    state: TodoList;
    dispatch: React.Dispatch<TodoAction>;
};

export const TodoContext = createContext<TodoContextType | null>(null);

export const TodoProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(todoReducer, []);

    return (
        <TodoContext value={{ state, dispatch }}>
            { children }
        </TodoContext>
    );
};
