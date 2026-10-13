import {
  Ingredient,
  IngredientBatch,
  Recipe,
  ProductionBatch,
  DailyUsageLog,
  InventoryItemWithBatches,
  ProductionStage,
} from "./types";
import { getExpiryStatus, addDaysToDate } from "./inventory-helpers";

// In-Memory state store (singleton in node runtime)
class BakeryStore {
  private ingredients: Ingredient[] = [];
  private batches: IngredientBatch[] = [];
  private recipes: Recipe[] = [];
  private productionBatches: ProductionBatch[] = [];
  private dailyLogs: DailyUsageLog[] = [];
  private isInitialized = false;

  constructor() {
    this.seed();
  }

  private seed() {
    if (this.isInitialized) return;

    // 1. Ingredients
    this.ingredients = [
      {
        id: "ing-flour-high",
        name: "Tepung Cakra Kembar (High Protein)",
        category: "flour",
        unit: "gr",
        minStock: 25000,
      },
      {
        id: "ing-butter-unsalted",
        name: "Butter Anchor Unsalted",
        category: "dairy",
        unit: "gr",
        minStock: 10000,
      },
      {
        id: "ing-sugar-fine",
        name: "Gula Pasir Halus Gulaku",
        category: "sweetener",
        unit: "gr",
        minStock: 10000,
      },
      {
        id: "ing-yeast-instant",
        name: "Ragi Instan Saf-Instant Gold",
        category: "yeast",
        unit: "gr",
        minStock: 1500,
      },
      {
        id: "ing-milk-uht",
        name: "Susu Segar Greenfields UHT",
        category: "dairy",
        unit: "ml",
        minStock: 12000,
      },
      {
        id: "ing-eggs-fresh",
        name: "Telur Ayam Omega Grade A",
        category: "other",
        unit: "pcs",
        minStock: 120,
      },
      {
        id: "ing-cheese-cheddar",
        name: "Keju Cheddar Blok Megmilk",
        category: "topping",
        unit: "gr",
        minStock: 5000,
      },
      {
        id: "ing-chocolate-dark",
        name: "Dark Chocolate Couverture 70%",
        category: "topping",
        unit: "gr",
        minStock: 6000,
      },
    ];

    // 2. Batches (FEFO Tracking)
    this.batches = [
      // Yeast: 1 batch near expiry (2 days left - KRITIS), 1 fresh batch
      {
        id: "batch-yst-01",
        ingredientId: "ing-yeast-instant",
        lotNumber: "LOT-YST-26A",
        initialQty: 1000,
        remainingQty: 450,
        receivedDate: addDaysToDate(-25),
        expiryDate: addDaysToDate(2), // Kritis
      },
      {
        id: "batch-yst-02",
        ingredientId: "ing-yeast-instant",
        lotNumber: "LOT-YST-26B",
        initialQty: 2000,
        remainingQty: 2000,
        receivedDate: addDaysToDate(-2),
        expiryDate: addDaysToDate(90),
      },
      // Milk: 1 batch near expiry (4 days left - WARNING)
      {
        id: "batch-mlk-01",
        ingredientId: "ing-milk-uht",
        lotNumber: "LOT-MLK-084",
        initialQty: 10000,
        remainingQty: 3500,
        receivedDate: addDaysToDate(-8),
        expiryDate: addDaysToDate(4), // Warning
      },
      {
        id: "batch-mlk-02",
        ingredientId: "ing-milk-uht",
        lotNumber: "LOT-MLK-092",
        initialQty: 15000,
        remainingQty: 15000,
        receivedDate: addDaysToDate(-1),
        expiryDate: addDaysToDate(21),
      },
      // Eggs: 1 batch expiring in 6 days
      {
        id: "batch-egg-01",
        ingredientId: "ing-eggs-fresh",
        lotNumber: "LOT-EGG-04",
        initialQty: 150,
        remainingQty: 55,
        receivedDate: addDaysToDate(-7),
        expiryDate: addDaysToDate(6), // Warning
      },
      {
        id: "batch-egg-02",
        ingredientId: "ing-eggs-fresh",
        lotNumber: "LOT-EGG-05",
        initialQty: 180,
        remainingQty: 180,
        receivedDate: addDaysToDate(-1),
        expiryDate: addDaysToDate(20),
      },
      // Flour
      {
        id: "batch-flr-01",
        ingredientId: "ing-flour-high",
        lotNumber: "LOT-FLR-991",
        initialQty: 50000,
        remainingQty: 18500,
        receivedDate: addDaysToDate(-20),
        expiryDate: addDaysToDate(30),
      },
      {
        id: "batch-flr-02",
        ingredientId: "ing-flour-high",
        lotNumber: "LOT-FLR-995",
        initialQty: 50000,
        remainingQty: 50000,
        receivedDate: addDaysToDate(-3),
        expiryDate: addDaysToDate(75),
      },
      // Butter
      {
        id: "batch-btr-01",
        ingredientId: "ing-butter-unsalted",
        lotNumber: "LOT-BTR-402",
        initialQty: 15000,
        remainingQty: 7200,
        receivedDate: addDaysToDate(-12),
        expiryDate: addDaysToDate(18),
      },
      // Sugar
      {
        id: "batch-sgr-01",
        ingredientId: "ing-sugar-fine",
        lotNumber: "LOT-SGR-112",
        initialQty: 25000,
        remainingQty: 14000,
        receivedDate: addDaysToDate(-15),
        expiryDate: addDaysToDate(120),
      },
      // Cheese
      {
        id: "batch-chz-01",
        ingredientId: "ing-cheese-cheddar",
        lotNumber: "LOT-CHZ-803",
        initialQty: 8000,
        remainingQty: 4200,
        receivedDate: addDaysToDate(-10),
        expiryDate: addDaysToDate(15),
      },
      // Chocolate
      {
        id: "batch-cho-01",
        ingredientId: "ing-chocolate-dark",
        lotNumber: "LOT-CHO-501",
        initialQty: 10000,
        remainingQty: 7500,
        receivedDate: addDaysToDate(-8),
        expiryDate: addDaysToDate(60),
      },
    ];

    // 3. Recipes
    this.recipes = [
      {
        id: "rec-croissant",
        name: "Butter Croissant Klasik",
        category: "Pastry",
        defaultYield: 24,
        yieldUnit: "pcs",
        bakeMinutes: 18,
        bakeTemp: 200,
        ingredients: [
          { ingredientId: "ing-flour-high", amountPerUnit: 45 },      // 45gr per pc
          { ingredientId: "ing-butter-unsalted", amountPerUnit: 25 },  // 25gr per pc
          { ingredientId: "ing-sugar-fine", amountPerUnit: 6 },        // 6gr per pc
          { ingredientId: "ing-yeast-instant", amountPerUnit: 2 },     // 2gr per pc
          { ingredientId: "ing-milk-uht", amountPerUnit: 20 },         // 20ml per pc
          { ingredientId: "ing-eggs-fresh", amountPerUnit: 0.15 },     // wash & dough
        ],
      },
      {
        id: "rec-roti-sobek",
        name: "Roti Sobek Keju Susu",
        category: "Sweet Bread",
        defaultYield: 8,
        yieldUnit: "loyang",
        bakeMinutes: 24,
        bakeTemp: 180,
        ingredients: [
          { ingredientId: "ing-flour-high", amountPerUnit: 280 },
          { ingredientId: "ing-butter-unsalted", amountPerUnit: 60 },
          { ingredientId: "ing-sugar-fine", amountPerUnit: 50 },
          { ingredientId: "ing-yeast-instant", amountPerUnit: 8 },
          { ingredientId: "ing-milk-uht", amountPerUnit: 140 },
          { ingredientId: "ing-eggs-fresh", amountPerUnit: 2 },
          { ingredientId: "ing-cheese-cheddar", amountPerUnit: 80 },
        ],
      },
      {
        id: "rec-pain-choc",
        name: "Pain au Chocolat 70%",
        category: "Pastry",
        defaultYield: 20,
        yieldUnit: "pcs",
        bakeMinutes: 19,
        bakeTemp: 195,
        ingredients: [
          { ingredientId: "ing-flour-high", amountPerUnit: 50 },
          { ingredientId: "ing-butter-unsalted", amountPerUnit: 28 },
          { ingredientId: "ing-sugar-fine", amountPerUnit: 6 },
          { ingredientId: "ing-yeast-instant", amountPerUnit: 2 },
          { ingredientId: "ing-milk-uht", amountPerUnit: 22 },
          { ingredientId: "ing-chocolate-dark", amountPerUnit: 25 },
        ],
      },
      {
        id: "rec-sourdough",
        name: "Artisan Sourdough Batard",
        category: "Artisan",
        defaultYield: 6,
        yieldUnit: "loaf",
        bakeMinutes: 35,
        bakeTemp: 230,
        ingredients: [
          { ingredientId: "ing-flour-high", amountPerUnit: 450 },
          { ingredientId: "ing-yeast-instant", amountPerUnit: 4 },
        ],
      },
    ];

    // 4. Production Batches in current workflow
    this.productionBatches = [
      {
        id: "pbatch-101",
        batchCode: "BATCH-CRS-01",
        recipeId: "rec-croissant",
        targetQty: 48,
        stage: "baking",
        notes: "Deck Oven #1 - Suhu 200°C",
        createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
      },
      {
        id: "pbatch-102",
        batchCode: "BATCH-SBK-02",
        recipeId: "rec-roti-sobek",
        targetQty: 12,
        stage: "proofing",
        notes: "Proofer Cabinet B - 32°C 80% RH",
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
      {
        id: "pbatch-103",
        batchCode: "BATCH-PAC-03",
        recipeId: "rec-pain-choc",
        targetQty: 30,
        stage: "mixing",
        notes: "Spiral Mixer #2",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: "pbatch-104",
        batchCode: "BATCH-SRD-04",
        recipeId: "rec-sourdough",
        targetQty: 10,
        stage: "planned",
        notes: "Jadwal shift sore",
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ];

    // 5. Daily usage history for burn rate & runway forecast
    const past7Days = [-6, -5, -4, -3, -2, -1, 0];
    this.dailyLogs = [];
    past7Days.forEach((dayOffset) => {
      const logDate = addDaysToDate(dayOffset);
      this.dailyLogs.push(
        { id: `log-flr-${dayOffset}`, ingredientId: "ing-flour-high", qtyUsed: 7200 + Math.floor(Math.random() * 800), usageDate: logDate },
        { id: `log-btr-${dayOffset}`, ingredientId: "ing-butter-unsalted", qtyUsed: 2200 + Math.floor(Math.random() * 300), usageDate: logDate },
        { id: `log-sgr-${dayOffset}`, ingredientId: "ing-sugar-fine", qtyUsed: 900 + Math.floor(Math.random() * 150), usageDate: logDate },
        { id: `log-yst-${dayOffset}`, ingredientId: "ing-yeast-instant", qtyUsed: 220 + Math.floor(Math.random() * 30), usageDate: logDate },
        { id: `log-mlk-${dayOffset}`, ingredientId: "ing-milk-uht", qtyUsed: 2800 + Math.floor(Math.random() * 400), usageDate: logDate },
        { id: `log-egg-${dayOffset}`, ingredientId: "ing-eggs-fresh", qtyUsed: 35 + Math.floor(Math.random() * 10), usageDate: logDate },
        { id: `log-chz-${dayOffset}`, ingredientId: "ing-cheese-cheddar", qtyUsed: 750 + Math.floor(Math.random() * 100), usageDate: logDate },
        { id: `log-cho-${dayOffset}`, ingredientId: "ing-chocolate-dark", qtyUsed: 600 + Math.floor(Math.random() * 100), usageDate: logDate }
      );
    });

    this.isInitialized = true;
  }

  // --- INVENTORY QUERIES & MUTATIONS ---

  public getInventory(): InventoryItemWithBatches[] {
    return this.ingredients.map((ing) => {
      // Find all batches for this ingredient
      const batchesForIng = this.batches
        .filter((b) => b.ingredientId === ing.id && b.remainingQty > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
        .map((b) => ({
          ...b,
          expiryInfo: getExpiryStatus(b.expiryDate),
        }));

      const totalRemaining = batchesForIng.reduce((sum, b) => sum + b.remainingQty, 0);

      // Calculate 7-day daily average burn rate
      const ingLogs = this.dailyLogs.filter((l) => l.ingredientId === ing.id);
      const totalPastUsage = ingLogs.reduce((sum, l) => sum + l.qtyUsed, 0);
      const dailyBurnRate = ingLogs.length > 0 ? Math.round(totalPastUsage / ingLogs.length) : 1;

      // Runway days: how many days until stock hits 0
      const runwayDays = dailyBurnRate > 0 ? Math.round((totalRemaining / dailyBurnRate) * 10) / 10 : 999;

      const nearestExpiry = batchesForIng.length > 0 ? batchesForIng[0].expiryInfo : null;
      const isLowStock = totalRemaining <= ing.minStock;

      return {
        ...ing,
        totalRemaining,
        batches: batchesForIng,
        nearestExpiry,
        dailyBurnRate,
        runwayDays,
        isLowStock,
      };
    });
  }

  public addStockBatch(params: {
    ingredientId: string;
    addedQty: number;
    daysValid: number;
  }): { success: boolean; batch: IngredientBatch } {
    const { ingredientId, addedQty, daysValid } = params;
    const ing = this.ingredients.find((i) => i.id === ingredientId);
    if (!ing) throw new Error("Bahan baku tidak ditemukan");

    const code = ing.name.slice(0, 3).toUpperCase();
    const randLot = Math.floor(100 + Math.random() * 900);
    const newBatch: IngredientBatch = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ingredientId,
      lotNumber: `LOT-${code}-${randLot}`,
      initialQty: addedQty,
      remainingQty: addedQty,
      receivedDate: addDaysToDate(0),
      expiryDate: addDaysToDate(daysValid),
    };

    this.batches.push(newBatch);
    return { success: true, batch: newBatch };
  }

  // FIFO / FEFO Deduct when starting batch
  public deductIngredientsFEFO(recipeId: string, batchQty: number): {
    success: boolean;
    deductions: { ingredientName: string; lotNumber: string; deductedQty: number; unit: string }[];
    shortages?: { ingredientName: string; missingQty: number; unit: string }[];
  } {
    const recipe = this.recipes.find((r) => r.id === recipeId);
    if (!recipe) throw new Error("Resep tidak ditemukan");

    // 1. Check availability for all ingredients
    const shortages: { ingredientName: string; missingQty: number; unit: string }[] = [];
    const requirements = recipe.ingredients.map((ri) => {
      const ing = this.ingredients.find((i) => i.id === ri.ingredientId)!;
      const totalNeeded = Math.ceil(ri.amountPerUnit * batchQty);
      const activeBatches = this.batches.filter((b) => b.ingredientId === ri.ingredientId && b.remainingQty > 0);
      const currentStock = activeBatches.reduce((s, b) => s + b.remainingQty, 0);

      if (currentStock < totalNeeded) {
        shortages.push({
          ingredientName: ing.name,
          missingQty: totalNeeded - currentStock,
          unit: ing.unit,
        });
      }

      return {
        ingredientId: ri.ingredientId,
        ingredientName: ing.name,
        unit: ing.unit,
        totalNeeded,
      };
    });

    if (shortages.length > 0) {
      return { success: false, deductions: [], shortages };
    }

    // 2. Perform FEFO deduction
    const deductions: { ingredientName: string; lotNumber: string; deductedQty: number; unit: string }[] = [];

    requirements.forEach((req) => {
      let needed = req.totalNeeded;

      // Sort batches by earliest expiry date first
      const ingBatches = this.batches
        .filter((b) => b.ingredientId === req.ingredientId && b.remainingQty > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      for (const batch of ingBatches) {
        if (needed <= 0) break;

        const deductAmount = Math.min(batch.remainingQty, needed);
        batch.remainingQty -= deductAmount;
        needed -= deductAmount;

        deductions.push({
          ingredientName: req.ingredientName,
          lotNumber: batch.lotNumber,
          deductedQty: deductAmount,
          unit: req.unit,
        });
      }

      // Log to daily usage
      this.dailyLogs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ingredientId: req.ingredientId,
        qtyUsed: req.totalNeeded,
        usageDate: addDaysToDate(0),
      });
    });

    return { success: true, deductions };
  }

  // --- RECIPE & BATCH PRODUCTION ---

  public getRecipes(): Recipe[] {
    return this.recipes;
  }

  public getProductionBatches(): (ProductionBatch & { recipe: Recipe })[] {
    return this.productionBatches.map((pb) => ({
      ...pb,
      recipe: this.recipes.find((r) => r.id === pb.recipeId)!,
    }));
  }

  public createProductionBatch(recipeId: string, targetQty: number, notes?: string): ProductionBatch {
    const recipe = this.recipes.find((r) => r.id === recipeId);
    if (!recipe) throw new Error("Resep tidak ditemukan");

    // Deduct stock FIFO right away
    const deductResult = this.deductIngredientsFEFO(recipeId, targetQty);
    if (!deductResult.success) {
      const shortList = deductResult.shortages?.map((s) => `${s.ingredientName}: kurang ${s.missingQty} ${s.unit}`).join(", ");
      throw new Error(`Stok bahan baku tidak mencukupi! (${shortList})`);
    }

    const nextNumber = this.productionBatches.length + 101;
    const codePrefix = recipe.name.substring(0, 3).toUpperCase();
    const newBatch: ProductionBatch = {
      id: `pbatch-${Date.now()}`,
      batchCode: `BATCH-${codePrefix}-${nextNumber}`,
      recipeId,
      targetQty,
      stage: "mixing",
      notes: notes || "Batch dibuat langsung dari touch panel",
      createdAt: new Date().toISOString(),
    };

    this.productionBatches.unshift(newBatch);
    return newBatch;
  }

  public advanceBatchStage(batchId: string): ProductionBatch {
    const batch = this.productionBatches.find((b) => b.id === batchId);
    if (!batch) throw new Error("Batch produksi tidak ditemukan");

    const stages: ProductionStage[] = ["planned", "mixing", "proofing", "baking", "completed"];
    const currentIndex = stages.indexOf(batch.stage);

    if (currentIndex < stages.length - 1) {
      batch.stage = stages[currentIndex + 1];
      if (batch.stage === "completed") {
        batch.completedAt = new Date().toISOString();
      }
    }

    return batch;
  }

  public getForecastSummary() {
    const inventory = this.getInventory();
    
    // Items with runway < 4 days or low stock
    const criticalItems = inventory.filter((item) => item.runwayDays <= 4 || item.isLowStock);
    const expiringSoonBatches = inventory.flatMap((i) => 
      i.batches
        .filter((b) => b.expiryInfo.status === "critical" || b.expiryInfo.status === "warning" || b.expiryInfo.status === "expired")
        .map((b) => ({
          ...b,
          ingredientName: i.name,
          unit: i.unit,
        }))
    );

    return {
      inventory,
      criticalItems,
      expiringSoonBatches,
      activeBatchesCount: this.productionBatches.filter((b) => b.stage !== "completed").length,
    };
  }
}

// Global singleton
const globalForBakery = globalThis as unknown as { bakeryStore?: BakeryStore };
export const bakeryStore = globalForBakery.bakeryStore ?? new BakeryStore();
if (process.env.NODE_ENV !== "production") globalForBakery.bakeryStore = bakeryStore;
