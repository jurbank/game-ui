import type { ReactNode } from "react";

/**
 * `auto` shows the controls while the player is using touch (see
 * `watchTouchInput` in `@gameui/ui/input`). `always` suits touch-only games
 * and testing on a desktop; `never` suits a "hide touch controls" setting.
 */
export type TouchControlsShow = "auto" | "always" | "never";

export interface TouchControlsProps {
  /** Defaults to `auto`. */
  show?: TouchControlsShow;
  children?: ReactNode;
}
