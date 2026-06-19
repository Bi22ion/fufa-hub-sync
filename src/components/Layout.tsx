import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Ticker } from "./Ticker";
import { RadioBar } from "./RadioBar";
import { useRealtimeCms } from "@/lib/useRealtimeCms";

export function Layout({ children, showTicker = true }: { children: ReactNode; showTicker?: boolean }) {
  useRealtimeCms();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {showTicker && <Ticker />}
      <main className="flex-1 pb-20">{children}</main>
      <Footer />
      <RadioBar />
    </div>
  );
}
