import { Button, HudLayer, HudSlot, Panel, ProgressBar, Timer } from "@gameui/ui/react";
import { useState } from "react";

/**
 * A stand-in game view with a HUD over it. Clicks on the empty "arena" reach
 * the game underneath; the counter shows it.
 */
export function HudOverGame() {
  const [clicks, setClicks] = useState(0);
  return (
    <div className="hud-demo-arena" onClick={() => setClicks((count) => count + 1)}>
      <p className="hud-demo-hint">Game area: clicks here reach the game ({clicks})</p>
      <HudLayer position="absolute" inset="sm">
        <HudSlot placement="top-left">
          <Panel variant="raised" padding="sm">
            <Timer label="Round" value={83_000} size="sm" />
          </Panel>
        </HudSlot>
        <HudSlot placement="top-right">
          <Button size="sm" variant="secondary" onClick={(event) => event.stopPropagation()}>
            Pause
          </Button>
        </HudSlot>
        <HudSlot placement="bottom-left">
          <Panel variant="raised" padding="sm" className="hud-demo-vitals">
            <ProgressBar label="Health" value={72} variant="success" size="sm" />
            <ProgressBar label="Shield" value={30} size="sm" />
          </Panel>
        </HudSlot>
        <HudSlot placement="bottom">
          <Panel variant="inset" padding="sm">
            Press E to open
          </Panel>
        </HudSlot>
      </HudLayer>
    </div>
  );
}
