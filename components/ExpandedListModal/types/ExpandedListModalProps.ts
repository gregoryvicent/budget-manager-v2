import type { ListItem } from "@/lib/types";
import type { RefObject } from "react";

/**
 * Props for the ExpandedListModal component.
 *
 * @param {boolean} open - Whether the modal is visible.
 * @param {() => void} onClose - Callback invoked when the modal should close.
 * @param {string} title - Category title displayed in the modal header.
 * @param {ListItem[]} items - List of items to display in the expanded view.
 * @param {string} color - Theme color associated with the category.
 * @param {React.ElementType} icon - Icon component for the category header.
 * @param {(name: string, amount: number) => Promise<void>} onAdd - Callback to create a new item.
 * @param {(id: string, name: string, amount: number) => Promise<void>} onUpdate - Callback to update an existing item.
 * @param {(id: string) => Promise<void>} onDelete - Callback to delete an item.
 * @param {boolean} [isCreating] - Whether a create operation is in progress.
 * @param {boolean} [isUpdating] - Whether an update operation is in progress.
 * @param {string | null} [isDeletingId] - ID of the item currently being deleted, or null.
 * @param {() => void} [onCopyFromMonth] - Callback to open the "Copy from another month" modal. Button only shown when defined.
 * @param {RefObject<HTMLElement | null>} [triggerRef] - Element to return focus to on close.
 */
export interface ExpandedListModalProps {
    open: boolean;
    onClose: () => void;
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
    /** Element to return focus to on close. */
    triggerRef?: RefObject<HTMLElement | null>;
}
