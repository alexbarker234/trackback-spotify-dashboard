"use client";

import { Children, ReactNode, useMemo, useState } from "react";

type ExpandableListProps = {
  children: ReactNode;
  initialCount?: number;
  containerClassName?: string;
  showMoreLabel?: string;
  showLessLabel?: string;
};

export default function ExpandableList({
  children,
  initialCount = 10,
  containerClassName,
  showMoreLabel = "Show more",
  showLessLabel = "Collapse"
}: ExpandableListProps) {
  const [expanded, setExpanded] = useState(false);

  // this is strange
  const allChildren = useMemo(() => Children.toArray(children), [children]);
  const hasOverflow = allChildren.length > initialCount;
  const visibleChildren =
    expanded || !hasOverflow ? allChildren : allChildren.slice(0, initialCount);

  return (
    <div>
      <div className={containerClassName}>{visibleChildren}</div>
      {hasOverflow && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="cursor-pointer text-sm text-zinc-400 transition-colors hover:text-zinc-300"
          >
            {expanded ? showLessLabel : showMoreLabel}
          </button>
        </div>
      )}
    </div>
  );
}
