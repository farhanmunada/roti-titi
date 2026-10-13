export type UnitType = "gr" | "ml" | "pcs";

export type IngredientCategory = "flour" | "dairy" | "sweetener" | "yeast" | "topping" | "other";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  unit: UnitType;
  minStock: number;
}

export interface IngredientBatch {
  id: string;
  ingredientId: string;
  lotNumber: string;
  initialQty: number;
  remainingQty: number;
  receivedDate: string; // YYYY-MM-DD
  expiryDate: string;   // YYYY-MM-DD
}

export interface RecipeIngredient {
  ingredientId: string;
  amountPerUnit: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  defaultYield: number;
  yieldUnit: string;
  bakeMinutes: number;
  bakeTemp: number;
  ingredients: RecipeIngredient[];
}

export type ProductionStage = "planned" | "mixing" | "proofing" | "baking" | "completed";

export interface ProductionBatch {
  id: string;
  batchCode: string;
  recipeId: string;
  targetQty: number;
  stage: ProductionStage;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DailyUsageLog {
  id: string;
  ingredientId: string;
  qtyUsed: number;
  usageDate: string; // YYYY-MM-DD
}

export interface ExpiryStatus {
  status: "expired" | "critical" | "warning" | "good";
  daysLeft: number;
  badgeColor: string;
  textColor: string;
  label: string;
}

export interface InventoryItemWithBatches extends Ingredient {
  totalRemaining: number;
  batches: (IngredientBatch & { expiryInfo: ExpiryStatus })[];
  nearestExpiry: ExpiryStatus | null;
  dailyBurnRate: number; // avg daily consumption
  runwayDays: number;     // days remaining before stockouts
  isLowStock: boolean;
}
