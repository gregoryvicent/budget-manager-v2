import { type ListItem } from "@/lib/types";

export interface EditableListProps {
    title: string;
    items: ListItem[];
    color: string;
    icon: React.ElementType;
    onAdd: (name: string, amount: number) => Promise<void>;
    onUpdate: (id: string, name: string, amount: number) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}
