import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";
import type { ToolInvocationData } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

function make(overrides: Partial<ToolInvocationData> = {}): ToolInvocationData {
  return {
    toolCallId: "id",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/components/Button.tsx" },
    state: "result",
    result: "Success",
    ...overrides,
  };
}

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/src/Button.tsx" })).toBe("Creating Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/App.tsx" })).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/src/App.tsx" })).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/src/utils.ts" })).toBe("Reading utils.ts");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/src/index.ts" })).toBe("Reverting index.ts");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/src/old.tsx" })).toBe("Deleting old.tsx");
});

test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/src/Old.tsx", new_path: "/src/New.tsx" })).toBe("Renaming Old.tsx → New.tsx");
});

test("getToolLabel: falls back to tool name for unknown tool", () => {
  expect(getToolLabel("some_other_tool", {})).toBe("some_other_tool");
});

test("getToolLabel: extracts basename from nested path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/a/b/c/Component.tsx" })).toBe("Creating Component.tsx");
});

// --- ToolInvocationBadge render tests ---

test("renders friendly label for str_replace_editor create", () => {
  render(<ToolInvocationBadge toolInvocation={make()} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("renders friendly label for file_manager delete", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={make({ toolName: "file_manager", args: { command: "delete", path: "/src/old.tsx" } })}
    />
  );
  expect(screen.getByText("Deleting old.tsx")).toBeDefined();
});

test("shows green dot when state is result", () => {
  const { container } = render(<ToolInvocationBadge toolInvocation={make()} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("shows spinner when state is call", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={make({ state: "call", result: undefined })} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("shows spinner when state is partial-call", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={make({ state: "partial-call", result: undefined })} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
