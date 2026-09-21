import { Field } from "@base-ui/react/field";
import {
  textFieldDescription,
  textFieldError,
  textFieldInput,
  textFieldInputSizes,
  textFieldLabel,
  textFieldRoot,
} from "./TextField.styles.ts";
import type { TextFieldProps } from "./TextField.types.ts";

export function TextField({
  label,
  description,
  error,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  name,
  size = "md",
  className,
  ...props
}: TextFieldProps) {
  const invalid = error !== undefined && error !== null && error !== false;
  return (
    <Field.Root
      invalid={invalid}
      disabled={disabled}
      name={name}
      data-size={size}
      className={[textFieldRoot, className].filter(Boolean).join(" ")}
    >
      {label !== undefined && label !== null && (
        <Field.Label className={textFieldLabel}>{label}</Field.Label>
      )}
      <Field.Control
        {...props}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange && ((next) => onValueChange(next))}
        className={[textFieldInput, textFieldInputSizes[size]].join(" ")}
      />
      {description !== undefined && description !== null && (
        <Field.Description className={textFieldDescription}>{description}</Field.Description>
      )}
      {invalid && (
        <Field.Error match className={textFieldError}>
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}
