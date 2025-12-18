import { useContext } from 'react';
import { TodoContext } from './TodoContext';
import type { TodoContextType } from './TodoContext'; 

export const useTodo = (): TodoContextType => {
    const context = useContext(TodoContext);

    if (!context) { // This will show Toast if error, in the future
        throw new Error("useTodo must be used within TodoProvider");
    }

    return context;
};