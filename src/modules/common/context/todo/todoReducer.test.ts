/**
 * Unit tests for todoReducer
 */

import { describe, it, expect, vi } from 'vitest';
import { todoReducer } from './todoReducer';
import type { TodoList } from 'src/types/index';

const mockUUID = 'mock-uuid-1234';
vi.stubGlobal('crypto', { randomUUID: () => mockUUID });

describe('todoReducer', () => {
    const createState = (): TodoList => [
        { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
        { id: '2', text: 'Task 2', isDone: false, isEditing: false, order: 2 },
        { id: '3', text: 'Task 3', isDone: false, isEditing: false, order: 3 },
    ];

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
        });
    });

    describe('DELETE_TASK', () => {
        it('should remove item by ID', () => {
            const state = createState();
            const result = todoReducer(state, { type: 'DELETE_TASK', payload: '2' });

            expect(result).toHaveLength(2);
            expect(result.find(t => t.id === '2')).toBeUndefined();
        });
    });

    describe('FINISH_TASK', () => {
        it('should toggle isDone for matching ID', () => {
            const state = createState();
            const result = todoReducer(state, { type: 'FINISH_TASK', payload: '1' });

            expect(result[0].isDone).toBe(true);
            expect(result[1].isDone).toBe(false);
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
    });

    describe('REORDER_TASKS', () => {
        it('should splice dragged item and insert at new position', () => {
            const state = createState();
            const result = todoReducer(state, {
                type: 'REORDER_TASKS',
                payload: { draggedItemId: '1', itemBelowId: '3' }
            });

            expect(result[0].id).toBe('2');
            expect(result[1].id).toBe('3');
            expect(result[2].id).toBe('1');
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
    });
});
