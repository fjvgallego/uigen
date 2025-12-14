import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCallDisplay } from "../ToolCallDisplay";

describe("ToolCallDisplay", () => {
  describe("str_replace_editor tool", () => {
    it("displays 'Creating' message for create command in progress", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "str_replace_editor",
            args: { command: "create", path: "/components/Button.tsx" },
            state: "pending",
          }}
        />
      );

      expect(screen.getByText("Creating")).toBeDefined();
      expect(screen.getByText("Button.tsx")).toBeDefined();
    });

    it("displays 'Created' message for completed create command", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "str_replace_editor",
            args: { command: "create", path: "/components/Card.jsx" },
            state: "result",
            result: "File created",
          }}
        />
      );

      expect(screen.getByText("Created")).toBeDefined();
      expect(screen.getByText("Card.jsx")).toBeDefined();
    });

    it("displays 'Editing' message for str_replace command in progress", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "str_replace",
              path: "/App.jsx",
              old_str: "foo",
              new_str: "bar",
            },
            state: "pending",
          }}
        />
      );

      expect(screen.getByText("Editing")).toBeDefined();
      expect(screen.getByText("App.jsx")).toBeDefined();
    });

    it("displays 'Edited' message for completed str_replace command", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "str_replace",
              path: "/utils/helpers.ts",
              old_str: "old",
              new_str: "new",
            },
            state: "result",
            result: "Replaced",
          }}
        />
      );

      expect(screen.getByText("Edited")).toBeDefined();
      expect(screen.getByText("helpers.ts")).toBeDefined();
    });

    it("displays 'Updating' message for insert command in progress", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "insert",
              path: "/index.tsx",
              insert_line: 5,
              new_str: "// comment",
            },
            state: "pending",
          }}
        />
      );

      expect(screen.getByText("Updating")).toBeDefined();
      expect(screen.getByText("index.tsx")).toBeDefined();
    });

    it("displays 'Viewing' message for view command", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "str_replace_editor",
            args: { command: "view", path: "/README.md" },
            state: "pending",
          }}
        />
      );

      expect(screen.getByText("Viewing")).toBeDefined();
      expect(screen.getByText("README.md")).toBeDefined();
    });
  });

  describe("file_manager tool", () => {
    it("displays 'Deleting' message for delete command in progress", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "file_manager",
            args: { command: "delete", path: "/old-file.tsx" },
            state: "pending",
          }}
        />
      );

      expect(screen.getByText("Deleting")).toBeDefined();
      expect(screen.getByText("old-file.tsx")).toBeDefined();
    });

    it("displays 'Deleted' message for completed delete command", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "file_manager",
            args: { command: "delete", path: "/temp.js" },
            state: "result",
            result: { success: true },
          }}
        />
      );

      expect(screen.getByText("Deleted")).toBeDefined();
      expect(screen.getByText("temp.js")).toBeDefined();
    });

    it("displays 'Renaming' message for rename command in progress", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "file_manager",
            args: {
              command: "rename",
              path: "/old-name.tsx",
              new_path: "/new-name.tsx",
            },
            state: "pending",
          }}
        />
      );

      expect(screen.getByText("Renaming")).toBeDefined();
      expect(screen.getByText("old-name.tsx → new-name.tsx")).toBeDefined();
    });

    it("displays 'Renamed' message for completed rename command", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "file_manager",
            args: {
              command: "rename",
              path: "/components/A.tsx",
              new_path: "/components/B.tsx",
            },
            state: "result",
            result: { success: true },
          }}
        />
      );

      expect(screen.getByText("Renamed")).toBeDefined();
      expect(screen.getByText("A.tsx → B.tsx")).toBeDefined();
    });
  });

  describe("unknown tools", () => {
    it("displays fallback message for unknown tool", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "some_other_tool",
            args: {},
            state: "pending",
          }}
        />
      );

      expect(screen.getByText("Running")).toBeDefined();
      expect(screen.getByText("some_other_tool")).toBeDefined();
    });

    it("displays 'Completed' for finished unknown tool", () => {
      render(
        <ToolCallDisplay
          tool={{
            toolName: "custom_tool",
            args: {},
            state: "result",
            result: "done",
          }}
        />
      );

      expect(screen.getByText("Completed")).toBeDefined();
      expect(screen.getByText("custom_tool")).toBeDefined();
    });
  });

  describe("status indicators", () => {
    it("shows spinner when tool is in progress", () => {
      const { container } = render(
        <ToolCallDisplay
          tool={{
            toolName: "str_replace_editor",
            args: { command: "create", path: "/test.tsx" },
            state: "pending",
          }}
        />
      );

      expect(container.querySelector(".animate-spin")).toBeDefined();
    });

    it("shows green dot when tool is complete", () => {
      const { container } = render(
        <ToolCallDisplay
          tool={{
            toolName: "str_replace_editor",
            args: { command: "create", path: "/test.tsx" },
            state: "result",
            result: "done",
          }}
        />
      );

      expect(container.querySelector(".bg-emerald-500")).toBeDefined();
      expect(container.querySelector(".animate-spin")).toBeNull();
    });
  });
});
