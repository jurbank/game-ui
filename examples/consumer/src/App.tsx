import { useState } from "react";
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
} from "@gameui/react";
import type { HealthBar, Nameplate, WorldTone } from "@gameui/world-ui";

const THEMES = ["arcade", "tactical", "playful"] as const;

const players: readonly PlayerEntry[] = [
  { id: "nova", name: "Nova", status: "Ready", statusTone: "success", detail: "42 ms", self: true },
  { id: "rook", name: "Rook", status: "Picking", statusTone: "warning", detail: "68 ms" },
  { id: "wisp", name: "Wisp", status: "Ready", statusTone: "success", detail: "51 ms" },
];

const rows: readonly ScoreboardRow[] = [
  { id: "nova", name: "Nova", score: 24, rank: 1, highlight: true, self: true },
  { id: "wisp", name: "Wisp", score: 19, rank: 2 },
  { id: "rook", name: "Rook", score: 11, rank: 3, status: "Eliminated", statusTone: "danger" },
];

/**
 * Game policy, owned here rather than by the framework. The same mapping feeds
 * the React ProgressBar and the world-space health bar descriptor below.
 */
function healthTone(
  value: number,
  max: number,
): Extract<WorldTone, "success" | "warning" | "danger"> {
  const ratio = value / max;
  return ratio > 0.5 ? "success" : ratio > 0.2 ? "warning" : "danger";
}

/**
 * Proves the world UI contracts are usable from a consumer without any
 * renderer: a game builds descriptors like these and draws them itself.
 */
function worldDescriptors(health: number, max: number) {
  const nameplate: Nameplate<"3d"> = {
    kind: "nameplate",
    id: "nova:nameplate",
    anchor: {
      dimension: "3d",
      kind: "entity",
      entityId: "nova",
      localOffset: { x: 0, y: 1.8, z: 0 },
    },
    name: "Nova",
    tone: "primary",
    occlusion: "hide",
  };
  const healthBar: HealthBar<"3d"> = {
    kind: "health-bar",
    id: "nova:health",
    anchor: {
      dimension: "3d",
      kind: "entity",
      entityId: "nova",
      localOffset: { x: 0, y: 1.6, z: 0 },
    },
    offset: { space: "screen", x: 0, y: -4 },
    value: health,
    max,
    label: "Nova health",
    tone: healthTone(health, max),
  };
  return [nameplate, healthBar] as const;
}

function ThemedHud({ theme }: { theme: (typeof THEMES)[number] }) {
  const [health, setHealth] = useState(84);
  const [open, setOpen] = useState(false);
  const max = 100;
  const descriptors = worldDescriptors(health, max);

  return (
    <section data-game-theme={theme} className="hud">
      <Panel title={`${theme} squad`} variant="raised">
        <div className="row">
          <Timer value={92_400} label="Match" />
          <ProgressBar
            label="Nova health"
            value={health}
            max={max}
            variant={healthTone(health, max)}
            showValue
          />
        </div>

        <div className="row">
          <Button variant="danger" onClick={() => setHealth((v) => Math.max(0, v - 10))}>
            Damage 10
          </Button>
          <Button variant="secondary" onClick={() => setHealth((v) => Math.min(max, v + 10))}>
            Heal 10
          </Button>
          <Button onClick={() => setOpen(true)}>Pause</Button>
        </div>

        <Panel title="Squad" variant="inset" headingLevel={3} padding="sm">
          <PlayerList players={players} aria-label="Squad members" />
        </Panel>

        <Scoreboard rows={rows} caption="Round 3 standings" />

        <p className="world-readout">
          World descriptors: {descriptors.map((d) => d.kind).join(", ")} · health tone{" "}
          {healthTone(health, max)}
        </p>
      </Panel>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Paused"
        description="The match is paused for everyone."
        actions={<Button onClick={() => setOpen(false)}>Resume</Button>}
      />
    </section>
  );
}

export function App() {
  return (
    <main>
      <h1>Game UI consumer fixture</h1>
      <p>
        Installed from packed tarballs, outside the workspace. Every import below resolves through
        published package exports.
      </p>
      {THEMES.map((theme) => (
        <ThemedHud key={theme} theme={theme} />
      ))}
    </main>
  );
}
