import type { ComponentPropsWithRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /** Visual emphasis. Use `danger` for destructive or irreversible actions. */
  variant?: ButtonVariant;
  size?: ButtonSize;
}
