import { useRef } from 'react';
import { useTodo } from 'src/modules/common/context/todo/useTodo';

export type DragHandlers = {
    handleDragStart: (id: string) => void;
    handleDragOver: (e: React.DragEvent, id: string) => void;
    handleDragEnd: (e: React.DragEvent) => void;
};


export const useTodoDrag = (): DragHandlers => {
    const { state, dispatch, setIsDragging } = useTodo();
    const draggedItemRef = useRef<string>('');
    const itemBelowRef = useRef<string>('');

    const shouldReorder = (e: React.DragEvent, draggedItemId: string, itemBelowId: string): boolean => {
        if (!draggedItemId || !itemBelowId || draggedItemId === itemBelowId) return false;

        const mouseY = e.clientY;
        const itemBelowElement = document.getElementById(itemBelowId);
        if (!itemBelowElement) return false;

        // Get height of the drag over task item
        const itemBelowRect = itemBelowElement.getBoundingClientRect();
        const itemBelowY = itemBelowRect.top;
        const itemBelowHeight = itemBelowRect.height;
        const itemBelowMiddle = itemBelowHeight / 2;
        const itemBelowThresholdHigher = itemBelowMiddle + (itemBelowMiddle / 3);
        const itemBelowThresholdLower = itemBelowMiddle - (itemBelowMiddle / 3);
        const mouseYRelativeToItemBelow = mouseY - itemBelowY;

        // Get order values of both elements
        const orderDraggedItem: number | undefined = state.find(task => task.id === draggedItemId)?.order;
        const orderItemBelow: number | undefined = state.find(task => task.id === itemBelowId)?.order;

        if (orderDraggedItem && orderItemBelow) {
            if ((orderDraggedItem < orderItemBelow) && (mouseYRelativeToItemBelow > itemBelowThresholdHigher)) {
                return true;
            } else if ((orderDraggedItem > orderItemBelow) && (mouseYRelativeToItemBelow < itemBelowThresholdLower)) {
                return true;
            }
        }
        return false;
    };

    const handleDragStart = (id: string): void => {
        setIsDragging(true);
        draggedItemRef.current = id;
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
        console.log('dragging over');
    };

    return { handleDragStart, handleDragOver, handleDragEnd };
}