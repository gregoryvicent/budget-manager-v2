import { type ListItem } from "@/lib/types";

export interface EditableListItemProps {
    item: ListItem;
    color: string;
    isEditing: boolean;
    editName: string;
    editAmount: string;
    onEditNameChange: (val: string) => void;
    onEditAmountChange: (val: string) => void;
    onStartEdit: () => void;
    onConfirmEdit: () => void;
    onCancelEdit: () => void;
    onRemove: () => void;
    /** Whether an update operation is in progress. */
    isUpdating?: boolean;
    /** Whether this specific item is being deleted. */
    isDeleting?: boolean;
}
