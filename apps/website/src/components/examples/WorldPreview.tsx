import type { WorldDescriptor, WorldPoint2D } from "@gameui/world-ui";
import { useEffect, useRef } from "react";
import { drawDescriptor } from "./world-game/draw";
import { readPresentation } from "./world-game/presentation";
import { assertSupported, project } from "./world-game/spatial";

export interface WorldPreviewProps {
  /** Entity positions in world units; the camera is centred on the origin at zoom 1. */
  entities?: Readonly<Record<string, WorldPoint2D>>;
  descriptors: readonly WorldDescriptor<"2d">[];
  /** Accessible description of what the preview shows. */
  label: string;
  height?: number;
}

/**
 * A still frame drawn with the canvas reference game's drawing code, for
 * showing one concept's variants. Redraws on resize; no loop or state.
 */
export function WorldPreview({
  entities = {},
  descriptors,
  label,
  height = 160,
}: WorldPreviewProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx) return;
    for (const descriptor of descriptors) assertSupported(descriptor);
    const positions = new Map(Object.entries(entities));
    const camera = { x: 0, y: 0, zoom: 1 };
    const point = { x: 0, y: 0 };

    function draw() {
      if (!element || !ctx) return;
      const theme = readPresentation(element);
      const { width, height } = element.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, width, height);
      ctx.font = theme.font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const position of positions.values()) {
        ctx.fillStyle = theme.muted;
        ctx.beginPath();
        ctx.arc(position.x + width / 2, position.y + height / 2, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const descriptor of descriptors) {
        if (descriptor.visible === false) continue;
        if (project(descriptor, positions, camera, width, height, point)) {
          drawDescriptor(ctx, theme, descriptor, point.x, point.y);
        }
      }
    }

    const observer = new ResizeObserver(draw);
    observer.observe(element);
    draw();
    return () => observer.disconnect();
  }, [entities, descriptors]);

  return (
    <canvas
      ref={canvas}
      className="world-game-canvas"
      style={{ height }}
      role="img"
      aria-label={label}
    />
  );
}
