export interface TooltipEntry {
    name: string;
    value: number;
    payload?: { color?: string };
}

export interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
}
