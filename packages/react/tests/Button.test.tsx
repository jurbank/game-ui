// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { Button } from "../src/index.ts";

afterEach(cleanup);

test("renders a native button that does not submit forms by default", () => {
  render(<Button>Ready</Button>);
  const button = screen.getByRole("button", { name: "Ready" });
  expect(button.tagName).toBe("BUTTON");
  expect(button.getAttribute("type")).toBe("button");
});

test("allows an explicit submit type", () => {
  render(<Button type="submit">Join</Button>);
  expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
});

test("activates by click, Enter, and Space", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Fire</Button>);

  await user.click(screen.getByRole("button"));
  await user.tab();
  await user.tab({ shift: true });
  expect(screen.getByRole("button")).toBe(document.activeElement);
  await user.keyboard("{Enter}");
  await user.keyboard(" ");

  expect(onClick).toHaveBeenCalledTimes(3);
});

test("disabled buttons are not focusable or activatable", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(
    <Button disabled onClick={onClick}>
      Locked
    </Button>,
  );
  const button = screen.getByRole("button") as HTMLButtonElement;

  expect(button.disabled).toBe(true);
  await user.click(button);
  await user.tab();
  expect(document.activeElement).not.toBe(button);
  expect(onClick).not.toHaveBeenCalled();
});

test("defaults to the primary variant at medium size", () => {
  render(<Button>Play</Button>);
  const button = screen.getByRole("button");
  expect(button.dataset.variant).toBe("primary");
  expect(button.dataset.size).toBe("md");
});

test("applies variant, size, and consumer class names", () => {
  render(
    <Button variant="danger" size="lg" className="w-full">
      Forfeit
    </Button>,
  );
  const button = screen.getByRole("button");
  expect(button.dataset.variant).toBe("danger");
  expect(button.dataset.size).toBe("lg");
  expect(button.className).toContain("bg-game-danger");
  expect(button.className.split(" ").at(-1)).toBe("w-full");
});

test("forwards refs and native attributes", () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <Button ref={ref} aria-pressed="true" name="ready">
      Ready
    </Button>,
  );
  expect(ref.current).toBe(screen.getByRole("button", { pressed: true }));
  expect(ref.current?.name).toBe("ready");
});
