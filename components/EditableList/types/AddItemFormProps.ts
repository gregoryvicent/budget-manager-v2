export interface AddItemFormProps {
    adding: boolean;
    newName: string;
    newAmount: string;
    color: string;
    onNewNameChange: (val: string) => void;
    onNewAmountChange: (val: string) => void;
    onAdd: () => void;
    onStartAdding: () => void;
    onCancel: () => void;
}
