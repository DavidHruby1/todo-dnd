import { createContext, useReducer, useEffect } from 'react';
import { todoReducer } from './todoReducer';
import { useToast } from '../toast/useToast';
import type { TodoList, TodoData } from 'src/types/index';
import type { TodoAction } from './todoReducer';

const STORAGE_KEY = "todoStorage";

export type TodoContextType = {
    state: TodoList;
    dispatch: React.Dispatch<TodoAction>;
};

// Type guard function to validate TodoList structure
const isValidTodoList = (data: unknown): data is TodoList => {
    if (!Array.isArray(data)) return false;

    for (const item of data) {
        if (
            typeof item !== 'object' ||
            item === null ||
            typeof (item as TodoData).id !== 'string' ||
            typeof (item as TodoData).text !== 'string' ||
            typeof (item as TodoData).isDone !== 'boolean' ||
            typeof (item as TodoData).isEditing !== 'boolean' ||
            typeof (item as TodoData).order !== 'number'
        ) {
            return false;
        }
    }
    return true;
};

const getInitialData = (): TodoList => {
    const storageData = localStorage.getItem(STORAGE_KEY);
    if (storageData) {
        try {
            const parsedData = JSON.parse(storageData);
            return isValidTodoList(parsedData) ? parsedData : [];
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
    const { showToast } = useToast();

    useEffect(() => {
        // debounce function for safe writing into the localStorage
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (error) {
                showToast('error', `Error saving to localStorage: ${error}`);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [state]);

    // cross-tab sync
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent): void => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const newData = JSON.parse(e.newValue);
                    // Validate before dispatching - same as getInitialData
                    if (isValidTodoList(newData)) {
                        dispatch({ type: "SYNC_STORAGE", payload: newData });
                    } else {
                        showToast('error', 'Invalid todo data received from storage');
                    }
                } catch (error) {
                    showToast('error', `Error parsing storage data: ${error}`);
                }
            }
        }
        window.addEventListener('storage', handleStorageChange);
        return (() => {
            window.removeEventListener('storage', handleStorageChange);
        });
    }, []);

    return (
        <TodoContext value={{ state, dispatch }}>
            { children }
        </TodoContext>
    );
};
