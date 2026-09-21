import { kbdBase, kbdSizes } from "./Kbd.styles.ts";
import type { KbdProps } from "./Kbd.types.ts";

/** One key or button, drawn as a key cap. Compose several for chords and alternatives. */
export function Kbd({ size = "sm", className, ...props }: KbdProps) {
  return (
    <kbd
      {...props}
      data-size={size}
      className={[kbdBase, kbdSizes[size], className].filter(Boolean).join(" ")}
    />
  );
}
