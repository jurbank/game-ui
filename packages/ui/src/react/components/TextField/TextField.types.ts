import type { ComponentPropsWithRef, ReactNode } from "react";

export type TextFieldSize = "sm" | "md";

export interface TextFieldProps extends Omit<
  ComponentPropsWithRef<"input">,
  "size" | "value" | "defaultValue" | "onChange" | "children"
> {
  /** Visible label. Without one, pass `aria-label`. */
  label?: ReactNode;
  /** Hint shown under the input, such as "Up to 16 characters". */
  description?: ReactNode;
  /**
   * Error message. When set, the field is invalid and the message is shown and
   * announced. The game owns validation: set it from your own rules.
   */
  error?: ReactNode;
  /** Current text, for a controlled field. Pair with `onValueChange`. */
  value?: string;
  /** Starting text, for an uncontrolled field. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: TextFieldSize;
}
