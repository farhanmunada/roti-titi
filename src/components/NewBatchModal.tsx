"use client";

import { useState } from "react";
import { Recipe, InventoryItemWithBatches } from "@/lib/types";
import { formatQuantity } from "@/lib/inventory-helpers";
import { X, Plus, Minus, CheckCircle, AlertTriangle, Flame, ChefHat, Timer } from "lucide-react";

interface NewBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  inventory: InventoryItemWithBatches[];
  onSubmit: (recipeId: string, targetQty: number) => Promise<void>;
}

export function NewBatchModal({
  isOpen,
  onClose,
  recipes,
  inventory,
  onSubmit,
}: NewBatchModalProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || "");
  const [qty, setQty] = useState<number>(recipes[0]?.defaultYield || 12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  // Calculate required ingredients
  const requirements = currentRecipe?.ingredients.map((ri) => {
    const inv = inventory.find((i) => i.id === ri.ingredientId);
    const needed = Math.ceil(ri.amountPerUnit * qty);
    const available = inv?.totalRemaining || 0;
    const isSufficient = available >= needed;
    return {
      name: inv?.name || ri.ingredientId,
      unit: inv?.unit || "gr",
      needed,
      available,
      isSufficient,
    };
  }) || [];

  const allIngredientsAvailable = requirements.every((r) => r.isSufficient);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipeId(recipe.id);
    setQty(recipe.defaultYield);
  };

  const handleAddQty = (amount: number) => {
    setQty((prev) => Math.max(1, prev + amount));
  };

  const handleSubmit = async () => {
    if (!allIngredientsAvailable || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(currentRecipe.id, qty);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900">Mulai Batch Produksi Baru</h3>
              <p className="text-xs text-stone-500">Pilih resep dan atur jumlah tanpa ketik keyboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Pilih Resep (Cards) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
              1. Pilih Produk Roti
            </label>
            <div className="grid grid-cols-2 gap-3">
              {recipes.map((recipe) => {
                const isSelected = recipe.id === currentRecipe?.id;
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => handleSelectRecipe(recipe)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/40 shadow-sm shadow-amber-500/10"
                        : "border-stone-200/80 bg-white hover:border-stone-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                          {recipe.category}
                        </span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-amber-600" />}
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm mt-1">{recipe.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-3 pt-2 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-stone-400" />
                        {recipe.bakeMinutes}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-stone-400" />
                        {recipe.bakeTemp}°C
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Target Jumlah (Stepper Touch Target) */}
          <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                  2. Atur Target Jumlah
                </label>
                <p className="text-xs text-stone-500">Satuan: {currentRecipe?.yieldUnit}</p>
              </div>

              {/* Main Stepper */}
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-2xl border border-stone-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleAddQty(-1)}
                  disabled={qty <= 1}
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-black text-stone-900 w-16 text-center tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => handleAddQty(1)}
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Touch Stepper Chips */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-stone-500 font-medium">Quick Preset:</span>
              {[+6, +12, +24, +48].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddQty(preset)}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-stone-700 transition-all cursor-pointer"
                >
                  +{preset} {currentRecipe?.yieldUnit}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Verifikasi Kebutuhan Bahan (FEFO Readiness) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                3. Alokasi Bahan Baku (Otomatis FEFO)
              </label>
              {allIngredientsAvailable ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Stok Cukup
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Ada Bahan Kurang
                </span>
              )}
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border ${
                    req.isSufficient
                      ? "bg-white border-stone-200/80 text-stone-700"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <span className="font-semibold">{req.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500">
                      Butuh: <strong className="text-stone-900">{formatQuantity(req.needed, req.unit)}</strong>
                    </span>
                    <span className={req.isSufficient ? "text-emerald-700" : "text-rose-600 font-bold"}>
                      (Sisa: {formatQuantity(req.available, req.unit)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl text-sm font-semibold text-stone-600 hover:bg-stone-200/70 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!allIngredientsAvailable || isSubmitting}
            onClick={handleSubmit}
            className="px-6 py-3 rounded-2xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? "Memproses..." : "Luncurkan Batch (Potong Stok FEFO) →"}
          </button>
        </div>
      </div>
    </div>
  );
}
