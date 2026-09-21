import { useEffect, useState } from "react";
import { watchTouchInput } from "../../../input/index.ts";
import type { TouchControlsProps } from "./TouchControls.types.ts";

const prefersTouch = () =>
  typeof window !== "undefined" && (window.matchMedia?.("(pointer: coarse)").matches ?? false);

/**
 * Renders its children, such as `VirtualStick` and `TouchButton`, only while
 * they are wanted. Adds no element, so children can be `HudSlot`s or a
 * dynamic stick placed directly in `HudLayer`.
 */
export function TouchControls({ show = "auto", children }: TouchControlsProps) {
  const [touch, setTouch] = useState(prefersTouch);

  useEffect(() => {
    if (show !== "auto") return;
    return watchTouchInput(setTouch);
  }, [show]);

  const visible = show === "always" || (show === "auto" && touch);
  return visible ? children : null;
}
