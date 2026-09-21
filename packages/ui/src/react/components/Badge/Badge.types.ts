import type { ComponentPropsWithRef } from "react";

/** What the badge means. The game decides which state maps to which tone. */
export type BadgeTone = "default" | "primary" | "success" | "warning" | "danger";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Show a coloured dot before the text, for live states such as "Online". */
  dot?: boolean;
}
