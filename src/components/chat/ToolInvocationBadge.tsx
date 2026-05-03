"use client";

import { Loader2 } from "lucide-react";

export type ToolInvocationData = {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
  result?: unknown;
};

function basename(path: string): string {
  return path.split("/").pop() || path;
}

export function getToolLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? basename(args.path) : "";

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create": return `Creating ${path}`;
      case "str_replace":
      case "insert": return `Editing ${path}`;
      case "view": return `Reading ${path}`;
      case "undo_edit": return `Reverting ${path}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete": return `Deleting ${path}`;
      case "rename": {
        const newPath = typeof args.new_path === "string" ? basename(args.new_path) : "";
        return `Renaming ${path} → ${newPath}`;
      }
    }
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocationData;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const label = getToolLabel(toolInvocation.toolName, toolInvocation.args);
  const isDone = toolInvocation.state === "result" && toolInvocation.result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
