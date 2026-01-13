/**
 * Unit tests for TodoInput
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoInput } from './TodoInput';
import { TodoProvider } from 'src/modules/common/context/todo/TodoContext';
import { ToastContext } from 'src/modules/common/context/toast/ToastContext';
import type { ToastContextType } from 'src/modules/common/context/toast/ToastContext';
import type { ToastList } from 'src/types/index';

// Mock toast context to track showToast calls
const mockShowToast = vi.fn();
const mockHideToast = vi.fn();

const mockToastContext: ToastContextType = {
    state: [] as ToastList,
    showToast: mockShowToast,
    hideToast: mockHideToast
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastContext.Provider value={mockToastContext}>
        <TodoProvider>{children}</TodoProvider>
    </ToastContext.Provider>
);

describe('TodoInput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockShowToast.mockClear();
        mockHideToast.mockClear();
    });

    describe('handleInputChange', () => {
        it('should truncate input at MAX_TASK_LENGTH (50)', async () => {
            const user = userEvent.setup();
            render(<TodoInput />, { wrapper });

            const input = screen.getByRole('textbox');

            await act(async () => {
                await user.type(input, 'a'.repeat(51));
            });

            // The implementation prevents going past 50, so we verify truncation
            expect(input.value.length).toBeLessThanOrEqual(50);
        });

        it('should show warning toast when reaching limit', async () => {
            const user = userEvent.setup();
            render(<TodoInput />, { wrapper });

            const input = screen.getByRole('textbox');

            // Type 50 characters (hitting the limit)
            await act(async () => {
                await user.clear(input);
                // Type each character individually to trigger the change handler
                for (let i = 0; i < 50; i++) {
                    await user.keyboard('a');
                }
            });

            // Warning is shown when trying to type the 51st character
            await act(async () => {
                await user.keyboard('b');
            });

            expect(mockShowToast).toHaveBeenCalledWith('warning', 'Task length can not exceed 50 characters!');
        });
    });

    describe('handleAddTask', () => {
        it('should show warning toast for empty input', async () => {
            const user = userEvent.setup();
            render(<TodoInput />, { wrapper });

            const button = screen.getByRole('button', { name: 'ADD' });

            await act(async () => {
                await user.click(button);
            });

            expect(mockShowToast).toHaveBeenCalledWith('warning', 'You can not add an empty task!');
            expect(screen.getByRole('textbox')).toHaveValue('');
        });

        it('should show error toast at MAX_TASKS (20) limit', async () => {
            const user = userEvent.setup();
            render(<TodoInput />, { wrapper });

            const input = screen.getByRole('textbox');
            const button = screen.getByRole('button', { name: 'ADD' });

            // Add 20 tasks (the limit)
            for (let i = 0; i < 20; i++) {
                await act(async () => {
                    await user.clear(input);
                    await user.type(input, `Task ${i}`);
                    await user.click(button);
                });
            }

            // Try to add the 21st task
            await act(async () => {
                await user.clear(input);
                await user.type(input, 'Task 21');
                await user.click(button);
            });

            expect(mockShowToast).toHaveBeenCalledWith('error', 'You can not have more than 20!');
        });

        it('should dispatch ADD_TASK and clear input', async () => {
            const user = userEvent.setup();
            render(<TodoInput />, { wrapper });

            const input = screen.getByRole('textbox');
            const button = screen.getByRole('button', { name: 'ADD' });

            await act(async () => {
                await user.type(input, 'New task');
                await user.click(button);
            });

            expect(input).toHaveValue('');
            // Task should be added to the state (we can verify by checking no error toast)
            expect(mockShowToast).not.toHaveBeenCalledWith('warning', 'You can not add an empty task!');
        });
    });
});
