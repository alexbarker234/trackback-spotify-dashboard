import LinkCard from "@/components/cards/LinkCard";
import { faCalendar, faChartLine, faFire, faGrip, faRankingStar } from "@fortawesome/free-solid-svg-icons";

export default async function MiscPage() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-2">
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
      <LinkCard
        href="/dashboard/years/list"
        title="Most listened by year"
        description="Your top track for each album release year"
        icon={faRankingStar}
      />
      <LinkCard
        href="/dashboard/years/analysis"
        title="Release year analysis"
        description="Charts and numbers for how you listen across years"
        icon={faChartLine}
      />
      <LinkCard
        href="/dashboard/peak-days"
        title="Most in one day"
        description="Songs ranked by their highest listen count on a single day"
        icon={faFire}
      />
    </div>
  );
}
