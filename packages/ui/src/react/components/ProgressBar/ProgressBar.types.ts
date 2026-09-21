import type { ComponentPropsWithRef, ReactNode } from "react";

export type ProgressBarVariant = "primary" | "success" | "warning" | "danger";

export type ProgressBarSize = "sm" | "md" | "lg";

export interface ProgressBarProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /**
   * Current progress, owned by the game. Use `null` while the amount of
   * progress is unknown, such as during loading.
   */
  value: number | null;
  /** Value at which the bar is full. */
  max?: number;
  /** Value at which the bar is empty. */
  min?: number;
  /** Visible label. Without one, pass `aria-label`. */
  label?: ReactNode;
  /** Show the formatted value next to the label. */
  showValue?: boolean;
  /**
   * Number formatting for the displayed and announced value. Defaults to a
   * percentage of the range.
   */
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
}
