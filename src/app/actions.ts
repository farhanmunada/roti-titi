"use server";

import { revalidatePath } from "next/cache";
import { bakeryStore } from "@/lib/store";

export async function getDashboardDataAction() {
  const inventory = bakeryStore.getInventory();
  const recipes = bakeryStore.getRecipes();
  const productionBatches = bakeryStore.getProductionBatches();
  const forecast = bakeryStore.getForecastSummary();

  return {
    inventory,
    recipes,
    productionBatches,
    forecast,
  };
}

export async function advanceBatchStageAction(batchId: string) {
  try {
    const updated = bakeryStore.advanceBatchStage(batchId);
    revalidatePath("/");
    return { success: true, updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memajukan tahapan batch";
    return { success: false, error: message };
  }
}

export async function createProductionBatchAction(recipeId: string, targetQty: number) {
  try {
    const created = bakeryStore.createProductionBatch(recipeId, targetQty);
    revalidatePath("/");
    return { success: true, created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat batch produksi";
    return { success: false, error: message };
  }
}

export async function addStockBatchAction(ingredientId: string, addedQty: number, daysValid: number) {
  try {
    const result = bakeryStore.addStockBatch({ ingredientId, addedQty, daysValid });
    revalidatePath("/");
    return { success: true, batch: result.batch };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menambah stok";
    return { success: false, error: message };
  }
}
