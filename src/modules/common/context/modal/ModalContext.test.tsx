/**
 * Unit tests for ModalContext
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ModalProvider, ModalContext } from './ModalContext';
import { useModal } from './useModal';
import type { ModalData } from 'src/types/index';

describe('ModalContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ModalProvider', () => {
        it('should render children correctly', () => {
            const TestChild = () => <div>Test Child</div>;

            render(
                <ModalProvider>
                    <TestChild />
                </ModalProvider>
            );

            expect(screen.getByText('Test Child')).toBeInTheDocument();
        });

        it('should provide context with initial null modal', () => {
            const TestComponent = () => {
                const { modal } = useModal();
                return <div>Modal is: {modal === null ? 'null' : 'set'}</div>;
            };

            render(
                <ModalProvider>
                    <TestComponent />
                </ModalProvider>
            );

            expect(screen.getByText('Modal is: null')).toBeInTheDocument();
        });

        it('should update modal state when showModal is called', () => {
            const TestComponent = () => {
                const { modal, showModal } = useModal();
                return (
                    <div>
                        <span>Modal text: {modal?.text || 'none'}</span>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Delete this task?',
                            onConfirm: vi.fn()
                        })}>Show Modal</button>
                    </div>
                );
            };

            render(
                <ModalProvider>
                    <TestComponent />
                </ModalProvider>
            );

            expect(screen.getByText('Modal text: none')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Show Modal'));

            expect(screen.getByText('Modal text: Delete this task?')).toBeInTheDocument();
        });

        it('should set modal to null when hideModal is called', () => {
            const TestComponent = () => {
                const { modal, showModal, hideModal } = useModal();
                return (
                    <div>
                        <span>Modal text: {modal?.text || 'none'}</span>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Delete this task?',
                            onConfirm: vi.fn()
                        })}>Show Modal</button>
                        <button onClick={hideModal}>Hide Modal</button>
                    </div>
                );
            };

            render(
                <ModalProvider>
                    <TestComponent />
                </ModalProvider>
            );

            // Show modal
            fireEvent.click(screen.getByText('Show Modal'));
            expect(screen.getByText('Modal text: Delete this task?')).toBeInTheDocument();

            // Hide modal
            fireEvent.click(screen.getByText('Hide Modal'));
            expect(screen.getByText('Modal text: none')).toBeInTheDocument();
        });

        it('should handle multiple showModal calls', () => {
            const TestComponent = () => {
                const { modal, showModal } = useModal();
                return (
                    <div>
                        <span>Modal text: {modal?.text || 'none'}</span>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'First modal?',
                            onConfirm: vi.fn()
                        })}>Show First</button>
                        <button onClick={() => showModal({
                            type: 'confirm',
                            text: 'Second modal?',
                            onConfirm: vi.fn()
                        })}>Show Second</button>
                    </div>
                );
            };

            render(
                <ModalProvider>
                    <TestComponent />
                </ModalProvider>
            );

            fireEvent.click(screen.getByText('Show First'));
            expect(screen.getByText('Modal text: First modal?')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Show Second'));
            expect(screen.getByText('Modal text: Second modal?')).toBeInTheDocument();
        });
    });

    describe('useModal hook', () => {
        it('should throw error when used outside ModalProvider', () => {
            // Suppress console.error for this test
            const consoleError = console.error;
            console.error = vi.fn();

            const TestComponent = () => {
                try {
                    useModal();
                    return <div>No error</div>;
                } catch (error) {
                    return <div>Error: {(error as Error).message}</div>;
                }
            };

            const { getByText } = render(<TestComponent />);

            expect(getByText(/^Error:/).textContent).toContain('useModal must be used within a ModalProvider');

            console.error = consoleError;
        });

        it('should provide same context value to all consumers', () => {
            const TestComponent = () => {
                const { showModal: showModal1, modal: modal1 } = useModal();
                const { showModal: showModal2, modal: modal2 } = useModal();

                return (
                    <div>
                        <span>Modal 1: {modal1?.text || 'none'}</span>
                        <span>Modal 2: {modal2?.text || 'none'}</span>
                        <button onClick={() => showModal1({
                            type: 'confirm',
                            text: 'Test modal?',
                            onConfirm: vi.fn()
                        })}>Show Modal</button>
                    </div>
                );
            };

            render(
                <ModalProvider>
                    <TestComponent />
                </ModalProvider>
            );

            fireEvent.click(screen.getByText('Show Modal'));

            expect(screen.getByText('Modal 1: Test modal?')).toBeInTheDocument();
            expect(screen.getByText('Modal 2: Test modal?')).toBeInTheDocument();
        });
    });

    describe('Integration', () => {
        it('should maintain context across re-renders', () => {
            let setShowModal: ((data: ModalData) => void) | null = null;

            const TestComponent = () => {
                const { modal, showModal } = useModal();
                setShowModal = showModal;

                return (
                    <div>
                        <span>Modal text: {modal?.text || 'none'}</span>
                    </div>
                );
            };

            const { rerender } = render(
                <ModalProvider>
                    <TestComponent />
                </ModalProvider>
            );

            expect(screen.getByText('Modal text: none')).toBeInTheDocument();

            act(() => {
                setShowModal?.({
                    type: 'confirm',
                    text: 'Persistent modal?',
                    onConfirm: vi.fn()
                });
            });

            expect(screen.getByText('Modal text: Persistent modal?')).toBeInTheDocument();

            // Trigger re-render
            rerender(
                <ModalProvider>
                    <TestComponent />
                </ModalProvider>
            );

            // Modal state should persist
            expect(screen.getByText('Modal text: Persistent modal?')).toBeInTheDocument();
        });
    });
});
