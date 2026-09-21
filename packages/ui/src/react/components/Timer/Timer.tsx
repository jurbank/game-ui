import { useId } from "react";
import { formatDuration } from "./Timer.format.ts";
import { timerLabel, timerRoot, timerSizes, timerTime, timerVariants } from "./Timer.styles.ts";
import type { TimerProps } from "./Timer.types.ts";

export function Timer({
  value,
  precision = "seconds",
  hours = "auto",
  label,
  variant = "default",
  size = "md",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: TimerProps) {
  const labelId = useId();
  const { text, dateTime } = formatDuration(value, precision, hours);
  const hasLabel = label !== undefined && label !== null;

  return (
    <div
      {...props}
      data-variant={variant}
      data-size={size}
      className={[timerRoot, className].filter(Boolean).join(" ")}
    >
      {hasLabel && (
        <span id={labelId} className={timerLabel}>
          {label}
        </span>
      )}
      <time
        // The timer role names the reading without announcing every tick;
        // announce thresholds from game code where they matter.
        role="timer"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (hasLabel && !ariaLabel ? labelId : undefined)}
        dateTime={dateTime}
        data-game-part="time"
        className={[timerTime, timerVariants[variant], timerSizes[size]].join(" ")}
      >
        {text}
      </time>
    </div>
  );
}
