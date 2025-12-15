import styles from "./TodoHeader.module.css";

export const TodoHeader = () => {
    return (
        <div className={styles["header-container"]}>
            <h1 className={styles["main-heading"]}>Todo List</h1>
            <h3 className={styles["sub-heading"]}>Manage your tasks efficiently</h3>
        </div>
    );
};
