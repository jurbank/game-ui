import { Switch as BaseSwitch } from "@base-ui/react/switch";
import {
  switchLabel,
  switchThumb,
  switchThumbSizes,
  switchTrack,
  switchTrackSizes,
} from "./Switch.styles.ts";
import type { SwitchProps } from "./Switch.types.ts";

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  disabled = false,
  name,
  size = "md",
  className,
  ...props
}: SwitchProps) {
  const control = (
    <BaseSwitch.Root
      {...props}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange && ((next) => onCheckedChange(next))}
      disabled={disabled}
      name={name}
      data-size={size}
      className={[switchTrack, switchTrackSizes[size], label == null && className]
        .filter(Boolean)
        .join(" ")}
    >
      <BaseSwitch.Thumb className={[switchThumb, switchThumbSizes[size]].join(" ")} />
    </BaseSwitch.Root>
  );

  if (label === undefined || label === null) return control;

  // Wrapping in a <label> names the switch and makes the text clickable.
  return (
    <label className={[switchLabel, className].filter(Boolean).join(" ")}>
      {control}
      <span>{label}</span>
    </label>
  );
}
