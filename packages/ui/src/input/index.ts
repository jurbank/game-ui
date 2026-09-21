/**
 * Keyboard ownership between a game and the screen UI over it.
 *
 * Games read keys globally, so a HUD control with focus competes with the game
 * for the same keys: arrows move a slider and the player, Space presses a
 * focused button and jumps. These helpers decide which side owns the keyboard.
 * DOM only: no React and no engine, so any renderer can use them.
 */

/**
 * Focus inside any of these means the UI is using the keyboard. Add the
 * `data-game-ui-keyboard` attribute to custom widgets that need keys too.
 */
export const UI_KEYBOARD_SELECTOR = [
  "input",
  "textarea",
  "select",
  "[contenteditable]:not([contenteditable=false])",
  "[role=dialog]",
  "[role=alertdialog]",
  "[role=slider]",
  "[role=spinbutton]",
  "[role=tablist]",
  "[role=menu]",
  "[role=menubar]",
  "[role=listbox]",
  "[role=combobox]",
  "[role=radiogroup]",
  "[data-game-ui-keyboard]",
].join(", ");

/**
 * True when focused UI is using the keyboard, so the game should ignore key
 * input (and stop capturing keys, if its engine does). Check it each frame
 * or on each key event; it is cheap.
 */
export function uiOwnsKeyboard(doc: Document = document): boolean {
  const focused = doc.activeElement;
  return (
    focused instanceof doc.defaultView!.Element && focused.closest(UI_KEYBOARD_SELECTOR) !== null
  );
}

export interface ReleaseFocusOptions {
  /**
   * `KeyboardEvent.code` values the game uses, such as `["Space", "KeyW"]`.
   * When one is pressed while a plain control such as a button has focus,
   * focus returns to the page so the key does not also activate the control.
   */
  keys: Iterable<string>;
  /** Where to listen. Defaults to `window`. */
  target?: Pick<Window, "addEventListener" | "removeEventListener">;
  doc?: Document;
}

/**
 * Stops game keys from also activating the last clicked HUD button: after
 * clicking "Invite", Space should jump, not invite again. Controls that use
 * the keyboard (see `uiOwnsKeyboard`) keep focus.
 *
 * Never calls `preventDefault`: engines such as Phaser ignore key events that
 * are already default-prevented. Returns a function that removes the listener.
 */
export function releaseFocusOnGameKeys({
  keys,
  target = window,
  doc = document,
}: ReleaseFocusOptions): () => void {
  const gameKeys = new Set(keys);
  const onKeyDown = (event: Event) => {
    const code = (event as KeyboardEvent).code;
    if (!gameKeys.has(code) || uiOwnsKeyboard(doc)) return;
    const focused = doc.activeElement;
    if (focused instanceof doc.defaultView!.HTMLElement && focused !== doc.body) focused.blur();
  };
  // Capture phase: blur before the focused control sees the key.
  target.addEventListener("keydown", onKeyDown, true);
  return () => target.removeEventListener("keydown", onKeyDown, true);
}
