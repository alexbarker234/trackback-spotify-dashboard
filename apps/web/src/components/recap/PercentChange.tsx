import { getPercentChange } from "@/lib/recap/percentChange";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PercentChange({
  current,
  previous
}: {
  current: number;
  previous: number;
}) {
  const change = getPercentChange(current, previous);
  const color =
    change.direction === "up" || change.direction === "new"
      ? "text-emerald-400"
      : change.direction === "down"
        ? "text-red-400"
        : "text-zinc-400";
  const icon =
    change.direction === "down" ? faCaretDown : change.direction === "flat" ? null : faCaretUp;

  return (
    <span className={`inline-flex items-center gap-0.5 text-sm font-semibold ${color}`}>
      {icon && <FontAwesomeIcon icon={icon} className="h-4 w-4" />}
      {change.label}
    </span>
  );
}
