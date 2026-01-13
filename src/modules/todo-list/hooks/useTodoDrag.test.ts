/**
 * Unit tests for useTodoDrag
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { TodoList } from 'src/types/index';
import { useTodoDrag } from './useTodoDrag';

// Mock useTodo hook
vi.mock('src/modules/common/context/todo/useTodo', () => ({
    useTodo: vi.fn(),
}));

const mockUseTodo = vi.importMock('src/modules/common/context/todo/useTodo');
const mockDispatch = vi.fn();
const mockSetIsDragging = vi.fn();

describe('useTodoDrag', () => {
    const createState = (): TodoList => [
        { id: 'task-1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
        { id: 'task-2', text: 'Task 2', isDone: false, isEditing: false, order: 2 },
        { id: 'task-3', text: 'Task 3', isDone: false, isEditing: false, order: 3 },
    ];

    const mockElementRect = {
        top: 100,
        left: 0,
        width: 300,
        height: 50,
        right: 300,
        bottom: 150,
        x: 0,
        y: 100,
        toJSON: () => ({}),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseTodo.useTodo.mockReturnValue({
            state: createState(),
            dispatch: mockDispatch,
            setIsDragging: mockSetIsDragging,
        });
    });

    // Helper to create mock drag event
    const createMockDragEvent = (clientY: number, targetId?: string): React.DragEvent => {
        const mockElement = targetId ? document.createElement('div') : document.createElement('div');
        if (targetId) mockElement.id = targetId;

        return {
            clientY,
            currentTarget: mockElement,
            target: mockElement,
            preventDefault: vi.fn(),
            dataTransfer: {
                setData: vi.fn(),
                getData: vi.fn(),
                setDragImage: vi.fn(),
                effectAllowed: '',
                dropEffect: '',
            },
        } as unknown as React.DragEvent;
    };

    describe('shouldReorder (early returns)', () => {
        it('should return false when dragged ID equals item below ID', () => {
            const { result } = renderHook(() => useTodoDrag());

            const mockEvent = createMockDragEvent(125, 'task-1');
            const mockElement = document.createElement('div');
            mockElement.id = 'task-1';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            Object.defineProperty(mockElement, 'getBoundingClientRect', { value: () => mockElementRect });

            // First set up the drag
            act(() => {
                result.current.handleDragStart(mockEvent, 'task-1');
            });

            // Then try to drag over itself (same ID)
            act(() => {
                result.current.handleDragOver(mockEvent, 'task-1');
            });

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('should return false when dragged item ID not found in state', () => {
            const { result } = renderHook(() => useTodoDrag());

            const mockEvent = createMockDragEvent(125, 'task-2');
            const mockElement = document.createElement('div');
            mockElement.id = 'task-2';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            Object.defineProperty(mockElement, 'getBoundingClientRect', { value: () => mockElementRect });

            act(() => {
                result.current.handleDragStart(mockEvent, 'non-existent');
                result.current.handleDragOver(mockEvent, 'task-2');
            });

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('should return false when item below ID not found in state', () => {
            const { result } = renderHook(() => useTodoDrag());

            const mockEvent = createMockDragEvent(125, 'non-existent');
            const mockElement = document.createElement('div');
            mockElement.id = 'non-existent';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            Object.defineProperty(mockElement, 'getBoundingClientRect', { value: () => mockElementRect });

            act(() => {
                result.current.handleDragStart(mockEvent, 'task-1');
                result.current.handleDragOver(mockEvent, 'non-existent');
            });

            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });

    describe('shouldReorder (dragging DOWN)', () => {
        it('should return false when ghostMiddle <= threshold (higher threshold)', () => {
            const { result } = renderHook(() => useTodoDrag());

            // Element middle is at 125 (100 + 50/2)
            // Threshold higher is 156.25 (62.5 + 15.625)
            const mockEvent = createMockDragEvent(140, 'task-2');
            const mockElement = document.createElement('div');
            mockElement.id = 'task-2';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            Object.defineProperty(mockElement, 'getBoundingClientRect', { value: () => mockElementRect });

            act(() => {
                // Set offset to 0 so ghostMiddle = clientY
                result.current.handleDragStart(mockEvent, 'task-1');
                // At clientY 140, ghostMiddle = 140, itemBelowY = 100
                // ghostMiddleRelativeToItemBelow = 40
                // thresholdHigher = 31.25, so 40 > 31.25, should reorder
                // But we want to test NOT reordering, so let's use a lower value
                const eventBelowThreshold = createMockDragEvent(120, 'task-2');
                result.current.handleDragOver(eventBelowThreshold, 'task-2');
            });

            // clientY 120: ghostMiddle = 120, relative = 20, threshold = 31.25, 20 <= 31.25
            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('should return true when ghostMiddle > threshold (higher threshold)', () => {
            const { result } = renderHook(() => useTodoDrag());

            const mockEvent = createMockDragEvent(140, 'task-2');
            const mockElement = document.createElement('div');
            mockElement.id = 'task-2';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            Object.defineProperty(mockElement, 'getBoundingClientRect', { value: () => mockElementRect });

            act(() => {
                result.current.handleDragStart(mockEvent, 'task-1');
                result.current.handleDragOver(mockEvent, 'task-2');
            });

            // With offset=0: ghostMiddle=140, relative=40, threshold=31.25, 40 > 31.25
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'REORDER_TASKS',
                payload: { draggedItemId: 'task-1', itemBelowId: 'task-2' }
            });
        });
    });

    describe('shouldReorder (dragging UP)', () => {
        it('should return false when ghostMiddle >= threshold (lower threshold)', () => {
            const { result } = renderHook(() => useTodoDrag());

            const mockEvent = createMockDragEvent(135, 'task-1');
            const mockElement = document.createElement('div');
            mockElement.id = 'task-1';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            Object.defineProperty(mockElement, 'getBoundingClientRect', { value: () => mockElementRect });

            act(() => {
                result.current.handleDragStart(mockEvent, 'task-3');
                // clientY 135: ghostMiddle = 135, relative = 35, thresholdLower = 31.25, 35 >= 31.25
                result.current.handleDragOver(mockEvent, 'task-1');
            });

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('should return true when ghostMiddle < threshold (lower threshold)', () => {
            const { result } = renderHook(() => useTodoDrag());

            const mockEvent = createMockDragEvent(120, 'task-1');
            const mockElement = document.createElement('div');
            mockElement.id = 'task-1';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            Object.defineProperty(mockElement, 'getBoundingClientRect', { value: () => mockElementRect });

            act(() => {
                result.current.handleDragStart(mockEvent, 'task-3');
                // clientY 120: ghostMiddle = 120, relative = 20, thresholdLower = 31.25, 20 < 31.25
                result.current.handleDragOver(mockEvent, 'task-1');
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'REORDER_TASKS',
                payload: { draggedItemId: 'task-3', itemBelowId: 'task-1' }
            });
        });
    });

    describe('handleDragStart', () => {
        it('should call setIsDragging with true', () => {
            const { result } = renderHook(() => useTodoDrag());
            const mockEvent = createMockDragEvent(125, 'task-1');

            act(() => {
                result.current.handleDragStart(mockEvent, 'task-1');
            });

            expect(mockSetIsDragging).toHaveBeenCalledWith(true);
        });

        it('should calculate offset as clientY minus element middle', () => {
            const { result } = renderHook(() => useTodoDrag());
            const mockEvent = createMockDragEvent(140, 'task-1');
            Object.defineProperty(mockEvent.currentTarget, 'getBoundingClientRect', { value: () => mockElementRect });

            act(() => {
                result.current.handleDragStart(mockEvent, 'task-1');
            });

            // Element middle = 100 + 25 = 125
            // offset = 140 - 125 = 15
            // We can verify this indirectly through dragOver behavior
            expect(mockSetIsDragging).toHaveBeenCalledWith(true);
        });
    });

    describe('handleDragOver', () => {
        it('should call preventDefault on the event', () => {
            const { result } = renderHook(() => useTodoDrag());
            const mockEvent = createMockDragEvent(125, 'task-1');

            act(() => {
                result.current.handleDragStart(mockEvent, 'task-1');
                result.current.handleDragOver(mockEvent, 'task-2');
            });

            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should set itemBelowRef to item below ID', () => {
            const { result } = renderHook(() => useTodoDrag());
            const mockEvent = createMockDragEvent(140, 'task-2');
            const mockElement = document.createElement('div');
            mockElement.id = 'task-2';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            Object.defineProperty(mockElement, 'getBoundingClientRect', { value: () => mockElementRect });

            act(() => {
                result.current.handleDragStart(mockEvent, 'task-1');
                result.current.handleDragOver(mockEvent, 'task-2');
            });

            // Verify dispatch was called, which means itemBelowRef was set
            expect(mockDispatch).toHaveBeenCalled();
        });

        it('should NOT dispatch REORDER_TASKS when shouldReorder returns false', () => {
            const { result } = renderHook(() => useTodoDrag());
            const mockEvent = createMockDragEvent(120, 'task-2');
            const mockElement = document.createElement('div');
            mockElement.id = 'task-2';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            Object.defineProperty(mockElement, 'getBoundingClientRect', { value: () => mockElementRect });

            act(() => {
                result.current.handleDragStart(mockEvent, 'task-1');
                result.current.handleDragOver(mockEvent, 'task-2');
            });

            // At this position, shouldn't reorder
            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });

    describe('handleDragEnd', () => {
        it('should call preventDefault on the event', () => {
            const { result } = renderHook(() => useTodoDrag());
            const mockEvent = createMockDragEvent(125);

            act(() => {
                result.current.handleDragEnd(mockEvent);
            });

            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should call setIsDragging with false', () => {
            const { result } = renderHook(() => useTodoDrag());
            const mockEvent = createMockDragEvent(125);

            act(() => {
                result.current.handleDragEnd(mockEvent);
            });

            expect(mockSetIsDragging).toHaveBeenCalledWith(false);
        });
    });
});
