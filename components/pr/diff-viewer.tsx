"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@/components/ui/icons";

type LineType = "add" | "del" | "context" | "hunk";

interface DiffLine {
  type: LineType;
  content: string;
}

interface DiffFile {
  path: string;
  additions: number;
  deletions: number;
  lines: DiffLine[];
}

/** Lines that are diff metadata rather than content we want to render. */
const SKIP_PREFIXES = [
  "index ",
  "--- ",
  "+++ ",
  "new file mode",
  "deleted file mode",
  "old mode",
  "new mode",
  "similarity index",
  "rename from",
  "rename to",
  "Binary files",
  "\\ No newline",
];

function parseDiff(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  let current: DiffFile | null = null;

  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --git")) {
      const match = line.match(/ b\/(.+)$/);
      current = {
        path: match?.[1] ?? line.replace("diff --git ", ""),
        additions: 0,
        deletions: 0,
        lines: [],
      };
      files.push(current);
      continue;
    }
    if (!current) continue;
    if (SKIP_PREFIXES.some((p) => line.startsWith(p))) continue;

    if (line.startsWith("@@")) {
      current.lines.push({ type: "hunk", content: line });
    } else if (line.startsWith("+")) {
      current.additions++;
      current.lines.push({ type: "add", content: line.slice(1) });
    } else if (line.startsWith("-")) {
      current.deletions++;
      current.lines.push({ type: "del", content: line.slice(1) });
    } else {
      current.lines.push({ type: "context", content: line.startsWith(" ") ? line.slice(1) : line });
    }
  }
  return files;
}

export function DiffViewer({ diff }: { diff: string }) {
  const files = useMemo(() => parseDiff(diff), [diff]);

  if (files.length === 0) {
    return <p className="text-sm text-fg-muted">No file changes to display.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {files.map((file) => (
        <DiffFileBlock key={file.path} file={file} />
      ))}
    </div>
  );
}

function DiffFileBlock({ file }: { file: DiffFile }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 bg-surface-raised px-3 py-2 text-left transition-colors hover:bg-surface-hover"
      >
        <ChevronRightIcon
          className={cn("size-3.5 shrink-0 text-fg-subtle transition-transform", open && "rotate-90")}
        />
        <span className="truncate font-mono text-xs text-fg">{file.path}</span>
        <span className="ml-auto shrink-0 font-mono text-[0.7rem]">
          <span className="text-[var(--color-diff-add-fg)]">+{file.additions}</span>{" "}
          <span className="text-[var(--color-diff-del-fg)]">−{file.deletions}</span>
        </span>
      </button>

      {open && (
        <div className="overflow-x-auto">
          <pre className="min-w-full font-mono text-xs leading-relaxed">
            {file.lines.map((line, i) => (
              <DiffLineRow key={i} line={line} />
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}

function DiffLineRow({ line }: { line: DiffLine }) {
  if (line.type === "hunk") {
    return (
      <div className="bg-accent-soft/40 px-3 py-0.5 text-[var(--color-accent)] select-none">
        {line.content}
      </div>
    );
  }

  const styles: Record<Exclude<LineType, "hunk">, string> = {
    add: "bg-[var(--color-diff-add)] text-[var(--color-diff-add-fg)]",
    del: "bg-[var(--color-diff-del)] text-[var(--color-diff-del-fg)]",
    context: "text-fg-muted",
  };
  const marker = { add: "+", del: "−", context: " " }[line.type];

  return (
    <div className={cn("flex px-3", styles[line.type])}>
      <span aria-hidden className="mr-3 w-2 shrink-0 select-none opacity-60">
        {marker}
      </span>
      <span className="whitespace-pre-wrap break-all">{line.content || " "}</span>
    </div>
  );
}
