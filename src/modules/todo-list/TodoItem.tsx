import type { TodoAction } from 'src/modules/common/context/todo/todoReducer.ts';
import styles from './TodoItem.module.css';

type TodoItemProps = {
    id: string;
    text: string;
    isDone: boolean;
    dispatch: React.Dispatch<TodoAction>;
    handleEdit: (id: string) => void;
};

export const TodoItem = ({ id, text, isDone, dispatch, handleEdit }: TodoItemProps) => {
    return (
        <li className={`${ isDone ? styles['todo-item-done'] : styles['todo-item']}`}>
            <p>{text}</p>
            <div className={styles["todo-item-buttons"]}>
                <button 
                    className={styles["todo-item-button"]}
                    onClick={ () => handleEdit(id) } // handleEdit function will be in TodoList component
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
