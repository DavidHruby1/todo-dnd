import { useRef } from 'react';
import { useTodo } from 'src/modules/common/context/todo/useTodo';

export type DragHandlers = {
    handleDragStart: (e: React.DragEvent, id: string) => void;
    handleDragOver: (e: React.DragEvent, id: string) => void;
    handleDragEnd: (e: React.DragEvent) => void;
};


export const useTodoDrag = (): DragHandlers => {
    const { state, dispatch, setIsDragging } = useTodo();
    const draggedItemRef = useRef<string>('');
    const itemBelowRef = useRef<string>('');
    const dragOffsetRef = useRef<number>(0);

    const shouldReorder = (e: React.DragEvent, draggedItemId: string, itemBelowId: string): boolean => {
        if (!draggedItemId || !itemBelowId || draggedItemId === itemBelowId) return false;

        // Calculate ghost middle position using cursor - offset
        const ghostMiddleY = e.clientY - dragOffsetRef.current;

        const itemBelowElement = document.getElementById(itemBelowId);
        if (!itemBelowElement) return false;

        // Get height of the drag over task item
        const itemBelowRect = itemBelowElement.getBoundingClientRect();
        const itemBelowY = itemBelowRect.top;
        const itemBelowHeight = itemBelowRect.height;
        const itemBelowMiddle = itemBelowHeight / 2;
        const itemBelowThresholdHigher = itemBelowMiddle + (itemBelowMiddle / 2);
        const itemBelowThresholdLower = itemBelowMiddle - (itemBelowMiddle / 2);
        const ghostMiddleRelativeToItemBelow = ghostMiddleY - itemBelowY;

        // Get order values of both elements
        const orderDraggedItem: number | undefined = state.find(task => task.id === draggedItemId)?.order;
        const orderItemBelow: number | undefined = state.find(task => task.id === itemBelowId)?.order;

        if (orderDraggedItem && orderItemBelow) {
            if ((orderDraggedItem < orderItemBelow) && (ghostMiddleRelativeToItemBelow > itemBelowThresholdHigher)) {
                return true;
            } else if ((orderDraggedItem > orderItemBelow) && (ghostMiddleRelativeToItemBelow < itemBelowThresholdLower)) {
                return true;
            }
        }
        return false;
    };

    const handleDragStart = (e: React.DragEvent, id: string): void => {
        setIsDragging(true);
        draggedItemRef.current = id;

        // Capture offset between cursor and element middle for predictable reordering
        const element = e.currentTarget as HTMLElement;
        const rect = element.getBoundingClientRect();
        const elementMiddle = rect.top + (rect.height / 2);
        dragOffsetRef.current = e.clientY - elementMiddle;
    };

    const handleDragOver = (e: React.DragEvent, id: string): void => {
        e.preventDefault();
        itemBelowRef.current = id;

        const draggedItemId = draggedItemRef.current;
        const itemBelowId = itemBelowRef.current;

        if (shouldReorder(e, draggedItemId, itemBelowId)) {
            dispatch({ type: "REORDER_TASKS", payload: { draggedItemId, itemBelowId } });
        }
    };

    const handleDragEnd = (e: React.DragEvent): void => {
        e.preventDefault();
        setIsDragging(false);
    };

    return { handleDragStart, handleDragOver, handleDragEnd };
}