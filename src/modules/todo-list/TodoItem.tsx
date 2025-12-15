import styles from './TodoItem.module.css';

export const TodoItem = () => {
    return (
        <li className={styles["todo-item"]}>
            <p>Task text here</p>
            <div className={styles["todo-item-buttons"]}>
                <button className={styles["todo-item-button"]}>Edit</button>
                <button className={styles["todo-item-button"]}>Delete</button>
                <button className={styles["todo-item-button"]}>Done</button>
            </div>
        </li>
    );
};