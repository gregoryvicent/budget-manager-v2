import { type RefObject, type ReactNode } from "react";

/**
 * Props for the reusable Modal component.
 *
 * @param {boolean} open - Whether the modal is visible.
 * @param {() => void} onClose - Callback invoked when the modal should close.
 * @param {string} title - Title displayed in the modal header.
 * @param {ReactNode} children - Content rendered inside the modal body.
 * @param {string} [maxWidth="900px"] - Maximum width of the modal container.
 * @param {RefObject<HTMLElement | null>} [triggerRef] - Element to return focus to on close.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  triggerRef?: RefObject<HTMLElement | null>;
}
