// @vitest-environment happy-dom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { createToastManager, ToastRegion } from "../src/react/index.ts";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test("shows toasts posted from outside React, with title, description, and tone", async () => {
  const toasts = createToastManager();
  render(<ToastRegion manager={toasts} />);

  act(() => {
    toasts.show({ title: "Nova joined", description: "4 players in the room", tone: "primary" });
  });
  const title = await screen.findByText("Nova joined");
  const toast = title.closest("[data-tone]") as HTMLElement;
  expect(toast.dataset.tone).toBe("primary");
  expect(toast.className).toContain("border-l-game-primary");
  expect(screen.getByText("4 players in the room")).toBeTruthy();
});

test("lists toasts oldest to newest, like a feed", async () => {
  const toasts = createToastManager();
  render(<ToastRegion manager={toasts} />);
  act(() => {
    toasts.show({ title: "First" });
    toasts.show({ title: "Second" });
  });
  await screen.findByText("Second");
  const titles = [...document.querySelectorAll("[data-tone]")].map((toast) => toast.textContent);
  expect(titles).toEqual(["First", "Second"]);
});

test("unknown tones fall back to default", async () => {
  const toasts = createToastManager();
  render(<ToastRegion manager={toasts} />);
  act(() => {
    toasts.show({ title: "Hello", tone: "sparkly" as never });
  });
  const toast = (await screen.findByText("Hello")).closest("[data-tone]") as HTMLElement;
  expect(toast.dataset.tone).toBe("default");
});

test("update changes an open toast and close removes it", async () => {
  const toasts = createToastManager();
  render(<ToastRegion manager={toasts} timeout={0} />);
  let id = "";
  act(() => {
    id = toasts.show({ title: "+1 coin" });
  });
  await screen.findByText("+1 coin");
  act(() => toasts.update(id, { title: "+2 coins", tone: "success" }));
  const updated = await screen.findByText("+2 coins");
  expect((updated.closest("[data-tone]") as HTMLElement).dataset.tone).toBe("success");

  act(() => toasts.close(id));
  await vi.waitFor(() => expect(screen.queryByText("+2 coins")).toBeNull());
});

test("closes after the timeout", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const toasts = createToastManager();
  render(<ToastRegion manager={toasts} timeout={1000} />);
  act(() => {
    toasts.show({ title: "Round 2" });
  });
  await screen.findByText("Round 2");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500);
  });
  await vi.waitFor(() => expect(screen.queryByText("Round 2")).toBeNull());
});

test("a region needs a manager from createToastManager", () => {
  const fake = { show: () => "", update: () => {}, close: () => {} };
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<ToastRegion manager={fake} />)).toThrow(/createToastManager/);
});
