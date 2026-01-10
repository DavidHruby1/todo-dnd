import { createContext, useReducer, useEffect, useState } from 'react';
import { todoReducer } from './todoReducer';
import { useToast } from '../toast/useToast';
import type { TodoList } from 'src/types/index';
import type { TodoAction } from './todoReducer';

const STORAGE_KEY = "todoStorage";

export type TodoContextType = {
    state: TodoList;
    dispatch: React.Dispatch<TodoAction>;
    setIsDragging: (flag: boolean) => void;
};

const isValidTodoList = (data: unknown): data is TodoList => {
    if (!Array.isArray(data)) return false;

    for (const item of data) {
        if (
            typeof item !== 'object' ||
            item === null ||
            !('id' in item) || typeof item.id !== 'string' ||
            !('text' in item) || typeof item.text !== 'string' ||
            !('isDone' in item) || typeof item.isDone !== 'boolean' ||
            !('isEditing' in item) || typeof item.isEditing !== 'boolean' ||
            !('order' in item) || typeof item.order !== 'number'
        ) return false;
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
    // isDragging is a global flag that stops saving to localStorage while dragging a task
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const { showToast } = useToast();

    useEffect(() => {
        // debounce function for safe writing into the localStorage
        const timer = setTimeout(() => {
            try {
                if (!isDragging) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                }
            } catch (error) {
                showToast('error', `Error saving to localStorage: ${error}`);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [state, isDragging]);

    // cross-tab sync
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent): void => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const newData = JSON.parse(e.newValue);
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
        <TodoContext value={{ state, dispatch, setIsDragging }}>
            { children }
        </TodoContext>
    );
};
