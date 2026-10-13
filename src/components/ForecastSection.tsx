"use client";

import { useState } from "react";
import { InventoryItemWithBatches } from "@/lib/types";
import { formatQuantity } from "@/lib/inventory-helpers";
import {
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";

interface ForecastSectionProps {
  inventory: InventoryItemWithBatches[];
  onQuickRestock: (ingredientId: string, qty: number, daysValid: number) => Promise<void>;
}

export function ForecastSection({
  inventory,
  onQuickRestock,
}: ForecastSectionProps) {
  const [restockingId, setRestockingId] = useState<string | null>(null);

  // Sort by runway ascending (items running out first come first)
  const sortedByRunway = [...inventory].sort((a, b) => a.runwayDays - b.runwayDays);

  const criticalRunway = sortedByRunway.filter((i) => i.runwayDays <= 4 || i.isLowStock);

  const handleQuickRestock = async (item: InventoryItemWithBatches) => {
    setRestockingId(item.id);
    try {
      // Standard recommended lot size
      const defaultQty = item.unit === "gr" ? 25000 : item.unit === "ml" ? 15000 : 120;
      await onQuickRestock(item.id, defaultQty, 30);
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>Forecast Demand & Estimasi Runway</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Moving Average 7 Hari
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Proyeksi berapa hari stok akan bertahan berdasarkan ritme konsumsi riil dapur.
          </p>
        </div>
      </div>

      {/* Critical Runway Warnings */}
      {criticalRunway.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-800">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              Perhatian: Bahan Kritis (Habis &lt; 4 Hari)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalRunway.map((item) => {
              const isRestocking = restockingId === item.id;
              const defaultReorderLabel =
                item.unit === "gr" ? "+25 kg" : item.unit === "ml" ? "+15 Liter" : "+120 pcs";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{item.name}</h4>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        Sisa {item.runwayDays} Hari
                      </span>
                      <span className="text-stone-500">
                        ({formatQuantity(item.totalRemaining, item.unit)})
                      </span>
                    </div>
                  </div>

                  {/* 1-Tap Quick Reorder Button */}
                  <button
                    onClick={() => handleQuickRestock(item)}
                    disabled={isRestocking}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isRestocking ? "Memproses..." : `Restock ${defaultReorderLabel}`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Items Runway Chart / Progress Visual */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base text-stone-900">
              Runway Stok Semua Bahan (Hari Bertahan)
            </h3>
          </div>
          <span className="text-xs font-bold text-stone-500">
            Dihitung dari rata-rata pemakaian harian
          </span>
        </div>

        <div className="space-y-4">
          {sortedByRunway.map((item) => {
            // Max gauge 14 days
            const percent = Math.min(100, Math.round((item.runwayDays / 14) * 100));
            const isDanger = item.runwayDays <= 3;
            const isWarn = item.runwayDays > 3 && item.runwayDays <= 7;
            const barColor = isDanger
              ? "bg-rose-500"
              : isWarn
              ? "bg-amber-500"
              : "bg-emerald-500";

            const defaultReorderLabel =
              item.unit === "gr" ? "+25 kg" : item.unit === "ml" ? "+15 L" : "+120 pcs";
            const isRestocking = restockingId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="w-full md:w-56 shrink-0">
                  <h4 className="font-extrabold text-sm text-stone-900">{item.name}</h4>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Stok: <strong>{formatQuantity(item.totalRemaining, item.unit)}</strong> • Burn:{" "}
                    {formatQuantity(item.dailyBurnRate, item.unit)}/hari
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="flex-1 w-full flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full bg-stone-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-black w-24 text-right tabular-nums ${
                      isDanger
                        ? "text-rose-600"
                        : isWarn
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {item.runwayDays} Hari
                  </span>
                </div>

                {/* 1-Tap Quick Action */}
                <button
                  onClick={() => handleQuickRestock(item)}
                  disabled={isRestocking}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-stone-500" />
                  <span>{isRestocking ? "..." : `+ ${defaultReorderLabel}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
