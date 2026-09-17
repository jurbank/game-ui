import { Button, Panel, PlayerList, type PlayerEntry } from "@game-ui/react";
import { useState } from "react";

const roster: { id: string; name: string; score: number }[] = [
  { id: "p1", name: "Nova", score: 1240 },
  { id: "p2", name: "Rook", score: 980 },
  { id: "p3", name: "Wisp", score: 1510 },
  { id: "p4", name: "Bastion-Prime-Longname", score: 420 },
];

/**
 * A lobby roster. Readiness, ordering, and who may be removed are decided in
 * this example, not in the framework.
 */
export function LobbyRoster() {
  const [ready, setReady] = useState<string[]>(["p1", "p3"]);
  const [removed, setRemoved] = useState<string[]>([]);

  const players: PlayerEntry[] = roster
    .filter((player) => !removed.includes(player.id))
    .map((player) => ({
      id: player.id,
      name: player.name,
      self: player.id === "p1",
      status: ready.includes(player.id) ? "Ready" : "Waiting",
      statusTone: ready.includes(player.id) ? "success" : "warning",
      detail: player.score.toLocaleString("en-US"),
      actions:
        player.id === "p1" ? undefined : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setRemoved((r) => [...r, player.id])}
          >
            Kick
          </Button>
        ),
    }));

  return (
    <Panel title="Lobby" headingLevel={3} variant="raised">
      <PlayerList aria-label="Players in this lobby" players={players} empty="Everyone left." />
      <div className="example-row example-stack-top">
        <Button onClick={() => setReady(ready.length === 0 ? ["p1", "p3"] : [])}>
          Toggle ready
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setRemoved([]);
            setReady(["p1", "p3"]);
          }}
        >
          Reset lobby
        </Button>
      </div>
    </Panel>
  );
}

export function PlayerListStatuses() {
  const players: PlayerEntry[] = [
    { id: "p1", name: "Nova", status: "Ready", statusTone: "success" },
    { id: "p2", name: "Rook", status: "Picking", statusTone: "warning" },
    { id: "p3", name: "Wisp", status: "Eliminated", statusTone: "danger" },
    { id: "p4", name: "Kite", status: "Host", statusTone: "primary" },
    { id: "p5", name: "Ash", status: "Spectating" },
  ];
  return <PlayerList aria-label="Player statuses" players={players} />;
}

export function PlayerListEmpty() {
  return <PlayerList aria-label="Empty lobby" players={[]} empty="Waiting for players to join…" />;
}
