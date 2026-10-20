import { catalogName } from "@/lib/utils/catalogName";
import { cn } from "@/lib/utils/cn";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ItemCoverArt({
  imageUrl,
  name,
  className
}: {
  imageUrl?: string | null;
  name?: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return <img src={imageUrl} alt={catalogName(name)} className={cn("object-cover", className)} />;
  }

  if (name?.trim()) return null;

  return (
    <div
      role="img"
      aria-label={catalogName(name)}
      className={cn("flex items-center justify-center bg-white/10", className)}
    >
      <FontAwesomeIcon icon={faMusic} className="!h-1/2 !w-1/2 text-gray-400" />
    </div>
  );
}
