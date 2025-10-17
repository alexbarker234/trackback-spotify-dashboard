export const getPageTitle = (path: string) => {
  switch (path) {
    case "/":
      return "Home";
    case "/dashboard":
      return "Dashboard";
    case "/dashboard/profile":
      return "Profile";
    default:
      return "Trackback";
  }
};
