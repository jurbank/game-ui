import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import { touchButtonBase, touchButtonSizes, touchButtonVariants } from "./TouchButton.styles.ts";
import type { TouchButtonProps } from "./TouchButton.types.ts";

/**
 * An on-screen action button for touch play. It writes to `control`, which
 * the game polls; pressing it never re-renders React. Several can be held at
 * once, alongside a `VirtualStick`.
 */
export function TouchButton({
  control,
  variant = "primary",
  size = "md",
  className,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onContextMenu,
  ref,
  ...props
}: TouchButtonProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pointerId = useRef<number | null>(null);

  useEffect(() => {
    const draw = () => rootRef.current?.toggleAttribute("data-pressed", control.held);
    draw();
    const unsubscribe = control.subscribe(draw);
    return () => {
      unsubscribe();
      // Hidden or unmounted mid-press: don't leave the game holding the button.
      if (pointerId.current !== null) {
        pointerId.current = null;
        control.release();
      }
    };
  }, [control]);

  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) return;
    pointerId.current = null;
    control.release();
  };

  return (
    <div
      aria-hidden
      {...props}
      ref={(element) => {
        rootRef.current = element;
        if (typeof ref === "function") return ref(element);
        if (ref) ref.current = element;
      }}
      data-variant={variant}
      data-size={size}
      className={[touchButtonBase, touchButtonVariants[variant], touchButtonSizes[size], className]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || pointerId.current !== null) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        // Keeps focus where it was and stops emulated mouse events after a touch.
        event.preventDefault();
        pointerId.current = event.pointerId;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Synthetic pointers cannot be captured; the press still works.
        }
        control.press();
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        end(event);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        end(event);
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event);
        end(event);
      }}
      onContextMenu={(event: MouseEvent<HTMLDivElement>) => {
        onContextMenu?.(event);
        // A long press would otherwise open the context menu on Android.
        event.preventDefault();
      }}
    />
  );
}
