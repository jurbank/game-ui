import {
  Button,
  Modal,
  Panel,
  PlayerList,
  ProgressBar,
  Scoreboard,
  Timer,
  type PlayerEntry,
  type ScoreboardRow,
} from "@gameui/ui/react";
import { healthTone, type Pilot } from "../world-game/game";

/** The local player. Game policy: which pilot "you" are. */
export const SELF_ID = "nova";

/** Everything the HUD shows. Plain data, so any state source can supply it. */
export interface SquadHudState {
  pilots: readonly Pilot[];
  selectedId: string;
  remainingMs: number;
  paused: boolean;
}

/** Everything the HUD can ask for. The game validates and applies each request. */
export interface SquadHudActions {
  select(id: string): void;
  changeHealth(id: string, delta: number): void;
  awardScore(id: string, points: number): void;
  setPaused(paused: boolean): void;
  restart(): void;
}

export interface SquadHudProps extends SquadHudState {
  actions: SquadHudActions;
}

/** Game policy: ranking and ties are decided here, not by Scoreboard. */
export function standings(pilots: readonly Pilot[]): ScoreboardRow[] {
  return [...pilots]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map((pilot, index) => ({
      id: pilot.id,
      name: pilot.name,
      rank: index + 1,
      score: pilot.score.toLocaleString("en-US"),
      values: { health: pilot.health },
      status: pilot.health === 0 ? "Down" : undefined,
      statusTone: "danger",
      self: pilot.id === SELF_ID,
      highlight: index === 0,
    }));
}

/**
 * Screen HUD for the squad match. It depends on props and callbacks only:
 * no store, no context, and no knowledge of the canvas scene.
 */
export function SquadHud({ pilots, selectedId, remainingMs, paused, actions }: SquadHudProps) {
  const selected = pilots.find((pilot) => pilot.id === selectedId) ?? pilots[0]!;
  const roundOver = remainingMs === 0;
  const rows = standings(pilots);
  const timeTone = remainingMs <= 10_000 ? "danger" : remainingMs <= 30_000 ? "warning" : "default";

  const squad: PlayerEntry[] = pilots.map((pilot) => ({
    id: pilot.id,
    name: pilot.name,
    self: pilot.id === SELF_ID,
    detail: `${pilot.health} HP`,
    status: pilot.health === 0 ? "Down" : "Alive",
    statusTone: pilot.health === 0 ? "danger" : "success",
    actions: (
      <Button
        size="sm"
        variant="secondary"
        aria-label={`Select ${pilot.name}`}
        aria-pressed={pilot.id === selectedId}
        onClick={() => actions.select(pilot.id)}
      >
        Select
      </Button>
    ),
  }));

  const scoreboard = (caption: string) => (
    <Scoreboard
      caption={caption}
      hideCaption
      columns={[{ id: "health", header: "HP" }]}
      rows={rows}
      size="sm"
    />
  );

  return (
    <>
      <div className="demo-hud-top">
        <Timer label="Round 3" value={remainingMs} variant={timeTone} size="lg" />
        <Button onClick={() => actions.setPaused(true)} disabled={roundOver}>
          Pause (P)
        </Button>
      </div>

      <div className="demo-hud-main">
        <Panel title="Squad" headingLevel={3} padding="sm">
          <PlayerList aria-label="Squad" players={squad} size="sm" />
        </Panel>

        <Panel title={selected.name} headingLevel={3} padding="sm">
          <div className="example-stack">
            <ProgressBar
              label={`${selected.name} health`}
              value={selected.health}
              max={selected.max}
              variant={healthTone(selected.health)}
              showValue
            />
            <div className="example-row demo-hud-controls">
              <Button
                variant="danger"
                disabled={roundOver}
                onClick={() => actions.changeHealth(selected.id, -10)}
              >
                Damage 10
              </Button>
              <Button
                variant="secondary"
                disabled={roundOver}
                onClick={() => actions.changeHealth(selected.id, 10)}
              >
                Heal 10
              </Button>
              <Button
                variant="secondary"
                disabled={roundOver}
                onClick={() => actions.awardScore(selected.id, 150)}
              >
                Score 150
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="Standings" headingLevel={3} padding="sm">
          {scoreboard("Live standings")}
        </Panel>
      </div>

      <Modal
        open={paused && !roundOver}
        onClose={() => actions.setPaused(false)}
        title="Paused"
        description="The clock, movement, and world input are frozen until you resume."
        size="sm"
        actions={
          <>
            <Button variant="danger" onClick={() => actions.restart()}>
              Restart round
            </Button>
            <Button onClick={() => actions.setPaused(false)}>Resume</Button>
          </>
        }
      />

      <Modal
        open={roundOver}
        dismissible={false}
        title="Round over"
        description="Final standings for this round."
        actions={<Button onClick={() => actions.restart()}>Play again</Button>}
      >
        {scoreboard("Final standings")}
      </Modal>
    </>
  );
}
