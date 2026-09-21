import { Progress } from "@base-ui/react/progress";
import {
  progressHeader,
  progressIndicator,
  progressIndicatorVariants,
  progressRoot,
  progressTrack,
  progressTrackSizes,
  progressValue,
} from "./ProgressBar.styles.ts";
import type { ProgressBarProps } from "./ProgressBar.types.ts";

export function ProgressBar({
  value,
  min = 0,
  max = 100,
  label,
  showValue = false,
  format,
  locale,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ProgressBarProps) {
  // A range that cannot represent progress, such as `max` below `min` or a
  // missing bound, renders an empty bar rather than a NaN width.
  const hasRange = Number.isFinite(min) && Number.isFinite(max) && max > min;
  const resolvedMin = hasRange ? min : 0;
  const resolvedMax = hasRange ? max : 100;
  const resolvedValue = hasRange ? value : value === null ? null : resolvedMin;

  return (
    <Progress.Root
      {...props}
      value={resolvedValue}
      min={resolvedMin}
      max={resolvedMax}
      format={format}
      locale={locale}
      data-variant={variant}
      data-size={size}
      className={[progressRoot, className].filter(Boolean).join(" ")}
    >
      {(label !== undefined && label !== null) || showValue ? (
        <div className={progressHeader}>
          <Progress.Label>{label}</Progress.Label>
          {showValue && <Progress.Value className={progressValue} />}
        </div>
      ) : null}
      <Progress.Track className={[progressTrack, progressTrackSizes[size]].join(" ")}>
        <Progress.Indicator
          data-game-part="indicator"
          className={[progressIndicator, progressIndicatorVariants[variant]].join(" ")}
        />
      </Progress.Track>
    </Progress.Root>
  );
}
