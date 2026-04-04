export interface NavLink {
  title: string;
  path: string;
  children?: NavLink[];
}

export const navlinks: NavLink[] = [
  {
    title: "ホーム",
    path: "/",
    children: [
      {
        title: "私たちについて",
        path: "/about",
        children: [
          { title: "合気道について", path: "/about/aikido" },
          { title: "リンク集", path: "/about/links" },
          { title: "応援する", path: "/support" },
        ],
      },
      {
        title: "活動について",
        path: "/club",
        children: [
          { title: "稽古場所", path: "/access" },
          { title: "稽古予定", path: "/calendar" },
        ],
      },
      { title: "お問い合わせ", path: "/contact" },
    ],
  },
];

export interface BreadcrumbItem extends NavLink {
  isCurrent?: boolean;
}

function findNavInTree(
  pathname: string,
  items: NavLink[] = navlinks,
): NavLink | null {
  for (const item of items) {
    if (item.path === pathname) return item;
    if (item.children) {
      const found = findNavInTree(pathname, item.children);
      if (found) return found;
    }
  }
  return null;
}

function getPathToNode(
  pathname: string,
  items: NavLink[] = navlinks,
  path: NavLink[] = [],
): NavLink[] {
  for (const item of items) {
    const currentPath = [...path, item];
    if (item.path === pathname) return currentPath;
    if (item.children) {
      const found = getPathToNode(pathname, item.children, currentPath);
      if (found.length > 0) return found;
    }
  }
  return [];
}

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/") {
    return [{ title: "ホーム", path: "/", isCurrent: true }];
  }

  const path = getPathToNode(pathname);
  return path.map((item, index) => ({
    ...item,
    isCurrent: index === path.length - 1,
  }));
}

export function getFlatNavLinks(): NavLink[] {
  const flat: NavLink[] = [];

  function flatten(items: NavLink[]) {
    for (const item of items) {
      flat.push({ title: item.title, path: item.path });
      if (item.children) {
        flatten(item.children);
      }
    }
  }

  flatten(navlinks);
  return flat;
}
