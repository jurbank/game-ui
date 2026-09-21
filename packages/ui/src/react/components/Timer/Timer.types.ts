import type { ComponentPropsWithRef, ReactNode } from "react";

/** Smallest unit shown. */
export type TimerPrecision = "seconds" | "tenths" | "hundredths";

/** When to show an hours part. */
export type TimerHours = "auto" | "always" | "never";

export type TimerVariant = "default" | "warning" | "danger";

export type TimerSize = "sm" | "md" | "lg";

export interface TimerProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /**
   * Time to display, in milliseconds. The game owns the clock and decides
   * whether this counts up, counts down, or is frozen.
   */
  value: number;
  precision?: TimerPrecision;
  hours?: TimerHours;
  /** Visible label. Without one, pass `aria-label`. */
  label?: ReactNode;
  variant?: TimerVariant;
  size?: TimerSize;
}

export interface FormattedDuration {
  /** Text shown to the player, such as `1:09` or `--:--`. */
  text: string;
  /** ISO 8601 duration for the `datetime` attribute, or `undefined` when unknown. */
  dateTime: string | undefined;
}
