import LinkCard from "@/components/cards/LinkCard";
import { faCalendar, faGrip, faRankingStar } from "@fortawesome/free-solid-svg-icons";

export default async function MiscPage() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-2 py-4 md:grid-cols-2 lg:px-8">
      <LinkCard
        href="/dashboard/evolution"
        title="Evolution"
        description="See an animated chart of your listening history over time"
        icon={faRankingStar}
      />
      <LinkCard
        href="/dashboard/heatmap"
        title="Heatmap"
        description="See a heatmap of your listening activity"
        icon={faGrip}
      />
      <LinkCard
        href="dashboard/throwback"
        title="On This Day"
        description="Discover what you were listening to on this date in previous years"
        icon={faCalendar}
      />
    </div>
  );
}
