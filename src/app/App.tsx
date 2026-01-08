import { TodoProvider } from 'src/modules/common/context/todo/TodoContext.tsx';
import { TodoHeader } from 'src/modules/header/TodoHeader.tsx';
import { TodoInput } from 'src/modules/todo-input/TodoInput.tsx';
import { TodoList } from 'src/modules/todo-list/TodoList.tsx';
import { ToastContainer } from 'src/modules/toast/ToastContainer';
import { ToastProvider } from 'src/modules/common/context/toast/ToastContext';
import { ModalProvider } from 'src/modules/common/context/modal/ModalContext';
import { Modal } from 'src/modules/modal/Modal';
import styles from './App.module.css';


function App() {
    return (
        <ModalProvider>
            <ToastProvider>
                <TodoProvider>
                    <div className={styles["app-container"]}>
                        <TodoHeader />
                        <TodoInput />
                        <TodoList />
                    </div>
                    <ToastContainer/>
                    <Modal />
                </TodoProvider>
            </ToastProvider>

        </ModalProvider>
    );
}

export default App;
