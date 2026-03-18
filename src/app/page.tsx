'use client';

import { Sidebar } from "@/components/sidebar";
import DashboardPage from './(protected)/page';

export default function HomePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1a]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative z-10">
          <DashboardPage />
        </div>
      </main>
    </div>
  );
}
