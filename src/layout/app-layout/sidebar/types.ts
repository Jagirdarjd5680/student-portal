import type { PermissionAction, PermissionModule } from "@/data/permissions";
import React from "react";

export type MenuType = "main" | "support" | "others";

export interface SubItem {
  key: string;
  path: string;
  /** Hidden unless the user has this action (default "view") on the parent's module. */
  action?: PermissionAction;
  pro?: boolean;
  new?: boolean;
  target?: string;
}

export interface NavItem {
  key: string;
  icon: React.ReactNode;
  path?: string;
  /** Student portal: menu key the student must be allowed to open. */
  portalMenu?: string;
  /** Permission module; hidden when the user cannot view it. */
  module?: PermissionModule;
  new?: boolean;
  target?: string;
  subItems?: SubItem[];
}
