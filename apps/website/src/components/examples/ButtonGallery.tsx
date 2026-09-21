import { Button, type ButtonSize, type ButtonVariant } from "@gameui/ui/react";

const variants: ButtonVariant[] = ["primary", "secondary", "danger"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];

export function ButtonVariants() {
  return (
    <div className="example-row">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
      <Button disabled>Disabled</Button>
    </div>
  );
}

export function ButtonSizes() {
  return (
    <div className="example-row">
      {sizes.map((size) => (
        <Button key={size} size={size}>
          Size {size}
        </Button>
      ))}
    </div>
  );
}
