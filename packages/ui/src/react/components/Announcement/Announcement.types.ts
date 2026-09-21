import type { ComponentPropsWithRef, ReactNode } from "react";

/** What the moment means. The game decides which event maps to which tone. */
export type AnnouncementTone = "default" | "primary" | "success" | "warning" | "danger";

export type AnnouncementSize = "md" | "lg";

export interface AnnouncementProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title" | "children"
> {
  /**
   * The headline, such as "3", "Go!", or "Round over". Nothing is shown while
   * it is empty. A new string or number title animates in again.
   */
  title?: ReactNode;
  /** A smaller line under the title, such as "Most coins wins". */
  detail?: ReactNode;
  tone?: AnnouncementTone;
  size?: AnnouncementSize;
  /** How screen readers announce changes. Use `assertive` only for urgent moments. */
  politeness?: "polite" | "assertive";
}
