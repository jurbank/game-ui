import type { ReactNode, RefObject } from "react";

export type ModalSize = "sm" | "md" | "lg";

/** Why the player dismissed the modal. */
export type ModalCloseReason = "escape" | "backdrop" | "close-button";

export interface ModalProps {
  /** Whether the modal is open. The game owns this state. */
  open: boolean;
  /**
   * Called when the player dismisses the modal. Set `open` to `false` in
   * response. Not called for closes the game makes itself.
   */
  onClose?: (reason: ModalCloseReason) => void;
  /** Visible heading and accessible name of the dialog. */
  title: ReactNode;
  /** Supporting text, announced as the dialog's description. */
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons for the modal's decisions, rendered in a footer row. */
  actions?: ReactNode;
  /**
   * Whether Escape, a backdrop press, and the close button dismiss the modal.
   * When `false`, no close button is shown and the modal closes only when the
   * game sets `open` to `false`, typically from one of `actions`.
   */
  dismissible?: boolean;
  /** Accessible label for the close button. */
  closeLabel?: string;
  size?: ModalSize;
  /** Element to focus on open. Defaults to the first focusable element. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Element to focus on close. Defaults to the element focused before opening. */
  finalFocus?: RefObject<HTMLElement | null>;
  /** Appended to the popup's classes. */
  className?: string;
}
