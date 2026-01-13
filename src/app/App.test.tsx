/**
 * Unit tests for App
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (k: string) => store[k] || null,
        setItem: (k: string, v: string) => { store[k] = v; },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render main components', () => {
        render(<App />);
        expect(screen.getByText('Todo List')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'ADD' })).toBeInTheDocument();
    });

    it('should read theme from localStorage on mount', () => {
        localStorage.setItem('themeStorage', 'dark');
        render(<App />);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should default to light theme when localStorage is empty', () => {
        render(<App />);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should toggle theme when theme button is clicked', () => {
        render(<App />);

        // Initial theme should be light
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');

        const themeButton = screen.getByRole('button', { name: /switch to dark mode/i });

        // Click to toggle to dark
        fireEvent.click(themeButton);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

        const sunButton = screen.getByRole('button', { name: /switch to light mode/i });

        // Click to toggle back to light
        fireEvent.click(sunButton);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should handle storage events for cross-tab sync', () => {
        render(<App />);

        act(() => {
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'themeStorage',
                newValue: 'dark'
            }));
        });

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should ignore storage events for unrelated keys', () => {
        render(<App />);

        const initialTheme = document.documentElement.getAttribute('data-theme');

        act(() => {
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'unrelatedKey',
                newValue: 'someValue'
            }));
        });

        // Theme should not change
        expect(document.documentElement.getAttribute('data-theme')).toBe(initialTheme);
    });

    it('should debounce theme writes to localStorage', () => {
        render(<App />);

        const themeButton = screen.getByRole('button', { name: /switch to dark mode/i });

        fireEvent.click(themeButton);

        // Immediately after click, localStorage should not have the new value yet (debounced)
        // After 500ms, it should be written
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(localStorage.getItem('themeStorage')).toBe('dark');
    });
});
