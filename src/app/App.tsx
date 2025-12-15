import { TodoHeader } from '../modules/header/TodoHeader.tsx';
import { TodoInput } from '../modules/todo-input/TodoInput.tsx';
import { TodoList } from '../modules/todo-list/TodoList.tsx';
import styles from './App.module.css';


function App() {
    return (
        <>
            <div className={styles["app-container"]}>
                <TodoHeader />
                <TodoInput />
                <TodoList />
            </div>
        </>
    );
}

export default App
