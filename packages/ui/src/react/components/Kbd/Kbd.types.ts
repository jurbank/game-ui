import type { ComponentPropsWithRef } from "react";

export type KbdSize = "sm" | "md";

export interface KbdProps extends ComponentPropsWithRef<"kbd"> {
  size?: KbdSize;
}
