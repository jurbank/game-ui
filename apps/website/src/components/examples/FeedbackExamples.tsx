import {
  Announcement,
  Button,
  createToastManager,
  HudLayer,
  HudSlot,
  Kbd,
  ToastRegion,
  type ToastTone,
} from "@gameui/ui/react";
import { useEffect, useRef, useState } from "react";

/** A countdown the example owns: 3, 2, 1, Go!, then clear. */
export function CountdownDemo() {
  const [beat, setBeat] = useState<number | "go" | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function start() {
    timers.current.forEach(clearTimeout);
    const beats: (number | "go" | null)[] = [3, 2, 1, "go", null];
    timers.current = beats.map((value, i) => window.setTimeout(() => setBeat(value), i * 800));
  }

  return (
    <div className="hud-demo-arena">
      <HudLayer position="absolute" inset="sm">
        <HudSlot placement="top-left">
          <Button size="sm" onClick={start}>
            Start round
          </Button>
        </HudSlot>
        <HudSlot placement="center">
          <Announcement
            title={beat === "go" ? "Go!" : beat}
            tone={beat === "go" ? "success" : "default"}
            detail={beat === "go" ? "Most coins wins" : undefined}
          />
        </HudSlot>
      </HudLayer>
    </div>
  );
}

const toasts = createToastManager();
const events: { title: string; description?: string; tone: ToastTone }[] = [
  { title: "Nova joined", description: "3 players in the room", tone: "primary" },
  { title: "+3 bonus coin", tone: "success" },
  { title: "Rook is reconnecting", tone: "warning" },
  { title: "Wisp left", tone: "default" },
  { title: "Server restarting in 1 minute", tone: "danger" },
];

/** Posting from an event handler here; a game would post from its own callbacks. */
export function ToastDemo() {
  const next = useRef(0);
  return (
    <div className="hud-demo-arena">
      <HudLayer position="absolute" inset="sm">
        <HudSlot placement="top-left">
          <Button size="sm" onClick={() => toasts.show(events[next.current++ % events.length]!)}>
            Post an event
          </Button>
        </HudSlot>
        <HudSlot placement="bottom-left">
          <ToastRegion manager={toasts} />
        </HudSlot>
      </HudLayer>
    </div>
  );
}

export function KbdExamples() {
  return (
    <div className="example-stack">
      <p className="example-text">
        Move <Kbd>W</Kbd> <Kbd>A</Kbd> <Kbd>S</Kbd> <Kbd>D</Kbd> · Dash <Kbd>Space</Kbd> · Pause{" "}
        <Kbd>Esc</Kbd>
      </p>
      <p className="example-text">
        Quick save <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> · Large: <Kbd size="md">E</Kbd> to open
      </p>
    </div>
  );
}
