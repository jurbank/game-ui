---
"@gameui/ui": minor
---

Add on-screen touch controls: `VirtualStick`, `TouchButton`, and `TouchControls` in `@gameui/ui/react`, driven by new controllers in `@gameui/ui/input`.

- `createStick({ deadzone, snap })` and `createTouchButton()` hold touch input for the game to poll on its own tick, like held keys. `read()` gives the stick's `{ x, y, magnitude, active }`; `consumePress()` catches taps shorter than a tick. No React and no engine.
- `VirtualStick` is a static stick in a `HudSlot`, or a dynamic one that appears under the thumb anywhere in the left, right, or whole `HudLayer`. It moves its knob without re-rendering React.
- `TouchButton` is a round action button. Controls track their own fingers, so players can steer and press at once.
- `TouchControls` shows its children only while the player uses touch; `watchTouchInput()` in `@gameui/ui/input` exposes the same detection without React.
