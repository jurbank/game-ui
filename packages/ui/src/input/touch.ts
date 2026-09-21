/**
 * On-screen touch controls: virtual sticks and buttons.
 *
 * Controllers hold input state that the game polls on its own tick, the same
 * way it reads held keys. Views (the React `VirtualStick` and `TouchButton`,
 * or anything a game draws itself) feed pointer input in and subscribe to
 * redraw. No React and no engine.
 */

type Listener = () => void;

function createEmitter() {
  const listeners = new Set<Listener>();
  return {
    emit: () => listeners.forEach((listener) => listener()),
    subscribe: (listener: Listener): (() => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** How a stick's direction is snapped. `none` keeps it analog. */
export type StickSnap = "none" | "4way" | "8way";

export interface StickOptions {
  /**
   * Fraction of the stick's travel, from 0 to 1, that reads as no input, so a
   * resting thumb does not drift. Output ramps from 0 at the edge of the dead
   * zone to 1 at full travel. Defaults to 0.15.
   */
  deadzone?: number;
  /** Snap the direction to 4 or 8 directions. The magnitude stays analog. Defaults to `none`. */
  snap?: StickSnap;
}

/** A stick reading. `x` is positive to the right and `y` positive downward, like the screen. */
export interface StickState {
  /** From -1 to 1. */
  x: number;
  /** From -1 to 1. */
  y: number;
  /** Length of `(x, y)`, from 0 to 1. */
  magnitude: number;
  /** True while a finger (or the mouse) is on the stick, even inside the dead zone. */
  active: boolean;
}

export interface Stick {
  /** The current reading. Call it wherever the game samples input. */
  read(): StickState;
  /**
   * Where the knob sits, as a fraction of the stick's travel, before the dead
   * zone and snapping. For drawing the stick, not for gameplay.
   */
  knob(): { x: number; y: number };
  /**
   * Called by a view while the stick is held: the pointer's offset from the
   * stick's center divided by its travel radius. Offsets past the rim clamp to it.
   */
  move(x: number, y: number): void;
  /** Called by a view when the finger lifts. Also use it to drop input, such as on pause. */
  release(): void;
  /** Runs `listener` after every change. Returns a function that unsubscribes. */
  subscribe(listener: Listener): () => void;
}

const IDLE_STICK: StickState = { x: 0, y: 0, magnitude: 0, active: false };

/** A virtual analog stick. Create one per stick, outside React, and poll `read()` from the game. */
export function createStick({ deadzone = 0.15, snap = "none" }: StickOptions = {}): Stick {
  const dead = Math.min(Math.max(deadzone, 0), 0.99);
  const { emit, subscribe } = createEmitter();
  let knobX = 0;
  let knobY = 0;
  let state = IDLE_STICK;

  return {
    read: () => state,
    knob: () => ({ x: knobX, y: knobY }),
    subscribe,
    move(x, y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const length = Math.hypot(x, y);
      const scale = length > 1 ? 1 / length : 1;
      knobX = x * scale;
      knobY = y * scale;
      state = { ...toOutput(knobX, knobY, Math.min(length, 1), dead, snap), active: true };
      emit();
    },
    release() {
      if (!state.active) return;
      knobX = 0;
      knobY = 0;
      state = IDLE_STICK;
      emit();
    },
  };
}

function toOutput(x: number, y: number, length: number, dead: number, snap: StickSnap) {
  if (length <= dead) return { x: 0, y: 0, magnitude: 0 };
  const magnitude = (length - dead) / (1 - dead);
  let angle = Math.atan2(y, x);
  if (snap !== "none") {
    const step = snap === "4way" ? Math.PI / 2 : Math.PI / 4;
    angle = Math.round(angle / step) * step;
  }
  return {
    // Rounding keeps snapped axes exactly 0 instead of values such as 6e-17.
    x: round(Math.cos(angle) * magnitude),
    y: round(Math.sin(angle) * magnitude),
    magnitude,
  };
}

function round(value: number): number {
  const rounded = Math.round(value * 1e6) / 1e6;
  return rounded === 0 ? 0 : rounded;
}

export interface TouchButtonControl {
  /** True while the button is held down. */
  readonly held: boolean;
  /**
   * True if the button was pressed since the last call, then resets. Catches
   * taps shorter than a game tick, which `held` alone can miss.
   */
  consumePress(): boolean;
  /** Called by a view when a finger goes down on the button. */
  press(): void;
  /** Called by a view when the finger lifts. Also use it to drop input, such as on pause. */
  release(): void;
  /** Runs `listener` after every change. Returns a function that unsubscribes. */
  subscribe(listener: Listener): () => void;
}

/** An on-screen action button. Create one per button, outside React, and poll it from the game. */
export function createTouchButton(): TouchButtonControl {
  const { emit, subscribe } = createEmitter();
  let held = false;
  let pressed = false;

  return {
    get held() {
      return held;
    },
    consumePress() {
      const result = pressed;
      pressed = false;
      return result;
    },
    press() {
      if (held) return;
      held = true;
      pressed = true;
      emit();
    },
    release() {
      if (!held) return;
      held = false;
      emit();
    },
    subscribe,
  };
}

export interface WatchTouchInputOptions {
  /** Where to listen. Defaults to `window`. */
  target?: Pick<Window, "addEventListener" | "removeEventListener" | "matchMedia">;
  doc?: Document;
}

/**
 * Tracks whether the player is using touch, to show touch controls only then.
 * Starts from whether the main pointer is coarse, then follows the last input:
 * a touch or pen turns it on; a mouse click or key press turns it off. Keys
 * typed into focused UI, such as a phone's on-screen keyboard filling in a
 * name, are ignored.
 *
 * Calls `listener` right away and on every change. Returns a function that stops watching.
 */
export function watchTouchInput(
  listener: (touch: boolean) => void,
  { target = window, doc = document }: WatchTouchInputOptions = {},
): () => void {
  let touch = target.matchMedia?.("(pointer: coarse)").matches ?? false;
  listener(touch);

  const set = (next: boolean) => {
    if (next === touch) return;
    touch = next;
    listener(touch);
  };
  const onPointerDown = (event: Event) => {
    const { pointerType } = event as PointerEvent;
    if (pointerType === "touch" || pointerType === "pen") set(true);
    else if (pointerType === "mouse") set(false);
  };
  const onKeyDown = () => {
    if (!textEntryHasFocus(doc)) set(false);
  };

  // Capture phase, so handlers that stop propagation cannot hide the input.
  target.addEventListener("pointerdown", onPointerDown, true);
  target.addEventListener("keydown", onKeyDown, true);
  return () => {
    target.removeEventListener("pointerdown", onPointerDown, true);
    target.removeEventListener("keydown", onKeyDown, true);
  };
}

/** True when a text entry has focus, so key presses may come from an on-screen keyboard. */
function textEntryHasFocus(doc: Document): boolean {
  const focused = doc.activeElement;
  return (
    focused instanceof doc.defaultView!.HTMLElement &&
    focused.closest("input, textarea, select, [contenteditable]:not([contenteditable=false])") !==
      null
  );
}
