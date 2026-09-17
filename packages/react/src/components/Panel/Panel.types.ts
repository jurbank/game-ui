import type { HTMLAttributes, ReactNode, Ref } from "react";

export type PanelVariant = "default" | "raised" | "inset";

export type PanelPadding = "none" | "sm" | "md" | "lg";

export type PanelHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  ref?: Ref<HTMLElement>;
  /**
   * Visible heading. When set, the panel renders as a `section` labelled by
   * the heading; otherwise it renders as a plain `div`.
   */
  title?: ReactNode;
  /** Heading element level for `title`, matching the surrounding document outline. */
  headingLevel?: PanelHeadingLevel;
  variant?: PanelVariant;
  padding?: PanelPadding;
}
