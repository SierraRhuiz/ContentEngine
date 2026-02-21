"use client";

import { Sidebar } from "@/components/sidebar";
import "./scifi-theme.css";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1a] bg-grid">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
