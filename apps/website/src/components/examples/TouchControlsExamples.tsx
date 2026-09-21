import { createStick, createTouchButton } from "@gameui/ui/input";
import {
  HudLayer,
  HudSlot,
  Switch,
  TouchButton,
  TouchControls,
  VirtualStick,
} from "@gameui/ui/react";
import { useEffect, useRef, useState } from "react";

/**
 * A stand-in game: a dot driven by a virtual stick and a dash button. Like a
 * real game, it polls the controls every frame instead of re-rendering React.
 */
export function TouchArena() {
  const [controls] = useState(() => ({
    stick: createStick(),
    dash: createTouchButton(),
  }));
  const [dynamic, setDynamic] = useState(false);
  const arena = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let x = 0;
    let y = 0;
    let boost = 0;
    let frame = requestAnimationFrame(function tick() {
      const input = controls.stick.read();
      if (controls.dash.consumePress()) boost = 12;
      const speed = 3 + boost;
      boost = Math.max(boost - 1, 0);
      const bounds = arena.current!.getBoundingClientRect();
      x = Math.min(Math.max(x + input.x * speed, -bounds.width / 2), bounds.width / 2);
      y = Math.min(Math.max(y + input.y * speed, -bounds.height / 2), bounds.height / 2);
      dot.current!.style.translate = `${x}px ${y}px`;
      readout.current!.textContent = `x ${input.x.toFixed(2)}  y ${input.y.toFixed(2)}`;
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [controls]);

  return (
    <div className="touch-demo">
      <Switch label="Dynamic stick" checked={dynamic} onCheckedChange={setDynamic} size="sm" />
      <div ref={arena} className="hud-demo-arena touch-demo-arena">
        <div ref={dot} className="touch-demo-dot" />
        <HudLayer position="absolute" inset="sm">
          <TouchControls show="always">
            {dynamic ? (
              <VirtualStick control={controls.stick} mode="dynamic" />
            ) : (
              <HudSlot placement="bottom-left">
                <VirtualStick control={controls.stick} />
              </HudSlot>
            )}
            <HudSlot placement="bottom-right">
              <TouchButton control={controls.dash}>Dash</TouchButton>
            </HudSlot>
          </TouchControls>
          <HudSlot placement="top">
            <p ref={readout} className="hud-demo-hint touch-demo-readout" />
          </HudSlot>
        </HudLayer>
      </div>
    </div>
  );
}
