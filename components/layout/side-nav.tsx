"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Plus, HelpCircle, LogOut } from "lucide-react";
import { signOut } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SideNavProps {
  userRole?: "gestor" | "consultor" | "viewer";
}

export function SideNav({ userRole }: SideNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/clientes",
      label: "Clients",
      icon: Users,
    },
    ...(userRole === "gestor"
      ? [
          {
            href: "/dashboard/admin",
            label: "Admin",
            icon: Settings,
          },
        ]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="fixed left-0 h-full w-64 z-50 bg-surface-container-lowest flex flex-col py-6 px-4 gap-8 border-r border-outline-variant/20">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-headline font-extrabold text-primary text-lg leading-tight">
            Innovation Hub
          </h2>
          <p className="text-xs text-outline font-medium">Analytical Atelier</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out hover:translate-x-1 font-body font-medium text-sm",
                active
                  ? "bg-primary/10 text-primary border-r-4 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div className="mt-8 px-2">
          <Button className="w-full py-3 bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </Button>
        </div>
      </nav>
      <div className="flex flex-col gap-1 pt-4 border-t border-outline-variant/20">
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out hover:translate-x-1 text-on-surface-variant hover:bg-surface-container-low font-body font-medium text-sm"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Support</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out hover:translate-x-1 text-on-surface-variant hover:bg-surface-container-low font-body font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
