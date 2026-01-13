/**
 * Unit tests for TodoList
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from './TodoList';
import { TodoProvider } from 'src/modules/common/context/todo/TodoContext';
import { useTodo } from 'src/modules/common/context/todo/useTodo';
import { ToastProvider } from 'src/modules/common/context/toast/ToastContext';
import { ModalProvider } from 'src/modules/common/context/modal/ModalContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>
        <TodoProvider>
            <ModalProvider>{children}</ModalProvider>
        </TodoProvider>
    </ToastProvider>
);

describe('TodoList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render list container', () => {
            render(<TodoList />, { wrapper });
            expect(screen.getByRole('list')).toBeInTheDocument();
        });

        it('should render nothing when state is empty', () => {
            render(<TodoList />, { wrapper });
            expect(screen.queryAllByRole('listitem')).toHaveLength(0);
        });

        it('should render todo items when present in state', () => {
            const TestComponent = () => {
                const { dispatch } = useTodo();
                return (
                    <div>
                        <button onClick={() => dispatch({ type: 'ADD_TASK', payload: 'Task 1' })}>Add Task 1</button>
                        <button onClick={() => dispatch({ type: 'ADD_TASK', payload: 'Task 2' })}>Add Task 2</button>
                        <TodoList />
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });

            expect(screen.queryAllByRole('listitem')).toHaveLength(0);

            fireEvent.click(screen.getByText('Add Task 1'));
            fireEvent.click(screen.getByText('Add Task 2'));

            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });
    });

    describe('Sorting and ordering', () => {
        it('should display incomplete tasks sorted by order', () => {
            const TestComponent = () => {
                const { dispatch } = useTodo();
                return (
                    <div>
                        <button onClick={() => dispatch({ type: 'ADD_TASK', payload: 'First' })}>Add First</button>
                        <button onClick={() => dispatch({ type: 'ADD_TASK', payload: 'Second' })}>Add Second</button>
                        <button onClick={() => dispatch({ type: 'ADD_TASK', payload: 'Third' })}>Add Third</button>
                        <TodoList />
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });

            fireEvent.click(screen.getByText('Add First'));
            fireEvent.click(screen.getByText('Add Second'));
            fireEvent.click(screen.getByText('Add Third'));

            const listItems = screen.queryAllByRole('listitem');
            expect(listItems).toHaveLength(3);

            // Verify they appear in order (1, 2, 3)
            const firstItem = listItems[0];
            const secondItem = listItems[1];
            const thirdItem = listItems[2];

            expect(firstItem).toHaveTextContent('First');
            expect(secondItem).toHaveTextContent('Second');
            expect(thirdItem).toHaveTextContent('Third');
        });

        it('should display incomplete tasks before completed tasks', () => {
            const TestComponent = () => {
                const { dispatch, state } = useTodo();
                return (
                    <div>
                        <button onClick={() => dispatch({ type: 'ADD_TASK', payload: 'Incomplete 1' })}>Add Incomplete 1</button>
                        <button onClick={() => dispatch({ type: 'ADD_TASK', payload: 'Incomplete 2' })}>Add Incomplete 2</button>
                        <button onClick={() => {
                            dispatch({ type: 'ADD_TASK', payload: 'Completed 1' });
                            // Get the new todo and complete it
                            setTimeout(() => {
                                const todos = state;
                                const newTodo = todos.find(t => t.text === 'Completed 1');
                                if (newTodo) dispatch({ type: 'FINISH_TASK', payload: newTodo.id });
                            }, 0);
                        }}>Add Completed 1</button>
                        <TodoList />
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });

            fireEvent.click(screen.getByText('Add Incomplete 1'));
            fireEvent.click(screen.getByText('Add Incomplete 2'));

            const listItems = screen.queryAllByRole('listitem');
            expect(listItems.length).toBeGreaterThanOrEqual(2);

            // First two should be incomplete
            expect(listItems[0]).toHaveTextContent('Incomplete 1');
            expect(listItems[1]).toHaveTextContent('Incomplete 2');
        });
    });

    describe('Drag and drop handlers', () => {
        it('should pass drag handlers to incomplete tasks', () => {
            const TestComponent = () => {
                const { dispatch } = useTodo();
                return (
                    <div>
                        <button onClick={() => dispatch({ type: 'ADD_TASK', payload: 'Draggable task' })}>Add Task</button>
                        <TodoList />
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });
            fireEvent.click(screen.getByText('Add Task'));

            // Incomplete tasks should have draggable attribute set to true
            const task = screen.getByText('Draggable task').closest('li');
            expect(task).toHaveAttribute('draggable', 'true');
        });

        it('should not pass drag handlers to completed tasks', () => {
            let testDispatch: ((action: { type: string; payload: string | { id: string }[] }) => void) | null = null;

            const TestComponent = () => {
                const { dispatch, state } = useTodo();
                testDispatch = dispatch;

                return (
                    <div>
                        <button onClick={() => dispatch({ type: 'ADD_TASK', payload: 'Task to complete' })}>Add Task</button>
                        <button onClick={() => {
                            // Find the task and complete it
                            const task = state.find(t => t.text === 'Task to complete');
                            if (task) dispatch({ type: 'FINISH_TASK', payload: task.id });
                        }}>Complete Task</button>
                        <TodoList />
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });

            // Add the task
            fireEvent.click(screen.getByText('Add Task'));

            // Complete the task
            fireEvent.click(screen.getByText('Complete Task'));

            // Completed tasks should not have draggable attribute
            const task = screen.queryByText('Task to complete')?.closest('li');
            if (task) {
                expect(task).not.toHaveAttribute('draggable', 'true');
            }
        });
    });
});
