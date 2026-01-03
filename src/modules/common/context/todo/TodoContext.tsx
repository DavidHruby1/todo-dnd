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
            const parsedData = JSON.parse(storageData);
            if (!Array.isArray(parsedData)) return [];
            for (const item of parsedData) {
                if (
                    typeof item.id !== 'string' ||
                    typeof item.text !== 'string' ||
                    typeof item.isDone !== 'boolean' ||
                    typeof item.isEditing !== 'boolean' ||
                    typeof item.order !== 'number'
                ) return [];
            }
            return parsedData;
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
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (error) {
                console.error("Error saving to localStorage: ", error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [state]);

    return (
        <TodoContext value={{ state, dispatch }}>
            { children }
        </TodoContext>
    );
};
