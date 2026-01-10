import { useState } from 'react';
import { useToast } from 'src/modules/common/context/toast/useToast';
import { useModal } from 'src/modules/common/context/modal/useModal';
import type { TodoAction } from 'src/modules/common/context/todo/todoReducer.ts';
import styles from './TodoItem.module.css';

const MAX_TASK_LENGTH = 120;

type TodoItemProps = {
    id: string;
    text: string;
    isDone: boolean;
    isEditing: boolean;
    dispatch: React.Dispatch<TodoAction>;
    handleDragStart?: (id: string) => void;
    handleDragOver?: (e: React.DragEvent, id: string) => void;
    handleDragEnd?: (e: React.DragEvent) => void;
};

export const TodoItem = ({ 
    id, 
    text, 
    isDone, 
    isEditing, 
    dispatch,
    handleDragStart,
    handleDragOver,
    handleDragEnd
}: TodoItemProps) => {
    const [inputText, setInputText] = useState<string>(text);
    const { showToast } = useToast();
    const { showModal, hideModal } = useModal();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const inputValue = e.currentTarget.value;
        if (inputValue.length >= MAX_TASK_LENGTH && text.length < MAX_TASK_LENGTH) {
            showToast('warning', `Task length can not exceed ${MAX_TASK_LENGTH} characters!`);
            return;
        } 
        setInputText(inputValue.slice(0, MAX_TASK_LENGTH));
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

    const handleClickDelete = () => {
        showModal({
            type: "delete-modal",
            text: "Are you sure you want to remove this task?",
            onConfirm: () => {
                dispatch({ type: "DELETE_TASK", payload: id })
                hideModal();
            }
        });
    };

    return (
        <li
            id={id}
            className={ isDone ? styles['todo-item-done'] : styles['todo-item'] }
            draggable={ isDone ? false : true }
            onDragStart={ () => { if (handleDragStart) handleDragStart(id) }}
            onDragOver={ (e) => { if (handleDragOver) handleDragOver(e, id) }}
            onDragEnd={ (e) => { if (handleDragEnd) handleDragEnd(e) }}
        >
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
                    onClick={ handleClickDelete }    
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
