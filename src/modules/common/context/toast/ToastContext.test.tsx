/**
 * Unit tests for ToastContext
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ToastProvider, ToastContext } from './ToastContext';

// Mock crypto.randomUUID
const mockUUID = 'mock-toast-uuid-1234';
vi.stubGlobal('crypto', { randomUUID: () => mockUUID });

describe('ToastContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('showToast', () => {
        it('should dispatch SHOW_TOAST with correct payload', () => {
            const { result } = renderHook(() => {
                const React = require('react');
                return React.useContext(ToastContext);
            }, { wrapper });

            act(() => {
                result.current.showToast('error', 'Test error');
            });

            expect(result.current.state).toHaveLength(1);
            expect(result.current.state[0]).toEqual({
                id: mockUUID,
                type: 'error',
                message: 'Test error',
            });
        });

        it('should set setTimeout for auto-dismiss', () => {
            const { result } = renderHook(() => {
                const React = require('react');
                return React.useContext(ToastContext);
            }, { wrapper });

            act(() => {
                result.current.showToast('warning', 'Test warning');
            });

            expect(result.current.state).toHaveLength(1);

            act(() => {
                vi.advanceTimersByTime(3000);
            });

            expect(result.current.state).toHaveLength(0);
        });
    });

    describe('hideToast', () => {
        it('should dispatch HIDE_TOAST with toast ID', () => {
            const { result } = renderHook(() => {
                const React = require('react');
                return React.useContext(ToastContext);
            }, { wrapper });

            act(() => {
                result.current.showToast('error', 'Test error');
            });

            const toastId = result.current.state[0].id;

            act(() => {
                result.current.hideToast(toastId);
            });

            expect(result.current.state).toHaveLength(0);
        });
    });
});
