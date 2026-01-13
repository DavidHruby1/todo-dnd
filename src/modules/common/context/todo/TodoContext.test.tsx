/**
 * Unit tests for TodoContext
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TodoProvider } from './TodoContext';
import { useTodo } from './useTodo';

// Mock useToast
vi.mock('../toast/useToast', () => ({
    useToast: () => ({
        showToast: mockShowToast,
    }),
}));

const mockShowToast = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('TodoContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <TodoProvider>{children}</TodoProvider>;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('getInitialData', () => {
        it('should return empty array when no localStorage', () => {
            const { result } = renderHook(() => useTodo(), { wrapper });
            expect(result.current.state).toEqual([]);
        });

        it('should return parsed data when valid', () => {
            const validData = [
                { id: '1', text: 'Task 1', isDone: false, isEditing: false, order: 1 },
            ];
            localStorage.setItem('todoStorage', JSON.stringify(validData));

            const { result } = renderHook(() => useTodo(), { wrapper });
            expect(result.current.state).toEqual(validData);
        });

        it('should return empty array when invalid', () => {
            localStorage.setItem('todoStorage', JSON.stringify({ invalid: 'data' }));

            const { result } = renderHook(() => useTodo(), { wrapper });
            expect(result.current.state).toEqual([]);
        });

        it('should reject non-array data', () => {
            localStorage.setItem('todoStorage', JSON.stringify({ not: 'array' }));

            const { result } = renderHook(() => useTodo(), { wrapper });
            expect(result.current.state).toEqual([]);
        });

        it('should reject invalid prop types', () => {
            const invalidData = [
                { id: 123, text: 'Task', isDone: 'false', isEditing: false, order: 1 },
            ];
            localStorage.setItem('todoStorage', JSON.stringify(invalidData));

            const { result } = renderHook(() => useTodo(), { wrapper });
            expect(result.current.state).toEqual([]);
        });
    });

    describe('useEffect persistence', () => {
        it('should debounce save to localStorage', () => {
            const { result } = renderHook(() => useTodo(), { wrapper });

            act(() => {
                result.current.dispatch({ type: 'ADD_TASK', payload: 'New task' });
            });

            act(() => {
                vi.advanceTimersByTime(500);
            });

            const stored = localStorage.getItem('todoStorage');
            expect(stored).toBeTruthy();
        });

        it('should NOT save when isDragging === true', () => {
            const { result } = renderHook(() => useTodo(), { wrapper });

            act(() => {
                result.current.dispatch({ type: 'ADD_TASK', payload: 'New task' });
                result.current.setIsDragging(true);
            });

            act(() => {
                vi.advanceTimersByTime(500);
            });

            expect(localStorage.getItem('todoStorage')).toBeNull();
        });
    });

    describe('Cross-tab sync', () => {
        it('should dispatch SYNC_STORAGE on valid data', () => {
            const { result } = renderHook(() => useTodo(), { wrapper });
            const newData = [
                { id: '2', text: 'Synced task', isDone: true, isEditing: false, order: 1 },
            ];

            act(() => {
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'todoStorage',
                    newValue: JSON.stringify(newData),
                }));
            });

            expect(result.current.state).toEqual(newData);
        });

        it('should show error toast on invalid data', () => {
            renderHook(() => useTodo(), { wrapper });

            act(() => {
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'todoStorage',
                    newValue: JSON.stringify({ invalid: 'data' }),
                }));
            });

            expect(mockShowToast).toHaveBeenCalledWith('error', expect.stringContaining('Invalid'));
        });
    });
});
