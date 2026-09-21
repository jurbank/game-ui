import type { ComponentPropsWithRef, ReactNode } from "react";

export type SliderSize = "sm" | "md";

export interface SliderProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children" | "defaultValue" | "onChange"
> {
  /** Current value, for a controlled slider. Pair with `onValueChange`. */
  value?: number;
  /** Starting value, for an uncontrolled slider. */
  defaultValue?: number;
  /** Called continuously while the player drags or presses keys. */
  onValueChange?: (value: number) => void;
  /**
   * Called once when the player releases the thumb or finishes a key press.
   * Use it for expensive work such as saving settings or replaying a sound.
   */
  onValueCommitted?: (value: number) => void;
  min?: number;
  max?: number;
  /** Granularity of values. */
  step?: number;
  /** Step used with Page Up/Down and Shift + arrow keys. */
  largeStep?: number;
  /** Visible label. Without one, pass `aria-label`. */
  label?: ReactNode;
  /** Show the formatted value next to the label. */
  showValue?: boolean;
  /** Number formatting for the displayed and announced value. */
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
  disabled?: boolean;
  /** Form field name, for sliders inside a `<form>`. */
  name?: string;
  size?: SliderSize;
}
