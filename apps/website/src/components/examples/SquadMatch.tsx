import { useEffect, useRef, useState } from "react";
import { SquadHud } from "./squad-match/hud";
import { useSquadHud } from "./squad-match/bindings";
import { createGame } from "./world-game/game";
import { readPresentation } from "./world-game/presentation";
import { createScene, type DemoScene } from "./world-game/scene";

const CLOCK_INTERVAL_MS = 250;

/**
 * Consumer walkthrough: the canvas reference game plus a React HUD, standings,
 * and pause/round-over modals, all reading one game-owned store.
 */
export function SquadMatch() {
  const [game] = useState(createGame);
  const [theme, setTheme] = useState("tactical");
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<DemoScene | null>(null);
  const hud = useSquadHud(game);

  // Native scene: created and disposed with the component.
  useEffect(() => {
    if (!canvas.current || !root.current) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => scene.current?.setMotion(!preference.matches);
    try {
      scene.current = createScene(canvas.current, game, readPresentation(root.current));
      applyMotion();
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Canvas could not start.");
    }
    preference.addEventListener("change", applyMotion);
    return () => {
      preference.removeEventListener("change", applyMotion);
      scene.current?.dispose();
      scene.current = null;
    };
  }, [game]);

  // Theme values are resolved for the canvas only when the theme changes.
  useEffect(() => {
    if (root.current) scene.current?.setPresentation(readPresentation(root.current));
  }, [theme]);

  // The match clock. The game advances it; `tick` ignores time while paused.
  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      game.store.getState().tick(now - last);
      last = now;
    }, CLOCK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [game]);

  // Game-owned keybinding. Framework components do not listen for keys.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "p" && event.key !== "P") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)
        return;
      const state = game.store.getState();
      if (state.remainingMs > 0) state.setPaused(!state.paused);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game]);

  return (
    <div ref={root} data-game-theme={theme} className="not-content example world-game demo-hud">
      <div className="example-row world-game-settings">
        <label>
          Theme{" "}
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="arcade">Arcade</option>
            <option value="tactical">Tactical</option>
            <option value="playful">Playful</option>
          </select>
        </label>
        <p className="example-text">
          Click a pilot to select them and deal 10 damage, or use the squad controls.
        </p>
      </div>
      <canvas
        ref={canvas}
        className="world-game-canvas"
        role="img"
        aria-label="Moving pilots with names and health bars. Use the Squad panel below to select a pilot and change health."
      />
      {error && <p role="alert">{error}</p>}
      <SquadHud {...hud} />
    </div>
  );
}
