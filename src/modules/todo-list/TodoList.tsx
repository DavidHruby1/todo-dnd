import { useTodo } from 'src/modules/common/context/todo/useTodo'
import { TodoItem } from './TodoItem';
import styles from './TodoList.module.css';

export const TodoList = () => {
    const { state, dispatch } = useTodo();

    return (
        <div className={styles["todo-list-container"]}>
            <ul className={styles["todo-list"]}>
                {[...state]
                    .sort((a, b) => a.order - b.order)
                    .map((task) => {
                        if (!task.isDone) {
                            return (
                                <TodoItem 
                                    key={task.id}
                                    id={task.id}
                                    text={task.text}
                                    isDone={task.isDone}
                                    isEditing={task.isEditing}
                                    dispatch={dispatch}
                                />
                            );
                        }
                    })
                }
                {state.map((task) => {
                    if (task.isDone) {
                        return (
                            <TodoItem
                                key={task.id}
                                id={task.id}
                                text={task.text}
                                isDone={task.isDone}
                                isEditing={task.isEditing}
                                dispatch={dispatch}
                            />
                        );
                    }
                })}
            </ul>
        </div>
    );
};
