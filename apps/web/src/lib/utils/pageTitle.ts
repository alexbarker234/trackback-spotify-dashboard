export const getPageTitle = (path: string) => {
  switch (path) {
    case "/":
      return "Trackback";
    case "/dashboard":
      return "Trackback";
    case "/dashboard/profile":
      return "Profile";
    case "/dashboard/top/tracks":
      return "Top Tracks";
    case "/dashboard/top/artists":
      return "Top Artists";
    case "/dashboard/top/albums":
      return "Top Albums";
    case "/dashboard/search":
      return "Search";
    case "/dashboard/misc":
      return "Misc";
    default:
      return "Trackback";
  }
};
