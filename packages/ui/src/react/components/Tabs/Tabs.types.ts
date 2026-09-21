import type { ComponentPropsWithRef, ReactNode } from "react";

export type TabsSize = "sm" | "md";

export interface TabItem {
  /** Stable, unique identifier for this tab. */
  value: string;
  /** Tab button text. */
  label: ReactNode;
  /** Panel shown while this tab is selected. */
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children" | "defaultValue" | "onChange"
> {
  /** Tabs in display order. */
  tabs: readonly TabItem[];
  /** Selected tab, for controlled tabs. Pair with `onValueChange`. */
  value?: string;
  /** Starting tab, for uncontrolled tabs. Defaults to the first enabled tab. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the tab list, such as "Settings sections". */
  listLabel?: string;
  /** Keep inactive panels in the DOM, preserving their state. */
  keepMounted?: boolean;
  size?: TabsSize;
}
