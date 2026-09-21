import { Badge, Button, Panel, TextField } from "@gameui/ui/react";
import { useState } from "react";

const TAKEN = new Set(["nova", "rook"]);

/** Name entry with game-owned validation: the rules live here, not in the component. */
export function NameEntry() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState<string>();
  const trimmed = name.trim();
  const error =
    trimmed.length > 16
      ? "Use 16 characters or fewer."
      : TAKEN.has(trimmed.toLowerCase())
        ? "That name is taken in this lobby."
        : undefined;

  return (
    <Panel title="Join lobby" headingLevel={3} variant="raised">
      <div className="example-stack">
        <TextField
          label="Player name"
          description="Shown above your character. Try “Nova”."
          placeholder="Swift Fox"
          value={name}
          onValueChange={setName}
          error={error}
        />
        <div className="example-row">
          <Button disabled={!trimmed || error !== undefined} onClick={() => setSaved(trimmed)}>
            Join
          </Button>
          {saved && (
            <Badge tone="success" dot>
              Joined as {saved}
            </Badge>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function TextFieldStates() {
  return (
    <div className="example-stack">
      <TextField label="Small" size="sm" placeholder="Room code" />
      <TextField label="With error" defaultValue="Nova" error="That name is taken." />
      <TextField label="Disabled" defaultValue="Locked during a match" disabled />
    </div>
  );
}

export function BadgeTones() {
  return (
    <div className="example-stack">
      <div className="example-row">
        <Badge>Spectator</Badge>
        <Badge tone="primary">Host</Badge>
        <Badge tone="success" dot>
          Online
        </Badge>
        <Badge tone="warning" dot>
          Reconnecting
        </Badge>
        <Badge tone="danger">Eliminated</Badge>
      </div>
      <div className="example-row">
        <Badge size="md" tone="primary">
          Ranked
        </Badge>
        <Badge size="md" tone="success" dot>
          42 ms
        </Badge>
      </div>
    </div>
  );
}
