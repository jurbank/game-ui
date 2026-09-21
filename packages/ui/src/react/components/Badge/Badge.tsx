import { badgeBase, badgeDot, badgeDotTones, badgeSizes, badgeTones } from "./Badge.styles.ts";
import type { BadgeProps } from "./Badge.types.ts";

export function Badge({
  tone = "default",
  size = "sm",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      data-tone={tone}
      data-size={size}
      className={[badgeBase, badgeTones[tone], badgeSizes[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && (
        <span
          aria-hidden="true"
          data-game-part="dot"
          className={`${badgeDot} ${badgeDotTones[tone]}`}
        />
      )}
      {children}
    </span>
  );
}
