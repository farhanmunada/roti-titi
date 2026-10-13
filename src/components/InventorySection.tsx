"use client";

import { useState } from "react";
import { InventoryItemWithBatches } from "@/lib/types";
import { formatQuantity } from "@/lib/inventory-helpers";
import {
  PackagePlus,
  AlertOctagon,
  Clock,
  ArrowUpDown,
} from "lucide-react";

interface InventorySectionProps {
  inventory: InventoryItemWithBatches[];
  onOpenAddStockModal: (ingredientId?: string) => void;
}

export function InventorySection({
  inventory,
  onOpenAddStockModal,
}: InventorySectionProps) {
  const [filter, setFilter] = useState<"all" | "expiring" | "low_stock">("all");

  const filteredItems = inventory.filter((item) => {
    if (filter === "expiring") {
      return item.batches.some(
        (b) => b.expiryInfo.status === "critical" || b.expiryInfo.status === "warning" || b.expiryInfo.status === "expired"
      );
    }
    if (filter === "low_stock") {
      return item.isLowStock;
    }
    return true;
  });

  const expiringCount = inventory.reduce(
    (acc, item) =>
      acc +
      item.batches.filter(
        (b) => b.expiryInfo.status === "critical" || b.expiryInfo.status === "warning" || b.expiryInfo.status === "expired"
      ).length,
    0
  );

  const lowStockCount = inventory.filter((i) => i.isLowStock).length;

  return (
    <div className="space-y-8">
      {/* Top Banner & Control */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>Stok Bahan & Pelacakan FEFO</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {inventory.length} Jenis Bahan
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            First-Expired, First-Out (FEFO): Batch kedaluwarsa terdekat otomatis dipotong saat produksi.
          </p>
        </div>

        <button
          onClick={() => onOpenAddStockModal()}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2.5 transition-all cursor-pointer"
        >
          <PackagePlus className="w-5 h-5 stroke-[2.2]" />
          <span>Terima Batch Stok Baru</span>
        </button>
      </div>

      {/* Quick Filter Segmented Chips (Low Typing) */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            filter === "all"
              ? "bg-stone-900 text-white border-stone-900 shadow-sm"
              : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
          }`}
        >
          Semua Bahan ({inventory.length})
        </button>

        <button
          onClick={() => setFilter("expiring")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
            filter === "expiring"
              ? "bg-rose-600 text-white border-rose-600 shadow-sm"
              : "bg-white text-rose-700 border-rose-200/80 hover:bg-rose-50/50"
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Mendekati Expired ({expiringCount} batch)</span>
        </button>

        <button
          onClick={() => setFilter("low_stock")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
            filter === "low_stock"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-white text-amber-700 border-amber-200/80 hover:bg-amber-50/50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Stok di Bawah Batas ({lowStockCount})</span>
        </button>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5"
            >
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {item.category}
                    </span>
                    <h3 className="font-extrabold text-base text-stone-900 mt-1">
                      {item.name}
                    </h3>
                  </div>

                  {/* Stock Quantity Badge */}
                  <div className="text-right">
                    <span className="text-xl font-black text-stone-900 tabular-nums">
                      {formatQuantity(item.totalRemaining, item.unit)}
                    </span>
                    <p className="text-[11px] text-stone-400 font-medium">
                      Min: {formatQuantity(item.minStock, item.unit)}
                    </p>
                  </div>
                </div>

                {/* Runway Bar & Status */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Runway:</span>
                    <strong className="text-stone-900">{item.runwayDays} hari</strong>
                  </div>
                  <span className="text-stone-300">•</span>
                  <div className="text-xs text-stone-500 font-medium">
                    Burn rate: {formatQuantity(item.dailyBurnRate, item.unit)}/hari
                  </div>
                </div>
              </div>

              {/* Active Batches / Lots (FEFO Breakdown) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    Urutan Lot FEFO
                  </span>
                  <span>{item.batches.length} Lot Aktif</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {item.batches.length === 0 ? (
                    <div className="p-3 rounded-xl bg-stone-50 text-stone-400 text-xs text-center">
                      Stok kosong. Butuh restock segera.
                    </div>
                  ) : (
                    item.batches.map((batch) => {
                      return (
                        <div
                          key={batch.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-stone-800 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                              {batch.lotNumber}
                            </span>
                            <span className="font-bold text-stone-700">
                              {formatQuantity(batch.remainingQty, item.unit)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-bold border text-[11px] ${batch.expiryInfo.badgeColor}`}
                            >
                              {batch.expiryInfo.label}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Add Stock Action */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onOpenAddStockModal(item.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PackagePlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Batch {item.name.split(" ")[0]}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
