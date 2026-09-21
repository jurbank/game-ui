import { Button, Panel } from "@gameui/ui/react";
import { useState } from "react";

/** Lobby ready check. Match state lives in this example, not in the framework. */
export function ReadyCheck() {
  const [ready, setReady] = useState(false);
  const readyCount = ready ? 4 : 3;

  return (
    <Panel title="Lobby" variant="raised" className="example-ready-check">
      <p className="example-text">
        {readyCount} of 4 players ready{readyCount === 4 ? ". Match starting…" : "."}
      </p>
      <div className="example-row">
        <Button aria-pressed={ready} onClick={() => setReady((value) => !value)}>
          {ready ? "Ready!" : "Ready up"}
        </Button>
        <Button variant="secondary">Loadout</Button>
        <Button variant="danger" disabled={ready}>
          Leave lobby
        </Button>
      </div>
    </Panel>
  );
}
