"use client";

import {
  Dumbbell,
  LayoutDashboard,
  Scale,
  Settings,
  Utensils,
} from "lucide-react";
import { TabNav, type TabItem } from "@/components/ui";

// Icons are functions → must live in a client module (not serializable as
// props from a Server Component).
const TABS: TabItem[] = [
  { href: "/dashboard", label: "儀表", icon: LayoutDashboard },
  { href: "/weight", label: "體重", icon: Scale },
  { href: "/diet", label: "飲食", icon: Utensils },
  { href: "/exercise", label: "運動", icon: Dumbbell },
  { href: "/settings", label: "設定", icon: Settings },
];

export function AppTabNav() {
  return <TabNav items={TABS} />;
}
