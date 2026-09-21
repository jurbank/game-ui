// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { TextField } from "../src/react/index.ts";

afterEach(cleanup);

test("is a textbox named by its label and described by its description", () => {
  render(<TextField label="Player name" description="Up to 16 characters" />);
  const input = screen.getByRole("textbox", { name: "Player name" });
  const describedBy = input.getAttribute("aria-describedby")!;
  expect(document.getElementById(describedBy)?.textContent).toBe("Up to 16 characters");
});

test("an unlabelled field takes its name from aria-label", () => {
  render(<TextField aria-label="Room code" />);
  expect(screen.getByRole("textbox", { name: "Room code" })).toBeTruthy();
});

test("reports each change and follows a value the game controls", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  function NameEntry() {
    const [name, setName] = useState("Fox");
    return (
      <TextField
        label="Name"
        value={name}
        onValueChange={(next) => {
          onValueChange(next);
          setName(next.toUpperCase());
        }}
      />
    );
  }
  render(<NameEntry />);
  await user.type(screen.getByRole("textbox"), "y");
  expect(onValueChange).toHaveBeenLastCalledWith("Foxy");
  expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe("FOXY");
});

test("an error marks the field invalid and is shown", () => {
  const { rerender } = render(<TextField label="Name" />);
  expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBeNull();

  rerender(<TextField label="Name" error="Name is taken" />);
  const input = screen.getByRole("textbox");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByText("Name is taken")).toBeTruthy();
  expect(input.hasAttribute("data-invalid")).toBe(true);
});

test("disabled fields cannot be edited", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<TextField label="Name" disabled onValueChange={onValueChange} />);
  await user.type(screen.getByRole("textbox"), "abc");
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByRole<HTMLInputElement>("textbox").disabled).toBe(true);
});

test("passes native input props and refs to the input, and className to the field", () => {
  const ref = createRef<HTMLInputElement>();
  const { container } = render(
    <TextField
      ref={ref}
      label="Name"
      maxLength={16}
      placeholder="Swift Fox"
      size="sm"
      className="w-60"
    />,
  );
  expect(ref.current).toBe(screen.getByRole("textbox"));
  expect(ref.current?.maxLength).toBe(16);
  expect(ref.current?.placeholder).toBe("Swift Fox");
  expect(ref.current?.className).toContain("py-game-xs");
  const root = container.firstElementChild as HTMLElement;
  expect(root.dataset.size).toBe("sm");
  expect(root.className.split(" ").at(-1)).toBe("w-60");
});
