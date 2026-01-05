import { TodoProvider } from 'src/modules/common/context/todo/TodoContext.tsx';
import { TodoHeader } from 'src/modules/header/TodoHeader.tsx';
import { TodoInput } from 'src/modules/todo-input/TodoInput.tsx';
import { TodoList } from 'src/modules/todo-list/TodoList.tsx';
import styles from './App.module.css';
import { ToastProvider } from 'src/modules/common/context/toast/ToastContext';


function App() {
    return (
        <TodoProvider>
            <ToastProvider>
                <div className={styles["app-container"]}>
                    <TodoHeader />
                    <TodoInput />
                    <TodoList />
                </div>
            </ToastProvider>
        </TodoProvider>
    );
}

export default App
