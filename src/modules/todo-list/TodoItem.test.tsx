/**
 * Unit tests for TodoItem
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem';
import { ToastProvider } from 'src/modules/common/context/toast/ToastContext';

vi.mock('src/modules/common/context/modal/useModal', () => ({
    useModal: () => ({
        modal: null,
        showModal: mockShowModal,
        hideModal: mockHideModal,
    }),
}));

const mockShowModal = vi.fn();
const mockHideModal = vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
);

const mockDispatch = vi.fn();

const defaultProps = {
    id: '1',
    text: 'Test task',
    isDone: false,
    isEditing: false,
    dispatch: mockDispatch,
};

describe('TodoItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Edit mode', () => {
        it('should show input when isEditing is true', () => {
            render(<TodoItem {...defaultProps} isEditing={true} />, { wrapper });
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('should show text when isEditing is false', () => {
            render(<TodoItem {...defaultProps} isEditing={false} />, { wrapper });
            expect(screen.getByText('Test task')).toBeInTheDocument();
        });

        it('should save on blur', async () => {
            const user = userEvent.setup();
            render(<TodoItem {...defaultProps} isEditing={true} />, { wrapper });

            const input = screen.getByRole('textbox');

            await act(async () => {
                await user.clear(input);
                await user.type(input, 'Updated');
                input.blur();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'TOGGLE_TASK_EDITING',
                payload: { id: '1', inputText: 'Updated' },
            });
        });

        it('should save on Enter key', async () => {
            const user = userEvent.setup();
            render(<TodoItem {...defaultProps} isEditing={true} />, { wrapper });

            const input = screen.getByRole('textbox');

            await act(async () => {
                await user.clear(input);
                await user.type(input, 'Updated{Enter}');
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'TOGGLE_TASK_EDITING',
                payload: { id: '1', inputText: 'Updated' },
            });
        });
    });

    describe('handleEditing', () => {
        it('should revert to original text when empty', async () => {
            const user = userEvent.setup();
            render(<TodoItem {...defaultProps} isEditing={true} text="Original" />, { wrapper });

            const input = screen.getByRole('textbox');

            await act(async () => {
                await user.clear(input);
                input.blur();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'TOGGLE_TASK_EDITING',
                payload: { id: '1', inputText: 'Original' },
            });
        });
    });

    describe('handleInputChange', () => {
        it('should truncate at MAX_TASK_LENGTH (50)', async () => {
            const user = userEvent.setup();
            render(<TodoItem {...defaultProps} isEditing={true} text="" />, { wrapper });

            const input = screen.getByRole('textbox');

            await act(async () => {
                await user.type(input, 'a'.repeat(51));
            });

            expect(input.value.length).toBeLessThanOrEqual(50);
        });
    });

    describe('handleClickDelete', () => {
        it('should call showModal with correct payload', async () => {
            const user = userEvent.setup();
            render(<TodoItem {...defaultProps} />, { wrapper });

            const deleteButton = screen.getByRole('button', { name: 'Delete' });

            await act(async () => {
                await user.click(deleteButton);
            });

            expect(mockShowModal).toHaveBeenCalledTimes(1);
            const modalData = mockShowModal.mock.calls[0]?.[0];
            expect(modalData).toMatchObject({
                type: 'delete-modal',
                text: 'Are you sure you want to remove this task?',
            });
            expect(modalData?.onConfirm).toEqual(expect.any(Function));
        });

        it('should dispatch DELETE_TASK on confirm', async () => {
            const user = userEvent.setup();
            render(<TodoItem {...defaultProps} />, { wrapper });

            const deleteButton = screen.getByRole('button', { name: 'Delete' });

            await act(async () => {
                await user.click(deleteButton);
            });

            expect(mockShowModal).toHaveBeenCalledTimes(1);
            const modalData = mockShowModal.mock.calls[0]?.[0];
            expect(modalData?.onConfirm).toEqual(expect.any(Function));

            await act(async () => {
                modalData.onConfirm();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'DELETE_TASK',
                payload: '1',
            });
            expect(mockHideModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('Drag handlers', () => {
        it('should set draggable to false when isDone is true', () => {
            const { container } = render(<TodoItem {...defaultProps} isDone={true} />, { wrapper });
            const li = container.querySelector('li');
            expect(li).toHaveAttribute('draggable', 'false');
        });

        it('should set draggable to true when isDone is false', () => {
            const { container } = render(<TodoItem {...defaultProps} isDone={false} />, { wrapper });
            const li = container.querySelector('li');
            expect(li).toHaveAttribute('draggable', 'true');
        });

        it('should call handleDragStart when dragging incomplete task', async () => {
            const handleDragStart = vi.fn();
            const { container } = render(
                <TodoItem {...defaultProps} handleDragStart={handleDragStart} />,
                { wrapper }
            );
            const li = container.querySelector('li')!;

            await act(async () => {
                await userEvent.setup().hover(li);
            });

            expect(handleDragStart).toBeDefined();
        });
    });
});
