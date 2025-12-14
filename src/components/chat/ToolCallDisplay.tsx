"use client";

import { Loader2, FilePlus, FileEdit, Eye, Trash2, FileOutput } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

interface ToolCallDisplayProps {
  tool: ToolInvocation;
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

interface ToolDisplayInfo {
  icon: React.ReactNode;
  action: string;
  target: string;
}

function getToolDisplayInfo(tool: ToolInvocation): ToolDisplayInfo {
  const args = tool.args as Record<string, string>;
  const isComplete = tool.state === "result";
  const iconClass = "w-3.5 h-3.5";

  if (tool.toolName === "str_replace_editor") {
    const command = args.command;
    const path = args.path || "";
    const fileName = getFileName(path);

    switch (command) {
      case "create":
        return {
          icon: <FilePlus className={iconClass} />,
          action: isComplete ? "Created" : "Creating",
          target: fileName,
        };
      case "str_replace":
        return {
          icon: <FileEdit className={iconClass} />,
          action: isComplete ? "Edited" : "Editing",
          target: fileName,
        };
      case "insert":
        return {
          icon: <FileEdit className={iconClass} />,
          action: isComplete ? "Updated" : "Updating",
          target: fileName,
        };
      case "view":
        return {
          icon: <Eye className={iconClass} />,
          action: isComplete ? "Viewed" : "Viewing",
          target: fileName,
        };
      default:
        return {
          icon: <FileEdit className={iconClass} />,
          action: isComplete ? "Modified" : "Modifying",
          target: fileName,
        };
    }
  }

  if (tool.toolName === "file_manager") {
    const command = args.command;
    const path = args.path || "";
    const newPath = args.new_path || "";
    const fileName = getFileName(path);
    const newFileName = getFileName(newPath);

    switch (command) {
      case "delete":
        return {
          icon: <Trash2 className={iconClass} />,
          action: isComplete ? "Deleted" : "Deleting",
          target: fileName,
        };
      case "rename":
        return {
          icon: <FileOutput className={iconClass} />,
          action: isComplete ? "Renamed" : "Renaming",
          target: `${fileName} → ${newFileName}`,
        };
      default:
        return {
          icon: <FileEdit className={iconClass} />,
          action: isComplete ? "Modified" : "Modifying",
          target: fileName,
        };
    }
  }

  // Fallback for unknown tools
  return {
    icon: <FileEdit className={iconClass} />,
    action: isComplete ? "Completed" : "Running",
    target: tool.toolName,
  };
}

export function ToolCallDisplay({ tool }: ToolCallDisplayProps) {
  const isComplete = tool.state === "result" && tool.result !== undefined;
  const { icon, action, target } = getToolDisplayInfo(tool);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-500">{icon}</span>
      <span className="text-neutral-700">
        {action} <span className="font-medium text-neutral-900">{target}</span>
      </span>
    </div>
  );
}
