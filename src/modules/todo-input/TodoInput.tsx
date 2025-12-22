import { useState } from 'react';
import { useTodo } from 'src/modules/common/context/todo/useTodo'
import styles from './TodoInput.module.css';

export const TodoInput = () => {
    const [text, setText] = useState<string>("");
    const { dispatch } = useTodo();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.currentTarget.value);
    }

    const handleAddTask = (e: React.MouseEvent) => {
        if (text === "") return;
        e.preventDefault();
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