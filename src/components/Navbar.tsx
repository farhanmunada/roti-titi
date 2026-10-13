"use client";

import { Flame, Clock, Sparkles } from "lucide-react";

interface NavbarProps {
  activeTab: "production" | "inventory" | "forecast";
  setActiveTab: (tab: "production" | "inventory" | "forecast") => void;
  criticalCount: number;
  activeBatchCount: number;
}

export function Navbar({ activeTab, setActiveTab, criticalCount, activeBatchCount }: NavbarProps) {
  return (
    <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Flame className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-stone-900">
                  ROTI TITI
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60">
                  Bakehouse OS
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Sistem Batch, FEFO Expired & Forecast Demand
              </p>
            </div>
          </div>

          {/* Quick Segmented Nav Tabs (Low Typing Touch Target) */}
          <nav className="flex items-center bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/60">
            <button
              onClick={() => setActiveTab("production")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all select-none cursor-pointer ${
                activeTab === "production"
                  ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>🍞 Batch Produksi</span>
              {activeBatchCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold">
                  {activeBatchCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all select-none cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>📦 Stok & Expired</span>
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500 text-white font-bold animate-pulse">
                  {criticalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("forecast")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all select-none cursor-pointer ${
                activeTab === "forecast"
                  ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Forecast Runway</span>
            </button>
          </nav>

          {/* Live Kitchen Clock */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200/70 px-4 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Shift Pagi Aktif</span>
          </div>
        </div>
      </div>
    </header>
  );
}
