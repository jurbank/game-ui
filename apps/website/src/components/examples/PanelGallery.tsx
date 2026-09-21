import { Panel, type PanelVariant } from "@gameui/react";

const variants: { variant: PanelVariant; description: string }[] = [
  { variant: "default", description: "Grouped content on the page background." },
  { variant: "raised", description: "Menus and dialogs that sit above the scene." },
  { variant: "inset", description: "Nested groups inside another panel." },
];

export function PanelVariants() {
  return (
    <div className="example-grid">
      {variants.map(({ variant, description }) => (
        <Panel key={variant} title={variant} headingLevel={3} variant={variant}>
          <p className="example-text">{description}</p>
        </Panel>
      ))}
    </div>
  );
}

export function NestedPanels() {
  return (
    <Panel title="Match summary" headingLevel={3} variant="raised">
      <div className="example-grid">
        <Panel variant="inset" padding="sm">
          <p className="example-stat">42</p>
          <p className="example-text">Eliminations</p>
        </Panel>
        <Panel variant="inset" padding="sm">
          <p className="example-stat">3:12</p>
          <p className="example-text">Time alive</p>
        </Panel>
      </div>
    </Panel>
  );
}
