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
import { useEffect, useReducer } from "react";

const ROUND_MS = 120_000;

interface Player {
  id: string;
  name: string;
  health: number;
  score: number;
}

interface MatchState {
  remaining: number;
  paused: boolean;
  showScoreboard: boolean;
  players: Player[];
}

type MatchAction =
  | { type: "tick"; elapsed: number }
  | { type: "damage" }
  | { type: "heal" }
  | { type: "score" }
  | { type: "pause"; open: boolean }
  | { type: "scoreboard"; open: boolean }
  | { type: "reset" };

const initialState: MatchState = {
  remaining: ROUND_MS,
  paused: false,
  showScoreboard: false,
  players: [
    { id: "p1", name: "Nova", health: 84, score: 1240 },
    { id: "p2", name: "Rook", health: 51, score: 980 },
    { id: "p3", name: "Wisp", health: 0, score: 1510 },
    { id: "p4", name: "Kite", health: 96, score: 720 },
  ],
};

/** The whole match lives in this reducer, inside the example. */
function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case "tick":
      return { ...state, remaining: Math.max(0, state.remaining - action.elapsed) };
    case "damage":
      return {
        ...state,
        players: state.players.map((player, index) =>
          index === 0 ? { ...player, health: Math.max(0, player.health - 18) } : player,
        ),
      };
    case "heal":
      return {
        ...state,
        players: state.players.map((player, index) =>
          index === 0 ? { ...player, health: Math.min(100, player.health + 18) } : player,
        ),
      };
    case "score":
      return {
        ...state,
        players: state.players.map((player, index) =>
          index === 0 ? { ...player, score: player.score + 150 } : player,
        ),
      };
    case "pause":
      return { ...state, paused: action.open };
    case "scoreboard":
      return { ...state, showScoreboard: action.open };
    case "reset":
      return initialState;
  }
}

export function MatchDemo() {
  const [state, dispatch] = useReducer(matchReducer, initialState);
  const self = state.players[0]!;
  const roundOver = state.remaining === 0;

  // The clock. A real game would advance this from its own loop or server.
  useEffect(() => {
    if (state.paused || roundOver) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const elapsed = now - last;
      last = now;
      dispatch({ type: "tick", elapsed });
    }, 250);
    return () => clearInterval(id);
    // Restarting the interval on every tick would drift; the clock stops only
    // when the round ends or the game pauses.
  }, [state.paused, roundOver]);

  // Game keybindings. The UI components do not listen for keys themselves.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "p" || event.key === "P") {
        dispatch({ type: "pause", open: !state.paused });
      }
      if (event.key === "s" || event.key === "S") {
        dispatch({ type: "scoreboard", open: !state.showScoreboard });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.paused, state.showScoreboard]);

  const healthTone = self.health > 50 ? "success" : self.health > 20 ? "warning" : "danger";
  const timeTone =
    state.remaining <= 10_000 ? "danger" : state.remaining <= 30_000 ? "warning" : "default";

  const squad: PlayerEntry[] = state.players.map((player) => ({
    id: player.id,
    name: player.name,
    self: player.id === self.id,
    detail: player.score.toLocaleString("en-US"),
    status: player.health === 0 ? "Down" : "Alive",
    statusTone: player.health === 0 ? "danger" : "success",
  }));

  const ranked = [...state.players].sort((a, b) => b.score - a.score);
  const rows: ScoreboardRow[] = ranked.map((player, index) => ({
    id: player.id,
    name: player.name,
    rank: String(index + 1),
    score: player.score.toLocaleString("en-US"),
    values: { health: player.health },
    self: player.id === self.id,
    highlight: index === 0,
  }));

  return (
    <div className="demo-hud">
      <div className="demo-hud-top">
        <Timer label="Round 3" value={state.remaining} variant={timeTone} size="lg" />
        <Panel padding="sm" className="demo-hud-objective">
          <p className="example-text">Hold the relay</p>
          <ProgressBar aria-label="Objective capture" value={64} size="sm" />
        </Panel>
      </div>

      <div className="demo-hud-main">
        <Panel title="Vitals" headingLevel={4} padding="sm" className="demo-hud-vitals">
          <div className="example-stack">
            <ProgressBar label="Health" value={self.health} variant={healthTone} showValue />
            <ProgressBar label="Shield" value={38} max={50} size="sm" />
          </div>
        </Panel>

        <Panel title="Squad" headingLevel={4} padding="sm" className="demo-hud-squad">
          <PlayerList aria-label="Squad" players={squad} size="sm" />
        </Panel>
      </div>

      {(state.showScoreboard || roundOver) && (
        <Panel
          title={roundOver ? "Round over" : "Standings"}
          headingLevel={4}
          variant="inset"
          padding="sm"
        >
          <Scoreboard
            caption={roundOver ? "Final scores" : "Live standings"}
            hideCaption
            columns={[{ id: "health", header: "HP" }]}
            rows={rows}
            size="sm"
          />
        </Panel>
      )}

      <div className="example-row demo-hud-controls">
        <Button variant="danger" onClick={() => dispatch({ type: "damage" })}>
          Take damage
        </Button>
        <Button variant="secondary" onClick={() => dispatch({ type: "heal" })}>
          Heal
        </Button>
        <Button variant="secondary" onClick={() => dispatch({ type: "score" })}>
          Score 150
        </Button>
        <Button
          aria-pressed={state.showScoreboard}
          onClick={() => dispatch({ type: "scoreboard", open: !state.showScoreboard })}
        >
          Scoreboard (S)
        </Button>
        <Button onClick={() => dispatch({ type: "pause", open: true })}>Pause (P)</Button>
      </div>

      <Modal
        open={state.paused}
        onClose={() => dispatch({ type: "pause", open: false })}
        title="Paused"
        description="The match continues for other players."
        size="sm"
        actions={
          <>
            <Button variant="danger" onClick={() => dispatch({ type: "reset" })}>
              Restart round
            </Button>
            <Button onClick={() => dispatch({ type: "pause", open: false })}>Resume</Button>
          </>
        }
      />
    </div>
  );
}
