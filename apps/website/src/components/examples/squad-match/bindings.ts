import { useMemo } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { DemoGame } from "../world-game/game";
import type { SquadHudActions, SquadHudState } from "./hud";

/**
 * The only Zustand-aware piece of the HUD. Swap this hook to change state
 * libraries; SquadHud, the framework components, and the world contracts stay
 * the same.
 */
export function useSquadHud(game: DemoGame): SquadHudState & { actions: SquadHudActions } {
  const state = useStore(
    game.store,
    useShallow(({ pilots, selectedId, remainingMs, paused }) => ({
      pilots,
      selectedId,
      remainingMs,
      paused,
    })),
  );
  const actions = useMemo<SquadHudActions>(() => {
    const act = game.store.getState;
    return {
      select: (id) => act().selectEntity(id),
      changeHealth: (id, delta) => act().changeHealth(id, delta),
      awardScore: (id, points) => act().awardScore(id, points),
      setPaused: (paused) => act().setPaused(paused),
      restart: () => act().reset(),
    };
  }, [game]);
  return { ...state, actions };
}
