import { TodoProvider } from 'src/modules/common/context/todo/TodoContext.tsx';
import { TodoHeader } from 'src/modules/header/TodoHeader.tsx';
import { TodoInput } from 'src/modules/todo-input/TodoInput.tsx';
import { TodoList } from 'src/modules/todo-list/TodoList.tsx';
import styles from './App.module.css';


function App() {
    return (
        <TodoProvider>
            <div className={styles["app-container"]}>
                <TodoHeader />
                <TodoInput />
                <TodoList />
            </div>
        </TodoProvider>
    );
}

export default App
