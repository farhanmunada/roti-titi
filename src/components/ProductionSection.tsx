"use client";

import { useState } from "react";
import { ProductionBatch, Recipe, ProductionStage } from "@/lib/types";
import {
  Plus,
  Flame,
  CheckCircle2,
  Hourglass,
  Sparkles,
  ChevronRight,
  Timer,
  Layers,
} from "lucide-react";

interface ProductionSectionProps {
  batches: (ProductionBatch & { recipe: Recipe })[];
  onAdvanceStage: (batchId: string) => Promise<void>;
  onOpenNewBatchModal: () => void;
}

const STAGES: { key: ProductionStage; label: string; icon: typeof Flame; color: string; bg: string }[] = [
  { key: "planned", label: "Direncanakan", icon: Hourglass, color: "text-stone-600", bg: "bg-stone-100" },
  { key: "mixing", label: "Mixing & Adonan", icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "proofing", label: "Proofing", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "baking", label: "Baking (Oven)", icon: Flame, color: "text-rose-600", bg: "bg-rose-50" },
  { key: "completed", label: "Selesai (Display)", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
];

export function ProductionSection({
  batches,
  onAdvanceStage,
  onOpenNewBatchModal,
}: ProductionSectionProps) {
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  const handleAdvance = async (batchId: string) => {
    setAdvancingId(batchId);
    try {
      await onAdvanceStage(batchId);
    } finally {
      setAdvancingId(null);
    }
  };

  const activeBatches = batches.filter((b) => b.stage !== "completed");
  const completedBatches = batches.filter((b) => b.stage === "completed");

  const getNextStageLabel = (currentStage: ProductionStage): string | null => {
    switch (currentStage) {
      case "planned":
        return "Mulai Mixing →";
      case "mixing":
        return "Masuk Proofing →";
      case "proofing":
        return "Masuk Deck Oven →";
      case "baking":
        return "Keluarkan Oven (Selesai) ✓";
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action & KPI Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>Alur Produksi Dapur</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              {activeBatches.length} Batch Aktif
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Tap tombol tahapan untuk menggeser batch tanpa ketik keyboard.
          </p>
        </div>

        <button
          onClick={onOpenNewBatchModal}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2.5 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Mulai Batch Baru</span>
        </button>
      </div>

      {/* Production Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {STAGES.filter((s) => s.key !== "completed").map((stage) => {
          const stageBatches = batches.filter((b) => b.stage === stage.key);
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              className="bg-stone-50/80 rounded-3xl p-5 border border-stone-200/80 flex flex-col min-h-[420px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${stage.bg} ${stage.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-stone-900">{stage.label}</span>
                </div>
                <span className="text-xs font-bold text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                  {stageBatches.length}
                </span>
              </div>

              {/* Batch Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {stageBatches.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs">
                    <p>Kosong</p>
                  </div>
                ) : (
                  stageBatches.map((batch) => {
                    const nextLabel = getNextStageLabel(batch.stage);
                    const isProcessing = advancingId === batch.id;

                    return (
                      <div
                        key={batch.id}
                        className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-extrabold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                              {batch.batchCode}
                            </span>
                            <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {batch.recipe.bakeMinutes}m
                            </span>
                          </div>
                          <h4 className="font-extrabold text-stone-900 text-sm leading-snug">
                            {batch.recipe.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-black text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg">
                              {batch.targetQty} {batch.recipe.yieldUnit}
                            </span>
                            {batch.notes && (
                              <span className="text-[11px] text-stone-500 truncate max-w-[140px]">
                                {batch.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 1-Tap Advance Button */}
                        {nextLabel && (
                          <button
                            onClick={() => handleAdvance(batch.id)}
                            disabled={isProcessing}
                            className="w-full mt-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <span>Mengupdate...</span>
                            ) : (
                              <>
                                <span>{nextLabel}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Batches (Today's Output) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">Produksi Selesai (Siap Display)</h3>
              <p className="text-xs text-stone-500">Hasil batch yang telah rampung dan siap jual hari ini</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {completedBatches.length} Batch Selesai
          </span>
        </div>

        {completedBatches.length === 0 ? (
          <p className="text-xs text-stone-400 py-3 text-center">Belum ada batch selesai hari ini.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {completedBatches.map((cb) => (
              <div
                key={cb.id}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase">{cb.batchCode}</span>
                  <p className="text-xs font-bold text-stone-900">{cb.recipe.name}</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                  {cb.targetQty} {cb.recipe.yieldUnit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
