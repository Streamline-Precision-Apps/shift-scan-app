"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  editingFieldId: string | null;
  children: React.ReactNode;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  editingFieldId,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    disabled: editingFieldId === id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};