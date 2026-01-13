/**
 * Unit tests for useTodoDrag
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTodoDrag } from './useTodoDrag';
import type { TodoList } from 'src/types/index';

// Mock useTodo hook
vi.mock('src/modules/common/context/todo/useTodo', () => ({
    useTodo: () => ({
        state: mockState,
        dispatch: mockDispatch,
        setIsDragging: mockSetIsDragging,
    }),
}));

const mockDispatch = vi.fn();
const mockSetIsDragging = vi.fn();
let mockState: TodoList = [
    { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
    { id: '2', text: 'Task 2', isDone: false, isEditing: false, order: 2 },
    { id: '3', text: 'Task 3', isDone: false, isEditing: false, order: 3 },
];

describe('useTodoDrag', () => {
    beforeEach(() => {
        mockState = [
            { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
            { id: '2', text: 'Task 2', isDone: false, isEditing: false, order: 2 },
            { id: '3', text: 'Task 3', isDone: false, isEditing: false, order: 3 },
        ];
        vi.clearAllMocks();
    });

    // Mock getBoundingClientRect
    const mockGetBoundingClientRect = (top: number, height: number) => {
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            top,
            height,
            bottom: top + height,
            left: 0,
            right: 100,
            x: 0,
            y: top,
            width: 100,
            toJSON: () => ({}),
        })) as any;
    };

    describe('handleDragStart', () => {
        it('should set draggedItemRef and call setIsDragging', () => {
            const { result } = renderHook(() => useTodoDrag());
            const mockEvent = {
                clientY: 100,
                currentTarget: {
                    getBoundingClientRect: () => ({ top: 80, height: 40, bottom: 120 }),
                },
            } as unknown as React.DragEvent;

            result.current.handleDragStart(mockEvent, '1');

            expect(mockSetIsDragging).toHaveBeenCalledWith(true);
        });
    });

    describe('handleDragOver', () => {
        it('should dispatch REORDER_TASKS when dragging down past threshold', () => {
            // Setup DOM element with ID
            document.getElementById = vi.fn((id) =>
                id === '3'
                    ? ({
                          getBoundingClientRect: () => ({
                              top: 100,
                              height: 50,
                              bottom: 150,
                              left: 0,
                              right: 100,
                              x: 0,
                              y: 100,
                              width: 100,
                              toJSON: () => ({}),
                          }),
                      } as HTMLElement)
                    : null
            );

            const { result } = renderHook(() => useTodoDrag());
            const startEvent = {
                clientY: 50,
                currentTarget: {
                    getBoundingClientRect: () => ({ top: 30, height: 40, bottom: 70 }),
                },
            } as unknown as React.DragEvent;

            result.current.handleDragStart(startEvent, '1');

            const overEvent = {
                clientY: 140,
                preventDefault: vi.fn(),
            } as unknown as React.DragEvent;

            result.current.handleDragOver(overEvent, '3');

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'REORDER_TASKS',
                payload: { draggedItemId: '1', itemBelowId: '3' },
            });
        });

        it('should not dispatch when same ID', () => {
            const { result } = renderHook(() => useTodoDrag());
            const startEvent = {
                clientY: 50,
                currentTarget: {
                    getBoundingClientRect: () => ({ top: 30, height: 40, bottom: 70 }),
                },
            } as unknown as React.DragEvent;

            result.current.handleDragStart(startEvent, '1');

            const overEvent = {
                clientY: 50,
                preventDefault: vi.fn(),
            } as unknown as React.DragEvent;

            result.current.handleDragOver(overEvent, '1');

            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });

    describe('handleDragEnd', () => {
        it('should call setIsDragging(false)', () => {
            const { result } = renderHook(() => useTodoDrag());
            const mockEvent = {
                preventDefault: vi.fn(),
            } as unknown as React.DragEvent;

            result.current.handleDragEnd(mockEvent);

            expect(mockSetIsDragging).toHaveBeenCalledWith(false);
        });
    });
});
