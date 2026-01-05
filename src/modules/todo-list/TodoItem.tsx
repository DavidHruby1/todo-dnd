import { useState } from 'react';
import type { TodoAction } from 'src/modules/common/context/todo/todoReducer.ts';
import styles from './TodoItem.module.css';

const MAX_TASK_LENGTH = 120;

type TodoItemProps = {
    id: string;
    text: string;
    isDone: boolean;
    isEditing: boolean;
    dispatch: React.Dispatch<TodoAction>;
};

export const TodoItem = ({ 
    id, 
    text, 
    isDone, 
    isEditing, 
    dispatch 
}: TodoItemProps) => {
    const [inputText, setInputText] = useState<string>(text);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.currentTarget.value.slice(0, MAX_TASK_LENGTH));
    }

    const handleEditing = (id: string, inputText: string): void => {
        if (inputText === "") {
            setInputText(text); // text prop still has the old value until next render
            dispatch({ type: 'TOGGLE_TASK_EDITING', payload: {id, inputText: text} });
            return;
        }
        dispatch({ type: 'TOGGLE_TASK_EDITING', payload: {id, inputText} });
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            handleEditing(id, inputText);
        }
    }

    return (
        <li className={`${ isDone ? styles['todo-item-done'] : styles['todo-item']}`}>
            { isEditing ? (
                <input
                    autoFocus
                    type="text"
                    value={inputText}
                    onChange={ (e) => handleInputChange(e) }
                    onBlur={ () => handleEditing(id, inputText) }
                    onKeyDown={ (e) => handleKeyDown(e) }
                />
            ) : (
                <p>{inputText}</p>
            )}
            <div className={styles["todo-item-buttons"]}>
                <button 
                    className={styles["todo-item-button"]}
                    onMouseDown={ (e) => e.preventDefault() }
                    onClick={ () => handleEditing(id, inputText) }
                >
                    Edit
                </button>
                    <button 
                    className={styles["todo-item-button"]}
                    onClick={ ()=> dispatch({type: "DELETE_TASK", payload: id}) }    
                >
                    Delete
                </button>
                <button 
                    className={styles["todo-item-button"]}
                    onClick={ () => dispatch({type: "FINISH_TASK", payload: id}) }
                >
                    Done
                </button>
            </div>
        </li>
    );
};
