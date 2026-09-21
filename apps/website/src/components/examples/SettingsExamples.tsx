import { Button, Panel, Slider, Switch, Tabs } from "@gameui/ui/react";
import { useState } from "react";

/** A settings screen. The settings object is game state, owned by this example. */
export function SettingsScreen() {
  const [settings, setSettings] = useState({
    master: 80,
    music: 60,
    effects: 90,
    subtitles: true,
    damageNumbers: true,
    screenShake: false,
    fov: 90,
    sensitivity: 5,
  });
  const [saved, setSaved] = useState<string>();
  const set = <K extends keyof typeof settings>(key: K) => {
    return (value: (typeof settings)[K]) =>
      setSettings((current) => ({ ...current, [key]: value }));
  };
  // Commit fires once when a drag or key press ends: the place to save or play a sample.
  const save = (what: string) => () => setSaved(`Saved ${what}`);

  return (
    <Panel title="Settings" headingLevel={3} variant="raised">
      <Tabs
        listLabel="Settings sections"
        tabs={[
          {
            value: "audio",
            label: "Audio",
            content: (
              <div className="example-stack">
                <Slider
                  label="Master volume"
                  value={settings.master}
                  onValueChange={set("master")}
                  onValueCommitted={save("master volume")}
                  showValue
                />
                <Slider
                  label="Music"
                  value={settings.music}
                  onValueChange={set("music")}
                  onValueCommitted={save("music volume")}
                  showValue
                />
                <Slider
                  label="Effects"
                  value={settings.effects}
                  onValueChange={set("effects")}
                  onValueCommitted={save("effects volume")}
                  showValue
                />
              </div>
            ),
          },
          {
            value: "gameplay",
            label: "Gameplay",
            content: (
              <div className="example-stack">
                <Switch
                  label="Subtitles"
                  checked={settings.subtitles}
                  onCheckedChange={set("subtitles")}
                />
                <Switch
                  label="Damage numbers"
                  checked={settings.damageNumbers}
                  onCheckedChange={set("damageNumbers")}
                />
                <Switch
                  label="Screen shake"
                  checked={settings.screenShake}
                  onCheckedChange={set("screenShake")}
                />
              </div>
            ),
          },
          {
            value: "controls",
            label: "Controls",
            content: (
              <div className="example-stack">
                <Slider
                  label="Field of view"
                  value={settings.fov}
                  onValueChange={set("fov")}
                  min={60}
                  max={120}
                  showValue
                  format={{ style: "unit", unit: "degree", unitDisplay: "narrow" }}
                />
                <Slider
                  label="Mouse sensitivity"
                  value={settings.sensitivity}
                  onValueChange={set("sensitivity")}
                  min={1}
                  max={10}
                  step={0.5}
                  showValue
                  format={{ minimumFractionDigits: 1 }}
                />
              </div>
            ),
          },
          { value: "online", label: "Online", content: null, disabled: true },
        ]}
      />
      <div className="example-row">
        <Button variant="secondary" onClick={() => setSaved(undefined)}>
          Back
        </Button>
        <p className="example-text" aria-live="polite">
          {saved}
        </p>
      </div>
    </Panel>
  );
}

export function SliderExamples() {
  return (
    <div className="example-stack">
      <Slider label="Medium" defaultValue={40} showValue />
      <Slider label="Small" defaultValue={70} size="sm" showValue />
      <Slider label="Disabled" defaultValue={25} disabled />
    </div>
  );
}

export function SwitchExamples() {
  return (
    <div className="example-stack">
      <Switch label="Medium" defaultChecked />
      <Switch label="Small" size="sm" />
      <Switch label="Disabled" disabled defaultChecked />
    </div>
  );
}

export function TabsSizes() {
  const tabs = [
    { value: "squad", label: "Squad", content: <p className="example-text">Squad members</p> },
    { value: "loadout", label: "Loadout", content: <p className="example-text">Weapons</p> },
    { value: "stats", label: "Stats", content: <p className="example-text">Match stats</p> },
  ];
  return (
    <div className="example-stack">
      <Tabs tabs={tabs} listLabel="Medium tabs" />
      <Tabs tabs={tabs} listLabel="Small tabs" size="sm" />
    </div>
  );
}
