"use client";

import { useState } from "react";
import { InventoryItemWithBatches } from "@/lib/types";
import { formatQuantity, addDaysToDate } from "@/lib/inventory-helpers";
import { X, PackagePlus, Calendar, Check, Layers } from "lucide-react";

interface QuickAddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItemWithBatches[];
  initialIngredientId?: string;
  onSubmit: (ingredientId: string, addedQty: number, daysValid: number) => Promise<void>;
}

export function QuickAddStockModal({
  isOpen,
  onClose,
  inventory,
  initialIngredientId,
  onSubmit,
}: QuickAddStockModalProps) {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(
    initialIngredientId || inventory[0]?.id || ""
  );
  const [selectedQty, setSelectedQty] = useState<number>(10000);
  const [daysValid, setDaysValid] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentIngredient =
    inventory.find((i) => i.id === selectedIngredientId) || inventory[0];

  // Presets based on unit
  const qtyPresets =
    currentIngredient.unit === "gr"
      ? [
          { label: "+5 kg", value: 5000 },
          { label: "+10 kg", value: 10000 },
          { label: "+25 kg", value: 25000 },
          { label: "+50 kg", value: 50000 },
        ]
      : currentIngredient.unit === "ml"
      ? [
          { label: "+5 Liter", value: 5000 },
          { label: "+10 Liter", value: 10000 },
          { label: "+15 Liter", value: 15000 },
          { label: "+25 Liter", value: 25000 },
        ]
      : [
          { label: "+30 pcs", value: 30 },
          { label: "+60 pcs", value: 60 },
          { label: "+120 pcs", value: 120 },
          { label: "+240 pcs", value: 240 },
        ];

  const expiryPresets = [
    { label: "+7 Hari (Fresh/Dairy)", days: 7 },
    { label: "+14 Hari (Semi-Fresh)", days: 14 },
    { label: "+30 Hari (Standar)", days: 30 },
    { label: "+60 Hari (Dry Goods)", days: 60 },
    { label: "+90 Hari (Long-life)", days: 90 },
  ];

  const handleSelectIngredient = (id: string) => {
    setSelectedIngredientId(id);
    const ing = inventory.find((i) => i.id === id);
    if (ing) {
      if (ing.unit === "pcs") setSelectedQty(60);
      else setSelectedQty(10000);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(currentIngredient.id, selectedQty, daysValid);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900">Terima Batch Stok Baru</h3>
              <p className="text-xs text-stone-500">Input cepat tanpa ketik - pilih preset tombol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* 1. Pilih Bahan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              1. Pilih Bahan Baku Masuk
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 border border-stone-200/70 rounded-2xl bg-stone-50/40">
              {inventory.map((ing) => {
                const isSelected = ing.id === currentIngredient.id;
                return (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => handleSelectIngredient(ing.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                        : "border-transparent bg-white hover:bg-stone-100 text-stone-700"
                    }`}
                  >
                    <span className="truncate">{ing.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Jumlah Masuk (Presets) */}
          <div className="bg-stone-50/60 p-4 rounded-2xl border border-stone-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                2. Jumlah Masuk
              </label>
              <span className="text-lg font-black text-emerald-700 tabular-nums">
                {formatQuantity(selectedQty, currentIngredient.unit)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {qtyPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSelectedQty(preset.value)}
                  className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedQty === preset.value
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-white border border-stone-200 hover:border-emerald-300 text-stone-700"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Preset Tanggal Kedaluwarsa */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                3. Masa Kedaluwarsa (Expired Date)
              </label>
              <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Target Exp: {addDaysToDate(daysValid)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {expiryPresets.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => setDaysValid(preset.days)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                    daysValid === preset.days
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                      : "bg-white border-stone-200 hover:border-stone-300 text-stone-600"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Ringkasan Batch */}
          <div className="p-3.5 rounded-2xl bg-stone-100/70 border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-4 h-4 text-stone-500" />
              Lot Baru akan dibuat otomatis & masuk prioritas FEFO
            </span>
            <span className="font-bold text-stone-900">
              +{formatQuantity(selectedQty, currentIngredient.unit)}
            </span>
          </div>
        </div>

        {/* Footer */}
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
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-6 py-3 rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Batch Stok Masuk ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
