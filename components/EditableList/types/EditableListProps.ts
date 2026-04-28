import { type ListItem } from "@/lib/types";

export interface EditableListProps {
    title: string;
    items: ListItem[];
    color: string;
    icon: React.ElementType;
    onAdd: (name: string, amount: number) => Promise<void>;
    onUpdate: (id: string, name: string, amount: number) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    /** Whether a create operation is in progress. */
    isCreating?: boolean;
    /** Whether an update operation is in progress. */
    isUpdating?: boolean;
    /** ID of the item currently being deleted, or null. */
    isDeletingId?: string | null;
    /** Callback to open the "Copy from another month" modal. Button only shown when defined. */
    onCopyFromMonth?: () => void;
}
