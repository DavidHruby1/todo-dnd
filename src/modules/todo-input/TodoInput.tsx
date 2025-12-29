import { useState } from 'react';
import { useTodo } from 'src/modules/common/context/todo/useTodo'
import styles from './TodoInput.module.css';

const MAX_TASK_LENGTH = 120;
const MAX_TASKS = 100;

export const TodoInput = () => {
    const [text, setText] = useState<string>("");
    const { state, dispatch } = useTodo();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.currentTarget.value.slice(0, MAX_TASK_LENGTH));
    }

    const handleAddTask = (e: React.MouseEvent) => {
        e.preventDefault();
        if (text === "") return;

        if (state.length === MAX_TASKS) return;

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