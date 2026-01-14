# 📝 Todo Drag & Drop

A React application featuring **native drag-and-drop**, **cross-tab synchronization**, and **runtime type safety**.

## Demo Video
https://github.com/user-attachments/assets/2e6b1395-8642-4d6d-8ccd-bcaca46cf6c1

## 🚀 Quick Start

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/DavidHruby1/todo-dnd.git
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

## 📂 Project Structure

I organized the codebase by **feature** (domain-driven) rather than file type. This ensures that related logic, styles, and tests are co-located, making the codebase easier to scale.

```text
src/
├── modules/
│   ├── common/           # Shared Contexts (Todo, Toast, Modal) & Hooks
│   ├── todo-list/        # List rendering & Drag-and-Drop logic
│   ├── todo-input/       # Input form & validation
│   └── header/           # Layout components
├── types/                # Shared TypeScript definitions
└── app/                  # App entry point
```

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
    if (!Array.isArray(data)) return false;

    for (const item of data) {
        if (
            typeof item !== 'object' ||
            item === null ||
            !('id' in item) || typeof item.id !== 'string' ||
            !('text' in item) || typeof item.text !== 'string' ||
            !('isDone' in item) || typeof item.isDone !== 'boolean' ||
            !('isEditing' in item) || typeof item.isEditing !== 'boolean' ||
            !('order' in item) || typeof item.order !== 'number'
        ) return false;
    }
    return true;
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
