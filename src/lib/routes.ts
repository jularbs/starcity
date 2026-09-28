import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CreditCard,
  Gem,
  Home,
  ImagesIcon,
  Rocket,
  Settings,
  ShoppingCart,
  StickyNote,
  Ticket,
  Users,
} from "lucide-react";
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE } from "@/lib/constants";

export type NavChild = {
  title: string;
  link: string;
};

export type NavItem = {
  title: string;
  link: string;
  icon: LucideIcon;
  /** Departments/roles allowed to see this item. Omit to allow every signed-in role. */
  roles?: string[];
  external?: boolean;
  children?: NavChild[];
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const navigationRoutes: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", link: "/dashboard", icon: Home },
      {
        title: "Ecommerce Homepage",
        link: process.env.NEXT_PUBLIC_WEB_DOMAIN ?? "/",
        icon: Home,
        external: true,
      },
    ],
  },
  {
    label: "E-Commerce",
    items: [
      {
        title: "Tickets Management",
        link: "/dashboard/tickets-management",
        icon: Ticket,
        roles: [ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE],
      },
      {
        title: "Payment Gateway",
        link: "/dashboard/payment-gateway",
        icon: CreditCard,
        roles: [ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE],
      },
      {
        title: "Sales Management",
        link: "/dashboard/sales-management",
        icon: ShoppingCart,
        roles: [ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE],
      },
      {
        title: "Promos Management",
        link: "/dashboard/promos-management",
        icon: Gem,
        roles: [ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE],
      },
    ],
  },
  {
    label: "Content Management",
    items: [
      {
        title: "Posts Management",
        link: "/dashboard/post-management",
        icon: StickyNote,
        roles: [ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE, CONTENT_MANAGER_ROLE],
        children: [
          { title: "Create New Post", link: "/dashboard/post-management/create-post" },
          { title: "View Posts", link: "/dashboard/post-management" },
        ],
      },
      {
        title: "Pages Management",
        link: "/dashboard/page-management",
        icon: StickyNote,
        roles: [ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE],
        children: [
          { title: "Park Regulations", link: "/dashboard/page-management/park_regulations" },
          { title: "Promos", link: "/dashboard/page-management/promos" },
          { title: "Park Directions", link: "/dashboard/page-management/park_directions" },
          { title: "FAQs", link: "/dashboard/page-management/faqs" },
          { title: "Privacy Policy", link: "/dashboard/page-management/privacy_policy" },
          { title: "Terms and Conditions", link: "/dashboard/page-management/terms_and_conditions" },
          { title: "Pre-purchase Message", link: "/dashboard/page-management/eticket_consent_clause" },
          { title: "Tickets Footer", link: "/dashboard/page-management/tickets_footer" },
        ],
      },
      {
        title: "Rides Management",
        link: "/dashboard/rides-management",
        icon: Rocket,
        roles: [ADMIN_ROLE, CONTENT_MANAGER_ROLE],
        children: [{ title: "Manage Rides", link: "/dashboard/rides-management/rides" }],
      },
      {
        title: "Image Slider",
        link: "/dashboard/image-slider-management",
        icon: ImagesIcon,
        roles: [ADMIN_ROLE, CONTENT_MANAGER_ROLE],
      },
    ],
  },
  {
    label: "Site Settings",
    items: [
      {
        title: "Manage Settings",
        link: "/dashboard/settings",
        icon: Settings,
        roles: [ADMIN_ROLE, CONTENT_MANAGER_ROLE],
      },
      {
        title: "User Management",
        link: "/dashboard/user-management",
        icon: Users,
        roles: [ADMIN_ROLE],
      },
      {
        title: "Activity Monitor",
        link: "/dashboard/activity-monitor",
        icon: Activity,
        roles: [ADMIN_ROLE],
      },
    ],
  },
];

const isRouteVisible = (item: NavItem, role?: string | null) => {
  if (!item.roles || item.roles.length === 0) return true;
  if (!role) return false;
  return item.roles.includes(role);
};

/** Returns navigation groups filtered down to the items visible for the given role, dropping empty groups. */
export function getVisibleNavigation(role?: string | null): NavGroup[] {
  return navigationRoutes
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isRouteVisible(item, role)),
    }))
    .filter((group) => group.items.length > 0);
}
