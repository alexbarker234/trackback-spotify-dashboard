export const getPageTitle = (path: string, searchParams: URLSearchParams) => {
  if (path == "/dashboard/top") {
    const type = searchParams.get("type");
    if (type === "tracks") {
      return "Top Tracks";
    } else if (type === "artists") {
      return "Top Artists";
    } else if (type === "albums") {
      return "Top Albums";
    }
  }

  switch (path) {
    case "/":
      return "Trackback";
    case "/dashboard":
      return "Trackback";
    case "/dashboard/profile":
      return "Profile";
    case "/dashboard/search":
      return "Search";
    case "/dashboard/misc":
      return "Misc";
    case "/dashboard/evolution":
      return "Evolution";
    case "/dashboard/heatmap":
      return "Heatmap";
    case "/dashboard/throwback":
      return "On This Day";
    case "/dashboard/history":
      return "Listening History";
    default:
      return "Trackback";
  }
};
