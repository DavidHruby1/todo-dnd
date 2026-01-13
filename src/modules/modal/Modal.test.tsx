/**
 * Unit tests for Modal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Modal } from './Modal';
import { ModalProvider } from 'src/modules/common/context/modal/ModalContext';
import { useModal } from 'src/modules/common/context/modal/useModal';

// Wrapper with modal state
const wrapper = ({ children }: { children: React.ReactNode }) => <ModalProvider>{children}</ModalProvider>;

describe('Modal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should return null when no modal', () => {
            const { container } = render(<Modal />, { wrapper });
            expect(container.firstChild).toBeNull();
        });

        it('should render modal with custom wrapper to set modal state', () => {
            // Create a test component that shows modal
            const TestComponent = () => {
                const { showModal } = useModal();
                return (
                    <div>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Delete this task?',
                            onConfirm: vi.fn()
                        })}>Show Modal</button>
                        <Modal />
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });

            // Click to show modal
            fireEvent.click(screen.getByText('Show Modal'));

            expect(screen.getByText('Delete this task?')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        });

        it('should render overlay and modal text', () => {
            const TestComponent = () => {
                const { showModal } = useModal();
                return (
                    <div>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Test modal text',
                            onConfirm: vi.fn()
                        })}>Show</button>
                        <Modal />
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });
            fireEvent.click(screen.getByText('Show'));

            expect(screen.getByText('Test modal text')).toBeInTheDocument();
        });
    });

    describe('Button interactions', () => {
        it('should hide modal when Cancel button is clicked', () => {
            const TestComponent = () => {
                const { showModal, modal } = useModal();
                return (
                    <div>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Delete this task?',
                            onConfirm: vi.fn()
                        })}>Show Modal</button>
                        <Modal />
                        {modal && <div data-testid="modal-visible">Modal is visible</div>}
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });
            fireEvent.click(screen.getByText('Show Modal'));
            expect(screen.getByTestId('modal-visible')).toBeInTheDocument();

            const cancelButton = screen.getByRole('button', { name: 'Cancel' });
            fireEvent.click(cancelButton);

            expect(screen.queryByTestId('modal-visible')).not.toBeInTheDocument();
        });

        it('should call onConfirm when Delete button is clicked', () => {
            const mockOnConfirm = vi.fn();

            const TestComponent = () => {
                const { showModal } = useModal();
                return (
                    <div>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Delete this task?',
                            onConfirm: mockOnConfirm
                        })}>Show Modal</button>
                        <Modal />
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });
            fireEvent.click(screen.getByText('Show Modal'));

            const deleteButton = screen.getByRole('button', { name: 'Delete' });
            fireEvent.click(deleteButton);

            expect(mockOnConfirm).toHaveBeenCalled();
        });

        it('should hide modal when overlay is clicked', () => {
            const TestComponent = () => {
                const { showModal, modal } = useModal();
                return (
                    <div>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Delete this task?',
                            onConfirm: vi.fn()
                        })}>Show Modal</button>
                        <Modal />
                        {modal && <div data-testid="modal-visible">Modal is visible</div>}
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });
            fireEvent.click(screen.getByText('Show Modal'));
            expect(screen.getByTestId('modal-visible')).toBeInTheDocument();

            // Click the overlay (the element containing the modal text)
            const overlay = screen.getByText('Delete this task?').closest('div')?.parentElement;
            if (overlay) {
                fireEvent.click(overlay);
                expect(screen.queryByTestId('modal-visible')).not.toBeInTheDocument();
            }
        });
    });

    describe('Keyboard interactions', () => {
        it('should hide modal on Escape key and blur activeElement', () => {
            const TestComponent = () => {
                const { showModal, modal } = useModal();
                return (
                    <div>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Delete this task?',
                            onConfirm: vi.fn()
                        })}>Show Modal</button>
                        <Modal />
                        {modal && <div data-testid="modal-visible">Modal is visible</div>}
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });
            const showButton = screen.getByText('Show Modal');

            // Focus the button before clicking to make it the activeElement
            showButton.focus();
            fireEvent.click(showButton);
            expect(screen.getByTestId('modal-visible')).toBeInTheDocument();

            // Verify the button is still the active element
            expect(document.activeElement).toBe(showButton);

            act(() => {
                fireEvent.keyDown(window, { key: 'Escape' });
            });

            // After Escape, the button should be blurred
            expect(document.activeElement).not.toBe(showButton);
            expect(document.activeElement).toBe(document.body);
            expect(screen.queryByTestId('modal-visible')).not.toBeInTheDocument();
        });

        it('should call onConfirm on Enter key', () => {
            const mockOnConfirm = vi.fn();

            const TestComponent = () => {
                const { showModal } = useModal();
                return (
                    <div>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Delete this task?',
                            onConfirm: mockOnConfirm
                        })}>Show Modal</button>
                        <Modal />
                    </div>
                );
            };

            render(<TestComponent />, { wrapper });
            fireEvent.click(screen.getByText('Show Modal'));

            act(() => {
                fireEvent.keyDown(window, { key: 'Enter' });
            });

            expect(mockOnConfirm).toHaveBeenCalled();
        });
    });
});
