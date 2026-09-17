import type { FormattedDuration, TimerHours, TimerPrecision } from "./Timer.types.ts";

const fractionDigits: Record<TimerPrecision, number> = {
  seconds: 0,
  tenths: 1,
  hundredths: 2,
};

/** Shown when the time is unknown, so a broken value cannot read as `0:00`. */
function placeholder(precision: TimerPrecision, hours: TimerHours): FormattedDuration {
  const digits = fractionDigits[precision];
  const fraction = digits > 0 ? `.${"-".repeat(digits)}` : "";
  return {
    text: `${hours === "always" ? "--:--:--" : "--:--"}${fraction}`,
    dateTime: undefined,
  };
}

/**
 * Formats milliseconds as a clock reading. Time is truncated rather than
 * rounded, so a value never reads as a unit it has not reached.
 */
export function formatDuration(
  value: number,
  precision: TimerPrecision = "seconds",
  hours: TimerHours = "auto",
): FormattedDuration {
  if (!Number.isFinite(value)) return placeholder(precision, hours);

  // A countdown that runs past zero reads as zero rather than negative time.
  const total = Math.max(0, value);
  const digits = fractionDigits[precision];
  const scale = 10 ** digits;
  // Truncate to the displayed precision first so the parts never disagree,
  // as in 59.99s showing as 1:00 in one part and 59 in another.
  const truncated = Math.floor((total / 1000) * scale) / scale;

  const wholeSeconds = Math.floor(truncated);
  const hourPart = Math.floor(wholeSeconds / 3600);
  const minutePart = Math.floor((wholeSeconds % 3600) / 60);
  const secondPart = wholeSeconds % 60;
  const fraction = truncated - wholeSeconds;

  const showHours = hours === "always" || (hours === "auto" && hourPart > 0);
  const seconds = String(secondPart).padStart(2, "0");
  const minutes = showHours ? String(minutePart).padStart(2, "0") : String(minutePart);
  const fractionText = digits > 0 ? fraction.toFixed(digits).slice(1) : "";

  // `never` folds any hours into the minutes, so no elapsed time is hidden.
  const foldedMinutes = showHours ? minutes : String(hourPart * 60 + minutePart);

  return {
    text: `${showHours ? `${hourPart}:` : ""}${foldedMinutes}:${seconds}${fractionText}`,
    dateTime: `PT${hourPart}H${minutePart}M${(secondPart + fraction).toFixed(digits)}S`,
  };
}
