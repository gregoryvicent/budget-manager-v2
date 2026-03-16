import { type ListItem } from "@/lib/types";

export interface EditableListProps {
    title: string;
    items: ListItem[];
    color: string;
    icon: React.ElementType;
    onItemsChange: (items: ListItem[]) => void;
}
