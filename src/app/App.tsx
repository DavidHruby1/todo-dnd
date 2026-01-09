import { useState, useEffect } from 'react';
import { TodoProvider } from 'src/modules/common/context/todo/TodoContext.tsx';
import { TodoHeader } from 'src/modules/header/TodoHeader.tsx';
import { TodoInput } from 'src/modules/todo-input/TodoInput.tsx';
import { TodoList } from 'src/modules/todo-list/TodoList.tsx';
import { ToastContainer } from 'src/modules/toast/ToastContainer';
import { ToastProvider } from 'src/modules/common/context/toast/ToastContext';
import { ModalProvider } from 'src/modules/common/context/modal/ModalContext';
import { Modal } from 'src/modules/modal/Modal';
import type { ThemeType } from 'src/types/index';
import styles from './App.module.css';
import { Moon, Sun } from 'lucide-react';

const THEME_STORAGE_KEY = "themeStorage";

const getInitialTheme = (): ThemeType => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return 'light';
    }

    try {
        const storageData = localStorage.getItem(THEME_STORAGE_KEY);
        if (storageData === 'light' || storageData === 'dark') {
            return storageData;
        }
    } catch (error) {
        console.error("Error when retrieving theme: ", error);
    }
    return 'light'; // default fallback
};

function App() {
    const [theme, setTheme] = useState<ThemeType>(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);

        // Debounced write to localStorage
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, theme);
            } catch (error) {
                console.error("Error saving theme to localStorage: ", error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [theme]);

    // Cross-tab synchronization
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent): void => {
            if (e.key === THEME_STORAGE_KEY && e.newValue) {
                if (e.newValue === 'light' || e.newValue === 'dark') {
                    setTheme(e.newValue);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const themeChange = (): void => {
        if (theme === 'light') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    };

    return (
        <ModalProvider>
            <ToastProvider>
                <TodoProvider>
                    <button
                        className={`${styles["theme-button"]} ${theme === 'dark' ? styles["theme-button-dark"] : ""}`}
                        onClick={ themeChange }
                    >
                        { theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
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
