"use client";

import { Suspense } from "react";

import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/layout/toaster";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/30">
      <Sidebar />
      <div className="min-h-dvh md:pl-64">
        <Header />
        <div className="pb-20 md:pb-0">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
      <MobileBottomNav />
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
    </div>
  );
}
