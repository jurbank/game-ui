import { Slider as BaseSlider } from "@base-ui/react/slider";
import {
  sliderControl,
  sliderHeader,
  sliderIndicator,
  sliderRoot,
  sliderThumb,
  sliderThumbSizes,
  sliderTrack,
  sliderTrackSizes,
  sliderValue,
} from "./Slider.styles.ts";
import type { SliderProps } from "./Slider.types.ts";

export function Slider({
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep,
  label,
  showValue = false,
  format,
  locale,
  disabled = false,
  name,
  size = "md",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SliderProps) {
  return (
    <BaseSlider.Root<number>
      {...props}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange && ((next) => onValueChange(next))}
      onValueCommitted={onValueCommitted && ((next) => onValueCommitted(next))}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      format={format}
      locale={locale}
      disabled={disabled}
      name={name}
      thumbAlignment="edge"
      data-size={size}
      className={[sliderRoot, className].filter(Boolean).join(" ")}
    >
      {(label !== undefined && label !== null) || showValue ? (
        <div className={sliderHeader}>
          <BaseSlider.Label>{label}</BaseSlider.Label>
          {showValue && <BaseSlider.Value className={sliderValue} />}
        </div>
      ) : null}
      <BaseSlider.Control className={sliderControl}>
        <BaseSlider.Track className={[sliderTrack, sliderTrackSizes[size]].join(" ")}>
          <BaseSlider.Indicator data-game-part="indicator" className={sliderIndicator} />
          <BaseSlider.Thumb
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            data-game-part="thumb"
            className={[sliderThumb, sliderThumbSizes[size]].join(" ")}
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
