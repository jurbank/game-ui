import type { ComponentPropsWithRef, ReactNode } from "react";

/** What the event means. The game decides which event maps to which tone. */
export type ToastTone = "default" | "primary" | "success" | "warning" | "danger";

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Milliseconds before it closes. Defaults to the region's `timeout`; 0 keeps it open. */
  timeout?: number;
  /** `high` interrupts screen readers. Use it only for events that need attention now. */
  priority?: "low" | "high";
  /** Reuse an id to replace an existing toast instead of adding another. */
  id?: string;
}

/**
 * Game-facing handle for posting toasts. Create one per game view and call it
 * from anywhere, including outside React, such as a network callback.
 */
export interface ToastManager {
  /** Show a toast and return its id. */
  show(options: ToastOptions): string;
  /** Change an open toast, for example to count repeated events. */
  update(id: string, options: Partial<ToastOptions>): void;
  /** Close one toast, or all of them when `id` is omitted. */
  close(id?: string): void;
}

export interface ToastRegionProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  manager: ToastManager;
  /** Default milliseconds before a toast closes. */
  timeout?: number;
  /** Most toasts shown at once; older ones hide until newer ones close. */
  limit?: number;
}
