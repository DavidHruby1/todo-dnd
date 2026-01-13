/**
 * Unit tests for toastReducer
 */

import { describe, it, expect } from 'vitest';
import { toastReducer } from './toastReducer';
import type { ToastList } from 'src/types/index';

describe('toastReducer', () => {
    const createState = (): ToastList => [
        { id: '1', type: 'error', message: 'Error message' },
        { id: '2', type: 'warning', message: 'Warning message' },
    ];

    describe('SHOW_TOAST', () => {
        it('should add new toast with unique ID', () => {
            const state = createState();
            const result = toastReducer(state, {
                type: 'SHOW_TOAST',
                payload: { id: '3', type: 'error', message: 'New error' }
            });

            expect(result).toHaveLength(3);
            expect(result[2]).toEqual({
                id: '3',
                type: 'error',
                message: 'New error',
            });
        });

        it('should prevent duplicate messages', () => {
            const state = createState();
            const result = toastReducer(state, {
                type: 'SHOW_TOAST',
                payload: { id: '3', type: 'warning', message: 'Warning message' }
            });

            expect(result).toHaveLength(2);
            expect(result).toEqual(state);
        });
    });

    describe('HIDE_TOAST', () => {
        it('should remove toast by ID', () => {
            const state = createState();
            const result = toastReducer(state, {
                type: 'HIDE_TOAST',
                payload: '1'
            });

            expect(result).toHaveLength(1);
            expect(result.find(t => t.id === '1')).toBeUndefined();
        });

        it('should return unchanged state if ID not found', () => {
            const state = createState();
            const result = toastReducer(state, {
                type: 'HIDE_TOAST',
                payload: '999'
            });

            expect(result).toHaveLength(2);
            expect(result).toEqual(state);
        });
    });

    describe('Default case', () => {
        it('should return unchanged state', () => {
            const state = createState();
            const result = toastReducer(state, { type: 'UNKNOWN', payload: '' } as any);

            expect(result).toEqual(state);
        });
    });
});
