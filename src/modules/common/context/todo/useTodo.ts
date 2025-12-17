import { useContext } from 'react';
import { TodoContext } from './TodoContext';
import type { TodoContextType } from './TodoContext'; 

export const useTodo = (): TodoContextType => {
    const context = useContext(TodoContext);

    if (!context) {
        throw new Error("useTodo must be used within TodoProvider");
    }

    return context;
};