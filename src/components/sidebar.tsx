"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const contentLinks = [
  { href: "/", label: "Dashboard", icon: "🎯" },
  { href: "/agent", label: "Agent", icon: "🤖" },
  { href: "/feed", label: "Feed", icon: "📰" },
  { href: "/queue", label: "Queue", icon: "📋" },
  { href: "/brain", label: "Brain", icon: "🧠" },
];

const configLinks = [
  { href: "/connections", label: "Connections", icon: "🔗" },
  { href: "/schedules", label: "Schedules", icon: "📅" },
  { href: "/instructions", label: "Custom Instructions", icon: "📝" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/30 bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
          CE
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">Content Engine</span>
      </div>

      {/* Create Post Button */}
      <div className="px-4 pb-4">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
          + Create a post
        </Button>
      </div>

      <div className="mx-4 h-px bg-border/30" />

      <ScrollArea className="flex-1">
        <div className="px-3 py-5">
          {/* Content Section */}
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Content
          </p>
          <nav className="space-y-1">
            {contentLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-sidebar-accent text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="my-5 mx-1 h-px bg-border/30" />

          {/* Configuration Section */}
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Configuration
          </p>
          <nav className="space-y-1">
            {configLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-sidebar-accent text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>

      <div className="mx-4 h-px bg-border/30" />

      {/* Settings */}
      <div className="px-3 py-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            pathname === "/settings"
              ? "bg-sidebar-accent text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          )}
        >
          <span className="text-base">⚙️</span>
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
