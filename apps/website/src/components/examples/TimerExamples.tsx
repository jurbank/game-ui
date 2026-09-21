import { Button, Panel, Timer } from "@gameui/react";
import { useEffect, useRef, useState } from "react";

const ROUND_MS = 90_000;

/**
 * A round clock. The authoritative time and the match lifecycle live in this
 * example; Timer only displays the value it is given.
 */
export function RoundClock() {
  const [remaining, setRemaining] = useState(ROUND_MS);
  const [running, setRunning] = useState(false);
  const lastTick = useRef(0);

  useEffect(() => {
    if (!running) return;
    lastTick.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastTick.current;
      lastTick.current = now;
      setRemaining((value) => {
        const next = Math.max(0, value - elapsed);
        if (next === 0) setRunning(false);
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const tone = remaining <= 10_000 ? "danger" : remaining <= 30_000 ? "warning" : "default";

  return (
    <Panel title="Round 3" headingLevel={3} variant="raised">
      <div className="example-row">
        <Timer label="Time remaining" value={remaining} variant={tone} size="lg" />
        <Button onClick={() => setRunning((value) => !value)}>{running ? "Pause" : "Start"}</Button>
        <Button
          variant="secondary"
          onClick={() => {
            setRunning(false);
            setRemaining(ROUND_MS);
          }}
        >
          Reset
        </Button>
      </div>
    </Panel>
  );
}

export function TimerPrecisions() {
  return (
    <div className="example-row">
      <Timer label="Seconds" value={95_400} />
      <Timer label="Tenths" value={95_400} precision="tenths" />
      <Timer label="Hundredths" value={95_400} precision="hundredths" />
    </div>
  );
}

export function TimerStates() {
  return (
    <div className="example-row">
      <Timer label="Elapsed" value={3_725_000} />
      <Timer label="Forced hours" value={95_000} hours="always" />
      <Timer label="Folded hours" value={5_400_000} hours="never" />
      <Timer label="Unknown" value={Number.NaN} />
    </div>
  );
}

export function TimerVariants() {
  return (
    <div className="example-row">
      <Timer label="Default" value={62_000} />
      <Timer label="Warning" value={22_000} variant="warning" />
      <Timer label="Danger" value={7_000} variant="danger" />
    </div>
  );
}
