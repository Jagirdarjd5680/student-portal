"use client";

import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "@/i18n/navigation";
import { can, getAdminRaw, subscribeAdmin, type AdminUser } from "@/lib/auth";
import {
  applySidebarTheme,
  cacheSidebarTheme,
  cleanSidebarTheme,
  readCachedSidebarTheme,
} from "@/lib/sidebar-theme";
import { settingsService } from "@/services";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { navItems, othersItems, supportItems } from "./data";
import AppSidebarHeader from "./sidebar-header";
import SidebarNavGroup from "./sidebar-nav-group";
import { MenuType, NavItem } from "./types";

const menuSections: { type: MenuType; labelKey: string; items: NavItem[] }[] = [
  { type: "main", labelKey: "groups.menu", items: navItems },
  { type: "support", labelKey: "groups.support", items: supportItems },
  { type: "others", labelKey: "groups.others", items: othersItems },
];

type Section = (typeof menuSections)[number];

const findMatchingSubmenu = (path: string, sections: Section[]) => {
  for (const section of sections) {
    for (let index = 0; index < section.items.length; index++) {
      const nav = section.items[index];
      if (
        nav.subItems?.some(
          (subItem) =>
            subItem.path === path ||
            (subItem.path === "/ai-settings" &&
              path.startsWith("/ai-settings")),
        )
      ) {
        return { type: section.type, index };
      }
    }
  }
  return null;
};

// Drop menus (and sub-items) the signed-in user has no permission for.
function filterByPermission(
  items: NavItem[],
  admin: AdminUser | null,
): NavItem[] {
  if (!admin) return items;
  return items
    .filter(
      (nav) =>
        !nav.module ||
        can(admin, nav.module, "view") ||
        can(admin, nav.module, "add"),
    )
    .map((nav) =>
      nav.module && nav.subItems
        ? {
            ...nav,
            subItems: nav.subItems.filter((sub) =>
              can(admin, nav.module!, sub.action ?? "view"),
            ),
          }
        : nav,
    )
    .filter((nav) => !nav.subItems || nav.subItems.length > 0);
}

interface AppSidebarProps {
  /** Custom menu (e.g. the student portal). Skips the admin permission logic. */
  items?: NavItem[];
  /** Red banner under the logo (portal name + greeting). */
  portal?: { title: string; subtitle?: string; href: string };
}

export default function AppSidebar({ items, portal }: AppSidebarProps = {}) {
  const sections: Section[] = items
    ? [{ type: "main", labelKey: "groups.menu", items }]
    : menuSections;
  const { open, isMobile, isHovered } = useSidebar();
  const pathname = usePathname();

  const adminRaw = useSyncExternalStore(
    subscribeAdmin,
    getAdminRaw,
    () => null,
  );
  const admin = useMemo<AdminUser | null>(() => {
    try {
      return adminRaw ? (JSON.parse(adminRaw) as AdminUser) : null;
    } catch {
      return null;
    }
  }, [adminRaw]);

  // Admin sidebar colours (Settings → Sidebar Colors). The student portal keeps its own look.
  const isAdminSidebar = !items;
  useEffect(() => {
    if (!isAdminSidebar) return;
    applySidebarTheme(readCachedSidebarTheme());
    let alive = true;
    settingsService
      .appearance()
      .then((r) => {
        if (!alive) return;
        const theme = cleanSidebarTheme(r);
        cacheSidebarTheme(theme);
        applySidebarTheme(theme);
      })
      .catch(() => {});
    return () => {
      alive = false;
      applySidebarTheme(null);
    };
  }, [isAdminSidebar]);

  const showContent = open || isHovered || isMobile;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: MenuType;
    index: number;
  } | null>(() => findMatchingSubmenu(pathname, sections));

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenSubmenu(findMatchingSubmenu(pathname, sections));
  }

  const handleSubmenuToggle = (index: number, menuType: MenuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const activeSections = sections
    .map((section) => ({
      ...section,
      items: items ? section.items : filterByPermission(section.items, admin),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <Sidebar side="left" collapsible="icon">
      <AppSidebarHeader showContent={showContent} portal={portal} />

      <SidebarContent className="overflow-y-auto px-5 duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {activeSections.map((section) => (
              <SidebarNavGroup
                key={section.type}
                labelKey={section.labelKey}
                menuType={section.type}
                items={section.items}
                openSubmenu={openSubmenu}
                showContent={showContent}
                pathname={pathname}
                onToggleSubmenu={handleSubmenuToggle}
              />
            ))}
          </div>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
