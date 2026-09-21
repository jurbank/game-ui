import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import {
  stickBase,
  stickBaseDynamic,
  stickBaseSizes,
  stickKnob,
  stickZone,
  stickZoneAreas,
} from "./VirtualStick.styles.ts";
import type { VirtualStickProps } from "./VirtualStick.types.ts";

/** The pointer holding the stick, the stick's center in client pixels, and its travel. */
interface Grip {
  id: number;
  x: number;
  y: number;
  radius: number;
}

/**
 * An on-screen analog stick. It writes to `control` and moves its knob
 * directly, so dragging never re-renders React; the game polls the control.
 */
export function VirtualStick({
  control,
  mode = "static",
  area = "left",
  size = "md",
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onContextMenu,
  ...props
}: VirtualStickProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const grip = useRef<Grip | null>(null);

  useEffect(() => {
    const draw = () => {
      const knob = knobRef.current;
      const base = knob?.parentElement;
      if (!knob || !base) return;
      const { x, y } = control.knob();
      const radius = grip.current?.radius ?? base.offsetWidth / 2;
      knob.style.translate = x === 0 && y === 0 ? "" : `${x * radius}px ${y * radius}px`;
      base.toggleAttribute("data-active", control.read().active);
    };
    draw();
    const unsubscribe = control.subscribe(draw);
    return () => {
      unsubscribe();
      // Hidden or unmounted mid-drag: don't leave the game holding a direction.
      if (grip.current) {
        grip.current = null;
        control.release();
      }
    };
  }, [control]);

  const start = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || grip.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const base = knobRef.current?.parentElement;
    if (!base) return;
    // Keeps focus where it was and stops emulated mouse events after a touch.
    event.preventDefault();

    const radius = Math.max(base.offsetWidth / 2, 1);
    let x: number;
    let y: number;
    if (mode === "dynamic") {
      // Center the stick under the thumb, kept inside the zone.
      const zone = event.currentTarget.getBoundingClientRect();
      x = clampInside(event.clientX, zone.left, zone.right, radius);
      y = clampInside(event.clientY, zone.top, zone.bottom, radius);
      base.style.translate = `${x - zone.left - radius}px ${y - zone.top - radius}px`;
    } else {
      const rect = base.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    grip.current = { id: event.pointerId, x, y, radius };
    capture(event.currentTarget, event.pointerId);
    control.move((event.clientX - x) / radius, (event.clientY - y) / radius);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const held = grip.current;
    if (!held || held.id !== event.pointerId) return;
    control.move((event.clientX - held.x) / held.radius, (event.clientY - held.y) / held.radius);
  };

  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (grip.current?.id !== event.pointerId) return;
    grip.current = null;
    control.release();
  };

  const handlers = {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
      onPointerUp?.(event);
      end(event);
    },
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => {
      onPointerCancel?.(event);
      end(event);
    },
    onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
      onLostPointerCapture?.(event);
      end(event);
    },
    onContextMenu: (event: MouseEvent<HTMLDivElement>) => {
      onContextMenu?.(event);
      // A long press would otherwise open the context menu on Android.
      event.preventDefault();
    },
  };

  // The knob's parent is the base in both modes: a static stick is its own base.
  const knob = <div ref={knobRef} data-game-part="knob" className={stickKnob} />;

  if (mode === "dynamic") {
    return (
      <div
        aria-hidden
        {...props}
        {...handlers}
        data-mode={mode}
        data-area={area}
        data-size={size}
        className={[stickZone, stickZoneAreas[area], className].filter(Boolean).join(" ")}
      >
        <div
          data-game-part="base"
          className={[stickBase, stickBaseDynamic, stickBaseSizes[size]].join(" ")}
        >
          {knob}
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      {...props}
      {...handlers}
      data-mode={mode}
      data-size={size}
      className={[stickBase, stickBaseSizes[size], className].filter(Boolean).join(" ")}
    >
      {knob}
    </div>
  );
}

/** Keeps a circle of `radius` centered at `value` inside `[min, max]`, if it fits. */
function clampInside(value: number, min: number, max: number, radius: number): number {
  if (max - min < radius * 2) return value;
  return Math.min(Math.max(value, min + radius), max - radius);
}

/** Keeps the pointer's events coming here even when it leaves the stick. */
function capture(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Synthetic or already-released pointers cannot be captured; the drag still works in bounds.
  }
}
