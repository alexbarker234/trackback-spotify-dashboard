import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import ErrorPage from "./ErrorPage";

export default function NoData() {
  return (
    <ErrorPage
      title="No Data"
      subtitle="No data found for this item"
      message="Oops! No data found for this item."
      icon={faQuestion}
      iconBgColor="bg-gradient-to-br from-purple-500/10 to-pink-500/10"
      iconColor="text-purple-400"
    />
  );
}
