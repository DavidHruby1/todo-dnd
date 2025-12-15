import styles from './TodoList.module.css';
import { TodoItem } from './TodoItem';

export const TodoList = () => {
    return (
        <div className={styles["todo-list-container"]}>
            <ul className={styles["todo-list"]}>
                <TodoItem />
                <TodoItem />
                <TodoItem />
            </ul>
        </div>
    );
};