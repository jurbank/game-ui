import { Button, Panel, PlayerList, ProgressBar, Timer, type PlayerEntry } from "@gameui/react";

const players: PlayerEntry[] = [
  { id: "p1", name: "Nova", status: "Ready", statusTone: "success", detail: "1,240", self: true },
  { id: "p2", name: "Rook", status: "Waiting", statusTone: "warning", detail: "980" },
];

/**
 * One sample of screen UI, rendered identically in every theme. Nothing here
 * changes per theme: only the token values around it do.
 */
export function ThemeShowcase() {
  return (
    <Panel title="Round 3" headingLevel={3} variant="raised">
      <div className="example-stack">
        <Timer label="Time remaining" value={62_000} size="lg" />
        <ProgressBar label="Health" value={72} variant="success" showValue />
        <PlayerList aria-label="Squad" players={players} size="sm" />
      </div>
      <div className="example-row">
        <Button>Ready up</Button>
        <Button variant="secondary">Loadout</Button>
        <Button variant="danger">Leave</Button>
      </div>
    </Panel>
  );
}
