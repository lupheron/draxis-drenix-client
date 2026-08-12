export type NavSubItem = {
  id: string;
  label: string;
  href: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  hrOnly?: boolean;
  children: NavSubItem[];
};

export const PORTAL_NAV: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/my-day",
    children: [
      { id: "overview", label: "Overview", href: "/my-day" },
      { id: "charts", label: "Charts", href: "/my-day?view=charts" },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    href: "/performance",
    children: [
      { id: "trends", label: "Trends", href: "/performance" },
      { id: "calls", label: "Calls", href: "/performance?view=calls" },
      { id: "messages", label: "Messages", href: "/performance?view=messages" },
      {
        id: "pipeline",
        label: "Pipeline",
        href: "/performance?view=pipeline",
      },
    ],
  },
  {
    id: "leads",
    label: "My Leads",
    href: "/leads",
    hrOnly: true,
    children: [
      { id: "all", label: "All", href: "/leads" },
      { id: "follow_up", label: "Follow-ups", href: "/leads?status=follow_up" },
      { id: "hired", label: "Hired", href: "/leads?status=hired" },
      { id: "loaded", label: "Loaded", href: "/leads?status=loaded" },
      { id: "new", label: "New", href: "/leads?status=new" },
    ],
  },
  {
    id: "driver-database",
    label: "Driver DB",
    href: "/driver-database",
    hrOnly: true,
    children: [
      { id: "search", label: "Search", href: "/driver-database" },
      { id: "browse", label: "Browse", href: "/driver-database?tab=browse" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    children: [
      { id: "details", label: "Details", href: "/profile" },
      { id: "security", label: "Security", href: "/profile?view=security" },
    ],
  },
  {
    id: "help",
    label: "Help",
    href: "/help",
    children: [
      { id: "guide", label: "Guide", href: "/help" },
      { id: "boundaries", label: "Boundaries", href: "/help?view=boundaries" },
    ],
  },
];

export function navForEmployee(isHr: boolean): NavItem[] {
  return PORTAL_NAV.filter((item) => (item.hrOnly ? isHr : true)).map(
    (item) => {
      if (item.id === "performance" && !isHr) {
        return {
          ...item,
          children: item.children.filter((child) => child.id !== "pipeline"),
        };
      }
      return item;
    },
  );
}

export function activeNavItem(
  pathname: string,
  isHr: boolean,
): NavItem | undefined {
  const items = navForEmployee(isHr);
  return (
    items.find(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? items[0]
  );
}

export function isSubActive(
  href: string,
  pathname: string,
  search: string,
): boolean {
  const url = new URL(href, "http://local");
  const current = new URLSearchParams(search);
  const target = url.searchParams;

  if (pathname !== url.pathname) return false;

  if ([...target.keys()].length === 0) {
    return (
      !current.get("view") &&
      !current.get("status") &&
      !current.get("tab")
    );
  }

  for (const [key, value] of target.entries()) {
    if (current.get(key) !== value) return false;
  }
  return true;
}
