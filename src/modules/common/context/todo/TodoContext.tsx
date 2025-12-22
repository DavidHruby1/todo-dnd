import { createContext, useReducer, useEffect } from 'react';
import { todoReducer } from './todoReducer';
import type { TodoList } from 'src/types/index';
import type { TodoAction } from './todoReducer';

const STORAGE_KEY = "todoStorage";

export type TodoContextType = {
    state: TodoList;
    dispatch: React.Dispatch<TodoAction>;
};

const getInitialData = (): TodoList => {
    const storageData = localStorage.getItem(STORAGE_KEY);
    if (storageData) {
        try {
            return JSON.parse(storageData);
        } catch (error) {
            console.error("Error when retrieving storage data: ", error);
            return [];
        }
    }
    return [];
};

export const TodoContext = createContext<TodoContextType | null>(null);

export const TodoProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(todoReducer, getInitialData());

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    return (
        <TodoContext value={{ state, dispatch }}>
            { children }
        </TodoContext>
    );
};
