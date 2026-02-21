"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Radio, 
  LayoutDashboard, 
  Bot, 
  Newspaper, 
  ListTodo, 
  Brain, 
  Link2, 
  Calendar, 
  FileText, 
  Settings,
  Plus
} from "lucide-react";

const contentLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent", label: "Agent", icon: Bot },
  { href: "/feed", label: "Feed", icon: Newspaper },
  { href: "/queue", label: "Queue", icon: ListTodo },
  { href: "/brain", label: "Brain", icon: Brain },
];

const configLinks = [
  { href: "/connections", label: "Connections", icon: Link2 },
  { href: "/schedules", label: "Schedules", icon: Calendar },
  { href: "/instructions", label: "Custom Instructions", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-cyan-500/20 bg-[#0a0f1a]/95 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/30">
          <Radio className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <span className="text-lg font-semibold tracking-tight text-white">Content</span>
          <span className="text-lg font-semibold tracking-tight text-cyan-400">Engine</span>
        </div>
      </div>

      {/* Create Post Button */}
      <div className="px-4 pb-4">
        <Button className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <Plus className="w-4 h-4 mr-2" /> Create a post
        </Button>
      </div>

      <div className="mx-4 h-px bg-cyan-500/10" />

      <ScrollArea className="flex-1">
        <div className="px-3 py-5">
          {/* Content Section */}
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-cyan-500/60">
            Content
          </p>
          <nav className="space-y-1">
            {contentLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    pathname === link.href
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                      : "text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-200"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="my-5 mx-1 h-px bg-cyan-500/10" />

          {/* Configuration Section */}
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-cyan-500/60">
            Configuration
          </p>
          <nav className="space-y-1">
            {configLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    pathname === link.href
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                      : "text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-200"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </ScrollArea>

      <div className="mx-4 h-px bg-cyan-500/10" />

      {/* Settings */}
      <div className="px-3 py-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            pathname === "/settings"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              : "text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-200"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
