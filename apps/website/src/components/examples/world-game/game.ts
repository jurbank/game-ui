import type { WorldTone } from "@game-ui/world-ui";
import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export interface Pilot {
  readonly id: string;
  readonly name: string;
  readonly health: number;
  readonly max: number;
}

export interface GameState {
  readonly pilots: readonly Pilot[];
  readonly selectedId: string;
  selectEntity(id: string): void;
  changeHealth(id: string, delta: number): void;
}

export interface HealthEvent {
  entityId: string;
  delta: number;
}

/** One instance per mounted game. No module-level store and no positions in state. */
export function createGame() {
  const listeners = new Set<(event: HealthEvent) => void>();
  const store = createStore<GameState>()(
    subscribeWithSelector((set, get) => ({
      pilots: [
        { id: "nova", name: "Nova", health: 84, max: 100 },
        { id: "rook", name: "Rook", health: 51, max: 100 },
        { id: "wisp", name: "Wisp", health: 96, max: 100 },
      ],
      selectedId: "nova",
      selectEntity(id) {
        if (get().pilots.some((pilot) => pilot.id === id)) set({ selectedId: id });
      },
      changeHealth(id, delta) {
        if (!Number.isFinite(delta)) return;
        const pilot = get().pilots.find((entry) => entry.id === id);
        if (!pilot) return;
        const health = Math.min(pilot.max, Math.max(0, pilot.health + delta));
        if (health === pilot.health) return;
        set({
          pilots: get().pilots.map((entry) => (entry.id === id ? { ...entry, health } : entry)),
        });
        // Synchronous, no replay. Persistent health is published before the notification.
        for (const listener of listeners) listener({ entityId: id, delta: health - pilot.health });
      },
    })),
  );
  return {
    store,
    onHealthChange(listener: (event: HealthEvent) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type DemoGame = ReturnType<typeof createGame>;

/** Game policy, deliberately outside the framework. */
export function healthTone(value: number): Extract<WorldTone, "success" | "warning" | "danger"> {
  return value > 50 ? "success" : value > 20 ? "warning" : "danger";
}
