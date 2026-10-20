import ItemCoverArt from "@/components/ItemCoverArt";
import { catalogName } from "@/lib/utils/catalogName";
import { Listen } from "@/types";
import Link from "next/link";
import LocalDate from "../LocalDate";
import LocalTime from "../LocalTime";

export default function ListenCard({ listen }: { listen: Listen }) {
  return (
    <Link
      href={`/dashboard/track/${listen.trackIsrc}`}
      className="block rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10"
    >
      <div className="flex items-center gap-4">
        {/* Image */}
        <ItemCoverArt
          imageUrl={listen.imageUrl}
          name={listen.trackName}
          className="h-16 w-16 rounded-lg shadow-lg"
        />
        {/* Content */}
        <div>
          <p className="text-white">{catalogName(listen.trackName)}</p>
          <p className="text-sm text-gray-400">
            <LocalDate date={listen.playedAt} /> • <LocalTime date={listen.playedAt} />
          </p>
        </div>
      </div>
    </Link>
  );
}
