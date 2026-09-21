import { buttonBase, buttonSizes, buttonVariants } from "./Button.styles.ts";
import type { ButtonProps } from "./Button.types.ts";

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      data-variant={variant}
      data-size={size}
      className={[buttonBase, buttonVariants[variant], buttonSizes[size], className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
