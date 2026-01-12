import { useState } from 'react';
import { useTodo } from 'src/modules/common/context/todo/useTodo'
import { useToast } from 'src/modules/common/context/toast/useToast';
import styles from './TodoInput.module.css';

const MAX_TASK_LENGTH = 50;
const MAX_TASKS = 20;

export const TodoInput = () => {
    const [text, setText] = useState<string>("");
    const { state, dispatch } = useTodo();
    const { showToast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.currentTarget.value;
        if (inputValue.length >= MAX_TASK_LENGTH && text.length < MAX_TASK_LENGTH) {
            showToast('warning', `Task length can not exceed ${MAX_TASK_LENGTH} characters!`);
            return;
        } 
        setText(inputValue.slice(0, MAX_TASK_LENGTH));
    }

    const handleAddTask = (e: React.MouseEvent) => {
        e.preventDefault();
        if (text === "") {
            showToast('warning', 'You can not add an empty task!');
            return;
        }

        if (state.length === MAX_TASKS) {
            showToast('error', `You can not have more than ${MAX_TASKS}!`);
            return;
        }
        
        dispatch({ type: "ADD_TASK", payload: text});
        setText("");
    }

    return (
        <form className={styles["input-container"]}>
            <input
                type="text"
                value={text}
                className={styles["task-input"]} 
                onChange={(e) => handleInputChange(e)}
            />
            <button
                type="submit" 
                className={styles["add-task-button"]}
                onClick={ (e) => handleAddTask(e) }
            >
                ADD
            </button>
        </form>
    );
};