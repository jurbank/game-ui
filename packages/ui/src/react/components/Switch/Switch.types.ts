import type { ComponentPropsWithRef, ReactNode } from "react";

export type SwitchSize = "sm" | "md";

export interface SwitchProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children" | "onChange" | "defaultChecked"
> {
  /** Whether the switch is on, for a controlled switch. Pair with `onCheckedChange`. */
  checked?: boolean;
  /** Starting state, for an uncontrolled switch. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Visible label, placed after the switch. Without one, pass `aria-label`. */
  label?: ReactNode;
  disabled?: boolean;
  /** Form field name, for switches inside a `<form>`. */
  name?: string;
  size?: SwitchSize;
}
