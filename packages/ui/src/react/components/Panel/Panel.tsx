import { useId, type Ref } from "react";
import { panelBase, panelPaddings, panelTitle, panelVariants } from "./Panel.styles.ts";
import type { PanelProps } from "./Panel.types.ts";

export function Panel({
  title,
  headingLevel = 2,
  variant = "default",
  padding = "md",
  className,
  children,
  ref,
  ...props
}: PanelProps) {
  const headingId = useId();
  const classes = [panelBase, panelVariants[variant], panelPaddings[padding], className]
    .filter(Boolean)
    .join(" ");

  if (title === undefined || title === null) {
    return (
      <div {...props} ref={ref as Ref<HTMLDivElement>} data-variant={variant} className={classes}>
        {children}
      </div>
    );
  }

  const Heading = `h${headingLevel}` as const;
  return (
    <section
      aria-labelledby={headingId}
      {...props}
      ref={ref}
      data-variant={variant}
      className={classes}
    >
      <Heading id={headingId} className={panelTitle}>
        {title}
      </Heading>
      {children}
    </section>
  );
}
