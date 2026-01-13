/**
 * Unit tests for todoReducer
 */

import { describe, it, expect, vi } from 'vitest';
import { todoReducer } from './todoReducer';
import type { TodoList } from 'src/types/index';

// Mock crypto.randomUUID for predictable ID generation
const mockUUID = 'mock-uuid-1234';
vi.stubGlobal('crypto', {
    randomUUID: () => mockUUID,
});

describe('todoReducer', () => {
    const createState = (): TodoList => [
        { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
        { id: '2', text: 'Task 2', isDone: false, isEditing: false, order: 2 },
        { id: '3', text: 'Task 3', isDone: false, isEditing: false, order: 3 },
    ];

    describe('calcMaxOrder (via ADD_TASK)', () => {
        it('should return 1 when state is empty', () => {
            const result = todoReducer([], { type: 'ADD_TASK', payload: 'Test' });
            expect(result[0].order).toBe(1);
        });

        it('should return max order + 1 for non-empty state', () => {
            const state: TodoList = [
                { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 5 },
            ];
            const result = todoReducer(state, { type: 'ADD_TASK', payload: 'New' });
            expect(result[result.length - 1].order).toBe(6);
        });
    });

    describe('ADD_TASK', () => {
        it('should add task with generated ID, correct order, and default values', () => {
            const state = createState();
            const result = todoReducer(state, { type: 'ADD_TASK', payload: 'New task' });

            expect(result).toHaveLength(4);
            expect(result[3]).toEqual({
                id: mockUUID,
                text: 'New task',
                isDone: false,
                isEditing: false,
                order: 4,
            });
            expect(result).not.toBe(state);
        });
    });

    describe('DELETE_TASK', () => {
        it('should remove item by ID', () => {
            const state = createState();
            const result = todoReducer(state, { type: 'DELETE_TASK', payload: '2' });

            expect(result).toHaveLength(2);
            expect(result.find(t => t.id === '2')).toBeUndefined();
        });

        it('should return empty array when deleting last item', () => {
            const state: TodoList = [
                { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
            ];
            const result = todoReducer(state, { type: 'DELETE_TASK', payload: '1' });

            expect(result).toEqual([]);
        });

        it('should return unchanged state if ID not found', () => {
            const state = createState();
            const result = todoReducer(state, { type: 'DELETE_TASK', payload: 'non-existent' });
            expect(result).toEqual(state);
        });
    });

    describe('FINISH_TASK', () => {
        it('should toggle isDone for matching ID', () => {
            const state: TodoList = [
                { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
                { id: '2', text: 'Task 2', isDone: false, isEditing: false, order: 2 },
            ];
            const result = todoReducer(state, { type: 'FINISH_TASK', payload: '1' });

            expect(result[0].isDone).toBe(true);
            expect(result[1].isDone).toBe(false);
            expect(result).not.toBe(state);
        });

        it('should return unchanged state if ID not found', () => {
            const state = createState();
            const result = todoReducer(state, { type: 'FINISH_TASK', payload: 'non-existent' });
            expect(result).toEqual(state);
        });
    });

    describe('TOGGLE_TASK_EDITING', () => {
        it('should update text and toggle isEditing for matching ID', () => {
            const state: TodoList = [
                { id: '1', text: 'Original', isDone: false, isEditing: false, order: 1 },
            ];
            const result = todoReducer(state, {
                type: 'TOGGLE_TASK_EDITING',
                payload: { id: '1', inputText: 'Updated' }
            });

            expect(result[0].text).toBe('Updated');
            expect(result[0].isEditing).toBe(true);
        });

        it('should handle empty inputText by reverting to original text', () => {
            const state: TodoList = [
                { id: '1', text: 'Original', isDone: false, isEditing: true, order: 1 },
            ];
            const result = todoReducer(state, {
                type: 'TOGGLE_TASK_EDITING',
                payload: { id: '1', inputText: 'Original' }
            });

            expect(result[0].text).toBe('Original');
            expect(result[0].isEditing).toBe(false);
        });
    });

    describe('REORDER_TASKS', () => {
        it('should splice dragged item and insert at new position', () => {
            const state = createState();
            const result = todoReducer(state, {
                type: 'REORDER_TASKS',
                payload: { draggedItemId: '1', itemBelowId: '3' }
            });

            // splice(2, 0, '1') inserts at index 2: ['2', '3', '1']
            expect(result[0].id).toBe('2');
            expect(result[1].id).toBe('3');
            expect(result[2].id).toBe('1');
        });

        it('should recalculate order values as 1, 2, 3... after reorder', () => {
            const state = createState();
            const result = todoReducer(state, {
                type: 'REORDER_TASKS',
                payload: { draggedItemId: '3', itemBelowId: '1' }
            });

            expect(result[0].order).toBe(1);
            expect(result[1].order).toBe(2);
            expect(result[2].order).toBe(3);
        });

        it('should return unchanged state if IDs not found', () => {
            const state = createState();
            const result = todoReducer(state, {
                type: 'REORDER_TASKS',
                payload: { draggedItemId: 'non-existent', itemBelowId: '3' }
            });
            expect(result).toEqual(state);
        });

        it('should return unchanged state for single item state', () => {
            const state: TodoList = [
                { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
            ];
            const result = todoReducer(state, {
                type: 'REORDER_TASKS',
                payload: { draggedItemId: '1', itemBelowId: '1' }
            });
            expect(result).toEqual(state);
        });

        it('should handle dragging item below itself (same IDs)', () => {
            const state = createState();
            const result = todoReducer(state, {
                type: 'REORDER_TASKS',
                payload: { draggedItemId: '2', itemBelowId: '2' }
            });

            // When dragging item below itself: splice removes '2' at index 1 → ['1', '3']
            // Then inserts '2' at the now-shifted index 1 → ['1', '2', '3'] (back to original)
            expect(result[0].id).toBe('1');
            expect(result[1].id).toBe('2');
            expect(result[2].id).toBe('3');
        });
    });

    describe('SYNC_STORAGE', () => {
        it('should replace entire state with payload', () => {
            const state: TodoList = [{ id: '1', text: 'Old', isDone: false, isEditing: false, order: 1 }];
            const newPayload: TodoList = [
                { id: '2', text: 'New', isDone: true, isEditing: false, order: 1 },
            ];
            const result = todoReducer(state, { type: 'SYNC_STORAGE', payload: newPayload });

            expect(result).toEqual(newPayload);
        });

        it('should handle empty array payload', () => {
            const state: TodoList = [
                { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
            ];
            const result = todoReducer(state, { type: 'SYNC_STORAGE', payload: [] });

            expect(result).toEqual([]);
        });

        it('should return new reference when payload differs from state', () => {
            const state: TodoList = [{ id: '1', text: 'Old', isDone: false, isEditing: false, order: 1 }];
            const newPayload: TodoList = [
                { id: '2', text: 'New', isDone: true, isEditing: false, order: 1 },
            ];
            const result = todoReducer(state, { type: 'SYNC_STORAGE', payload: newPayload });

            expect(result).not.toBe(state);
            expect(result).toBe(newPayload);
        });
    });

    describe('Default case', () => {
        it('should return unchanged state for unknown action', () => {
            const state = createState();
            const result = todoReducer(state, { type: 'UNKNOWN' as any, payload: {} });
            expect(result).toBe(state);
        });
    });
});
