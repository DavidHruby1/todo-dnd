# ✅ Todo Drag & Drop

A React application featuring **native drag-and-drop**, **cross-tab synchronization**, and **runtime type safety**.

<video src="video/todo-dnd-preview.mp4" width="600" autoplay loop muted playsinline></video>

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/todo-dnd.git
cd todo-dnd

# Install dependencies
pnpm install        # or: npm install

# Start dev server
pnpm dev            # or: npm run dev
```

## ✨ Key Features

- **Native Drag & Drop:** Custom implementation using HTML5 DnD API (no external libraries) with offset-based calculation for smoother UX.
- **State Persistence:** Saves to `localStorage` with runtime validation to prevent corrupted state.
- **Cross-Tab Sync:** Uses the `storage` event to instantly sync state across open tabs/windows.
- **Inline Editing:** Double-click to edit tasks without modal interruptions.
- **Architecture:** Built with Context + `useReducer` for scalable state management without Redux bloat.

## 🧠 Engineering Decisions (Why I built it this way)

### 1. State Management: Context vs. Redux

I chose React Context + `useReducer` over Redux or Zustand.

- **Why:** For a single-feature application, Redux introduces unnecessary boilerplate.
- **Implementation:** Discriminated Unions for actions provide strict type safety in the reducer.
- **Code:** See `src/modules/common/context/todo/todoReducer.ts`.

### 2. The Drag-and-Drop Algorithm

Instead of using `dnd-kit`, I implemented a custom drag & drop interface and algorithm to solve the “ghost element” positioning problem.

- **Challenge:** The browser doesn’t expose the ghost element’s position during a drag.
- **Solution:** Calculate `cursorY - elementMiddle` offset on `dragStart`, then use that offset to predict where the user intends to drop the item (instead of using raw mouse position).
- **Code:** View the hook implementation in `src/modules/todo-list/hooks/useTodoDrag.ts`.

### 3. Type Safety & Sanitization

I treat `localStorage` as an external API (an untrusted source). Before hydrating state, I use a runtime type guard:

```ts
const isValidTodoList = (data: unknown): data is TodoList => {
  // Verifies array structure and property types before app load
  // Prevents white-screen crashes from malformed storage data
  return Array.isArray(data) && data.every((item) => typeof item?.id === "string" && typeof item?.text === "string");
};
```

## 🧪 Testing Strategy

Tests are written with Vitest and React Testing Library, focusing on user behavior rather than implementation details.

| Scope | Coverage |
|------|----------|
| Unit | Full coverage of `todoReducer` and `toastReducer` edge cases |
| Integration | `App.test.tsx` validates theme switching and cross-tab sync events |
| Hooks | Custom hooks tested in isolation (e.g., `useTodoDrag`) |

Run tests:

```bash
pnpm test           # or: npm test
```

---

[Report Bug](../../issues) | [License](LICENSE)