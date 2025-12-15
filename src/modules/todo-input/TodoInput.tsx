import styles from './TodoInput.module.css';

export const TodoInput = () => {
    return (
        <form className={styles["input-container"]}>
            <input className={styles["task-input"]} type="text" />
            <button className={styles["add-task-button"]}>ADD</button>
        </form>
    );
};