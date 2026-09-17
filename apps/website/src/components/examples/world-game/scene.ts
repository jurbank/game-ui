import type { FloatingLabel, WorldDescriptor } from "@game-ui/world-ui";
import { healthTone, type DemoGame } from "./game";
import type { CanvasPresentation } from "./presentation";
import { assertSupported, healthFraction, project } from "./spatial";

interface RenderEntry {
  descriptor: WorldDescriptor<"2d">;
  createdAt: number;
}

export interface ProfileResult {
  entities: number;
  descriptors: number;
  frames: number;
  drawMedianMs: number;
  drawP95Ms: number;
  frameMedianMs: number;
  frameP95Ms: number;
  width: number;
  height: number;
  dpr: number;
}

/** Game-owned Canvas2D implementation. No browser work happens at module evaluation. */
export function createScene(
  canvas: HTMLCanvasElement,
  game: DemoGame,
  initialTheme: CanvasPresentation,
) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This example needs Canvas2D support.");
  const ctx = context;
  let theme = initialTheme;
  let disposed = false;
  let motion = true;
  let time = 0;
  let animationTime = 0;
  let previous = 0;
  let frameId = 0;
  let width = 640;
  let height = 360;
  let dpr = 1;
  let selectedId = game.store.getState().selectedId;
  const camera = { x: 0, y: 0, zoom: 1 };
  const projected = { x: 0, y: 0 };
  const positions = new Map<
    string,
    { x: number; y: number; baseX: number; baseY: number; phase: number }
  >();
  const entries = new Map<string, RenderEntry>();
  const hitTargets: { id: string; x: number; y: number }[] = [];
  let measure:
    | { draws: number[]; frames: number[]; callback: (result: ProfileResult) => void }
    | undefined;

  function put(descriptor: WorldDescriptor<"2d">) {
    assertSupported(descriptor);
    entries.set(descriptor.id, {
      descriptor,
      createdAt: entries.get(descriptor.id)?.createdAt ?? time,
    });
  }

  function syncPilots() {
    for (const pilot of game.store.getState().pilots) {
      const anchor = { kind: "entity", dimension: "2d", entityId: pilot.id } as const;
      put({
        kind: "nameplate",
        id: `name:${pilot.id}`,
        anchor,
        name: pilot.name,
        status: pilot.health === 0 ? "Down" : "Ready",
        selected: pilot.id === selectedId,
        offset: { space: "screen", x: 0, y: -44 },
      });
      put({
        kind: "health-bar",
        id: `health:${pilot.id}`,
        anchor,
        label: `${pilot.name} health`,
        value: pilot.health,
        max: pilot.max,
        tone: healthTone(pilot.health),
        offset: { space: "screen", x: 0, y: -26 },
      });
    }
  }

  function setEntityCount(count: 3 | 100 | 500) {
    if (disposed) return;
    measure = undefined;
    positions.clear();
    entries.clear();
    hitTargets.length = 0;
    game.store.getState().pilots.forEach((pilot, index) => {
      const baseX = (index - 1) * 150;
      positions.set(pilot.id, { x: baseX, y: 20, baseX, baseY: 20, phase: index * 2 });
      hitTargets.push({ id: pilot.id, x: 0, y: 0 });
    });
    for (let index = 3; index < count; index++) {
      const id = `crowd:${index}`;
      // Deterministic dense workload inside the viewport. Deliberately no overlap avoidance.
      const baseX = ((index * 73) % 560) - 280;
      const baseY = ((index * 47) % 220) - 110;
      positions.set(id, { x: baseX, y: baseY, baseX, baseY, phase: index });
      const anchor = { kind: "entity", dimension: "2d", entityId: id } as const;
      put({
        kind: "nameplate",
        id: `name:${id}`,
        anchor,
        name: `Unit ${index}`,
        offset: { space: "screen", x: 0, y: -24 },
      });
      put({
        kind: "health-bar",
        id: `health:${id}`,
        anchor,
        label: `Unit ${index} health`,
        value: 75,
        max: 100,
        tone: "success",
        offset: { space: "screen", x: 0, y: -12 },
      });
    }
    put({
      kind: "floating-label",
      id: "relay",
      text: "RELAY · SECTOR 03",
      tone: "primary",
      anchor: { kind: "position", dimension: "2d", position: { x: 0, y: -110 } },
    });
    syncPilots();
  }
  setEntityCount(3);

  const unsubscribePilots = game.store.subscribe((state) => state.pilots, syncPilots);
  const unsubscribeSelection = game.store.subscribe(
    (state) => state.selectedId,
    (id) => {
      selectedId = id;
      syncPilots();
    },
  );
  let eventId = 0;
  const unsubscribeEvents = game.onHealthChange(({ entityId, delta }) => {
    const descriptor: FloatingLabel<"2d"> = {
      kind: "floating-label",
      id: `event:${eventId++}`,
      text: `${delta > 0 ? "+" : ""}${delta} HP`,
      tone: delta > 0 ? "success" : "danger",
      lifetimeMs: 1000,
      missingAnchor: "dispose",
      anchor: { kind: "entity", dimension: "2d", entityId },
      offset: { space: "screen", x: 0, y: -72 },
    };
    put(descriptor);
  });

  function resize() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  function onPointer(event: PointerEvent) {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const target = hitTargets.find((hit) => Math.hypot(hit.x - x, hit.y - y) <= 24);
    if (!target) return;
    game.store.getState().selectEntity(target.id);
    game.store.getState().changeHealth(target.id, -10);
  }
  canvas.addEventListener("pointerdown", onPointer);

  function drawEntry(descriptor: WorldDescriptor<"2d">) {
    const { x, y } = projected;
    const tone = descriptor.tone ?? "default";
    if (descriptor.kind === "health-bar") {
      ctx.fillStyle = theme.panel;
      ctx.fillRect(x - 36, y - 4, 72, 8);
      ctx.fillStyle = theme.fillTones[tone];
      ctx.fillRect(x - 36, y - 4, 72 * healthFraction(descriptor.value, descriptor.max), 8);
      ctx.strokeStyle = theme.border;
      ctx.strokeRect(x - 36, y - 4, 72, 8);
    } else {
      const text =
        descriptor.kind === "nameplate"
          ? `${descriptor.selected ? "◆ " : ""}${descriptor.name}${descriptor.status ? ` · ${descriptor.status}` : ""}`
          : descriptor.text;
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = theme.panel;
      ctx.fillRect(x - textWidth / 2 - 5, y - 10, textWidth + 10, 20);
      ctx.fillStyle = theme.textTones[tone];
      ctx.fillText(text, x, y);
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, width, height);
    ctx.font = theme.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const seconds = animationTime / 1000;
    camera.x = Math.sin(seconds * 0.35) * 30;
    camera.y = Math.cos(seconds * 0.3) * 12;
    camera.zoom = Math.min(1, width / 640) * (1 + Math.sin(seconds * 0.4) * 0.15);
    // A world-space grid makes camera translation and zoom visible.
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let grid = -600; grid <= 600; grid += 60) {
      const x = (grid - camera.x) * camera.zoom + width / 2;
      const y = (grid - camera.y) * camera.zoom + height / 2;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    for (const [id, position] of positions) {
      position.x = position.baseX + Math.sin(seconds + position.phase) * 20;
      position.y = position.baseY + Math.cos(seconds * 0.8 + position.phase) * 16;
      const x = (position.x - camera.x) * camera.zoom + width / 2;
      const y = (position.y - camera.y) * camera.zoom + height / 2;
      const hit = hitTargets.find((target) => target.id === id);
      if (hit) {
        hit.x = x;
        hit.y = y;
      }
      ctx.fillStyle = id === selectedId ? theme.primary : theme.muted;
      ctx.beginPath();
      ctx.arc(x, y, 10 * camera.zoom, 0, Math.PI * 2);
      ctx.fill();
      if (id === selectedId) {
        ctx.strokeStyle = theme.primary;
        ctx.beginPath();
        ctx.arc(x, y, 16 * camera.zoom, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    for (const [id, entry] of entries) {
      const descriptor = entry.descriptor;
      if (descriptor.lifetimeMs !== undefined && time - entry.createdAt >= descriptor.lifetimeMs) {
        entries.delete(id);
        continue;
      }
      if (!project(descriptor, positions, camera, width, height, projected)) {
        if (descriptor.missingAnchor === "dispose") entries.delete(id);
        continue;
      }
      if (descriptor.visible === false) continue;
      // Canvas clips at viewport bounds. No depth, overlap, or distance culling in this example.
      drawEntry(descriptor);
    }
  }

  function frame(timestamp: number) {
    if (disposed) return;
    const interval = previous ? timestamp - previous : 0;
    previous = timestamp;
    const delta = Math.max(0, Math.min(100, interval));
    time += delta;
    if (motion) animationTime += delta;
    const started = performance.now();
    draw();
    if (measure && interval > 0) {
      measure.draws.push(performance.now() - started);
      measure.frames.push(interval);
      if (measure.draws.length === 300) {
        const result = measure;
        measure = undefined;
        result.draws.sort((a, b) => a - b);
        result.frames.sort((a, b) => a - b);
        result.callback({
          entities: positions.size,
          descriptors: entries.size,
          frames: 300,
          drawMedianMs: result.draws[149]!,
          drawP95Ms: result.draws[284]!,
          frameMedianMs: result.frames[149]!,
          frameP95Ms: result.frames[284]!,
          width,
          height,
          dpr,
        });
      }
    }
    if (!disposed) frameId = requestAnimationFrame(frame);
  }
  frameId = requestAnimationFrame(frame);

  return {
    setPresentation(next: CanvasPresentation) {
      if (!disposed) theme = next;
    },
    setMotion(next: boolean) {
      if (!disposed) motion = next;
    },
    setEntityCount,
    profile(callback: (result: ProfileResult) => void) {
      if (!disposed) measure = { draws: [], frames: [], callback };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointer);
      unsubscribePilots();
      unsubscribeSelection();
      unsubscribeEvents();
      entries.clear();
      positions.clear();
      hitTargets.length = 0;
      measure = undefined;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}

export type DemoScene = ReturnType<typeof createScene>;
