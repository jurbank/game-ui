import type { TouchButtonControl } from "../../../input/index.ts";
import type { ComponentPropsWithRef } from "react";

export type TouchButtonVariant = "primary" | "secondary" | "danger";

export type TouchButtonSize = "md" | "lg";

export interface TouchButtonProps extends ComponentPropsWithRef<"div"> {
  /** The button to drive, from `createTouchButton()` in `@gameui/ui/input`. The game reads it. */
  control: TouchButtonControl;
  variant?: TouchButtonVariant;
  size?: TouchButtonSize;
}
