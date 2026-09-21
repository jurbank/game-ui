import { Button, Panel, ProgressBar } from "@gameui/ui/react";
import { useState } from "react";

/** A HUD readout. The match values live in this example, not in the framework. */
export function HudBars() {
  const [health, setHealth] = useState(72);
  const tone = health > 50 ? "success" : health > 20 ? "warning" : "danger";

  return (
    <Panel title="Vitals" headingLevel={3} variant="raised">
      <div className="example-stack">
        <ProgressBar label="Health" value={health} variant={tone} showValue />
        <ProgressBar label="Shield" value={38} max={50} variant="primary" size="sm" />
        <ProgressBar
          label="Experience"
          value={1250}
          max={5000}
          showValue
          format={{ style: "decimal" }}
        />
      </div>
      <div className="example-row">
        <Button variant="danger" onClick={() => setHealth((value) => Math.max(0, value - 20))}>
          Take damage
        </Button>
        <Button variant="secondary" onClick={() => setHealth((value) => Math.min(100, value + 20))}>
          Heal
        </Button>
      </div>
    </Panel>
  );
}

export function ProgressBarVariants() {
  return (
    <div className="example-stack">
      <ProgressBar label="Primary" value={60} variant="primary" />
      <ProgressBar label="Success" value={60} variant="success" />
      <ProgressBar label="Warning" value={60} variant="warning" />
      <ProgressBar label="Danger" value={60} variant="danger" />
    </div>
  );
}

export function ProgressBarStates() {
  return (
    <div className="example-stack">
      <ProgressBar label="Empty" value={0} showValue />
      <ProgressBar label="Full" value={100} showValue />
      <ProgressBar label="Loading" value={null} />
    </div>
  );
}

export function ProgressBarSizes() {
  return (
    <div className="example-stack">
      <ProgressBar label="Small" value={45} size="sm" />
      <ProgressBar label="Medium" value={45} size="md" />
      <ProgressBar label="Large" value={45} size="lg" />
    </div>
  );
}
