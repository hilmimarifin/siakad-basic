"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  School,
  GraduationCap,
  DollarSign,
  Settings,
} from "lucide-react";

interface SidebarProps {
  userRole: "admin" | "principal" | "teacher";
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "principal", "teacher"],
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      roles: ["principal"],
    },
    {
      name: "Classes",
      href: "/classes",
      icon: School,
      roles: ["principal"],
    },
    {
      name: "Students",
      href: "/students",
      icon: GraduationCap,
      roles: ["admin", "principal", "teacher"],
    },
    {
      name: "Payments",
      href: "/payments",
      icon: DollarSign,
      roles: ["admin", "principal", "teacher"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">School SIS</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
