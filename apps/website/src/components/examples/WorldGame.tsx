import { Button, Panel, ProgressBar } from "@gameui/ui/react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { createGame, healthTone, type DemoGame } from "./world-game/game";
import { readPresentation } from "./world-game/presentation";
import { createScene, type DemoScene, type ProfileResult } from "./world-game/scene";

/** Narrow game-owned bindings; shared components stay controlled by props. */
export function WorldGameControls({ game }: { game: DemoGame }) {
  const selectedId = useStore(game.store, (state) => state.selectedId);
  const pilot = useStore(game.store, (state) =>
    state.pilots.find((entry) => entry.id === state.selectedId)!,
  );
  return (
    <Panel title="Squad link" headingLevel={3} padding="sm">
      <div className="example-stack">
        <div className="example-row" role="group" aria-label="Select pilot">
          {game.store.getInitialState().pilots.map((entry) => (
            <Button
              key={entry.id}
              size="sm"
              variant="secondary"
              aria-pressed={selectedId === entry.id}
              onClick={() => game.store.getState().selectEntity(entry.id)}
            >
              {entry.name}
            </Button>
          ))}
        </div>
        <ProgressBar
          label={`${pilot.name} health`}
          value={pilot.health}
          max={pilot.max}
          variant={healthTone(pilot.health)}
          showValue
        />
        <div className="example-row">
          <Button
            variant="danger"
            onClick={() => game.store.getState().changeHealth(selectedId, -10)}
          >
            Damage 10
          </Button>
          <Button
            variant="secondary"
            onClick={() => game.store.getState().changeHealth(selectedId, 10)}
          >
            Heal 10
          </Button>
        </div>
      </div>
    </Panel>
  );
}

export function WorldGame() {
  const [game] = useState(createGame);
  const [theme, setTheme] = useState("arcade");
  const [motion, setMotion] = useState(false);
  const [count, setCount] = useState<3 | 100 | 500>(3);
  const [running, setRunning] = useState(true);
  const [error, setError] = useState("");
  const [profiling, setProfiling] = useState(false);
  const [profile, setProfile] = useState<ProfileResult>();
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<DemoScene | null>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!running || !canvas.current || !root.current) return;
    try {
      scene.current = createScene(canvas.current, game, readPresentation(root.current));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Canvas could not start.");
    }
    return () => {
      scene.current?.dispose();
      scene.current = null;
    };
  }, [game, running]);

  useEffect(() => {
    if (root.current) scene.current?.setPresentation(readPresentation(root.current));
  }, [theme, running]);
  useEffect(() => {
    scene.current?.setMotion(motion);
  }, [motion, running]);
  useEffect(() => {
    scene.current?.setEntityCount(count);
    setProfiling(false);
    setProfile(undefined);
  }, [count, running]);

  return (
    <div ref={root} data-game-theme={theme} className="not-content example world-game">
      <div className="example-row world-game-settings">
        <label>
          Theme{" "}
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="arcade">Arcade</option>
            <option value="tactical">Tactical</option>
            <option value="playful">Playful</option>
          </select>
        </label>
        <Button
          size="sm"
          variant="secondary"
          aria-pressed={motion}
          onClick={() => setMotion(!motion)}
        >
          Camera and movement
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setRunning(!running)}>
          {running ? "Stop scene" : "Start scene"}
        </Button>
      </div>
      <p className="example-text">
        Click a pilot to select them and deal 10 damage. The controls below offer the same actions
        by keyboard.
      </p>
      <canvas
        ref={canvas}
        className="world-game-canvas"
        role="img"
        aria-label="Moving pilots with names and health bars. Use Squad link below to select a pilot and change health."
      />
      {!running && (
        <p role="status">Scene stopped. Start it to reconnect the current game state.</p>
      )}
      {error && <p role="alert">{error}</p>}
      <WorldGameControls game={game} />
      <details>
        <summary>Many-label measurement</summary>
        <div className="example-row world-game-settings">
          <label>
            Entities{" "}
            <select
              value={count}
              onChange={(event) => setCount(Number(event.target.value) as 3 | 100 | 500)}
            >
              <option value={3}>3</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </label>
          <Button
            size="sm"
            disabled={!running || !!error || profiling}
            onClick={() => {
              setProfiling(true);
              setProfile(undefined);
              scene.current?.profile((result) => {
                setProfile(result);
                setProfiling(false);
              });
            }}
          >
            Measure 300 frames
          </Button>
        </div>
        <p className="example-text" role="status">
          {profiling
            ? "Measuring… keep this tab visible."
            : profile
              ? `${profile.descriptors} descriptors · draw median ${profile.drawMedianMs.toFixed(2)} ms / p95 ${profile.drawP95Ms.toFixed(2)} ms · frame median ${profile.frameMedianMs.toFixed(2)} ms / p95 ${profile.frameP95Ms.toFixed(2)} ms · ${Math.round(profile.width)} × ${Math.round(profile.height)} CSS px, DPR ${profile.dpr}`
              : "Choose a count, allow a warm-up, then measure. Dense labels intentionally overlap."}
        </p>
      </details>
    </div>
  );
}
