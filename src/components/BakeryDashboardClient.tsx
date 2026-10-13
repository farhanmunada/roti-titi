"use client";

import { useState, useTransition } from "react";
import {
  InventoryItemWithBatches,
  Recipe,
  ProductionBatch,
} from "@/lib/types";
import {
  getDashboardDataAction,
  createProductionBatchAction,
  advanceBatchStageAction,
  addStockBatchAction,
} from "@/app/actions";
import { Navbar } from "@/components/Navbar";
import { ProductionSection } from "@/components/ProductionSection";
import { InventorySection } from "@/components/InventorySection";
import { ForecastSection } from "@/components/ForecastSection";
import { NewBatchModal } from "@/components/NewBatchModal";
import { QuickAddStockModal } from "@/components/QuickAddStockModal";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

interface BakeryDashboardClientProps {
  initialInventory: InventoryItemWithBatches[];
  initialRecipes: Recipe[];
  initialProductionBatches: (ProductionBatch & { recipe: Recipe })[];
}

export function BakeryDashboardClient({
  initialInventory,
  initialRecipes,
  initialProductionBatches,
}: BakeryDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"production" | "inventory" | "forecast">("production");
  const [inventory, setInventory] = useState<InventoryItemWithBatches[]>(initialInventory);
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [productionBatches, setProductionBatches] = useState<(ProductionBatch & { recipe: Recipe })[]>(
    initialProductionBatches
  );

  // Modals
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedStockIngredientId, setSelectedStockIngredientId] = useState<string | undefined>();

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [, startTransition] = useTransition();

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const refreshData = async () => {
    try {
      const data = await getDashboardDataAction();
      setInventory(data.inventory);
      setRecipes(data.recipes);
      setProductionBatches(data.productionBatches);
    } catch {
      showToast("Gagal memperbarui data dapur", "error");
    }
  };

  // Handlers
  const handleAdvanceStage = async (batchId: string) => {
    const res = await advanceBatchStageAction(batchId);
    if (res.success) {
      showToast("Tahapan batch berhasil dimajukan ✓");
      startTransition(() => {
        refreshData();
      });
    } else {
      showToast(res.error || "Gagal memperbarui tahapan", "error");
    }
  };

  const handleCreateBatch = async (recipeId: string, targetQty: number) => {
    const res = await createProductionBatchAction(recipeId, targetQty);
    if (res.success) {
      showToast(`Batch ${res.created?.batchCode} diluncurkan! Stok FEFO dipotong ✓`);
      startTransition(() => {
        refreshData();
      });
    } else {
      showToast(res.error || "Gagal membuat batch", "error");
    }
  };

  const handleAddStock = async (ingredientId: string, addedQty: number, daysValid: number) => {
    const res = await addStockBatchAction(ingredientId, addedQty, daysValid);
    if (res.success) {
      showToast(`Batch stok ${res.batch?.lotNumber} berhasil dicatat ✓`);
      startTransition(() => {
        refreshData();
      });
    } else {
      showToast(res.error || "Gagal mencatat stok", "error");
    }
  };

  const handleOpenAddStock = (ingredientId?: string) => {
    setSelectedStockIngredientId(ingredientId);
    setIsAddStockOpen(true);
  };

  // Critical alerts count
  const criticalCount = inventory.reduce(
    (acc, item) =>
      acc +
      item.batches.filter(
        (b) => b.expiryInfo.status === "critical" || b.expiryInfo.status === "expired"
      ).length,
    0
  );

  const activeBatchCount = productionBatches.filter((b) => b.stage !== "completed").length;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalCount={criticalCount}
        activeBatchCount={activeBatchCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full">
        {activeTab === "production" && (
          <ProductionSection
            batches={productionBatches}
            onAdvanceStage={handleAdvanceStage}
            onOpenNewBatchModal={() => setIsNewBatchOpen(true)}
          />
        )}

        {activeTab === "inventory" && (
          <InventorySection
            inventory={inventory}
            onOpenAddStockModal={handleOpenAddStock}
          />
        )}

        {activeTab === "forecast" && (
          <ForecastSection
            inventory={inventory}
            onQuickRestock={handleAddStock}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-xs font-extrabold border ${
              toastMessage.type === "success"
                ? "bg-stone-900 text-white border-stone-800"
                : "bg-rose-600 text-white border-rose-500"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-white" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 hover:opacity-70 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewBatchModal
        isOpen={isNewBatchOpen}
        onClose={() => setIsNewBatchOpen(false)}
        recipes={recipes}
        inventory={inventory}
        onSubmit={handleCreateBatch}
      />

      <QuickAddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        inventory={inventory}
        initialIngredientId={selectedStockIngredientId}
        onSubmit={handleAddStock}
      />
    </div>
  );
}
