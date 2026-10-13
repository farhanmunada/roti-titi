import { pgTable, text, integer, timestamp, date, varchar } from "drizzle-orm/pg-core";

export const ingredients = pgTable("ingredients", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  unit: varchar("unit", { length: 16 }).notNull(), // "gr", "ml", "pcs"
  minStock: integer("min_stock").notNull().default(1000),
});

export const ingredientBatches = pgTable("ingredient_batches", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ingredientId: varchar("ingredient_id", { length: 64 }).notNull(),
  lotNumber: varchar("lot_number", { length: 64 }).notNull(),
  initialQty: integer("initial_qty").notNull(),
  remainingQty: integer("remaining_qty").notNull(),
  receivedDate: date("received_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
});

export const recipes = pgTable("recipes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  defaultYield: integer("default_yield").notNull().default(12),
  yieldUnit: varchar("yield_unit", { length: 16 }).notNull().default("pcs"),
  bakeMinutes: integer("bake_minutes").notNull().default(25),
  bakeTemp: integer("bake_temp").notNull().default(190),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: varchar("id", { length: 64 }).primaryKey(),
  recipeId: varchar("recipe_id", { length: 64 }).notNull(),
  ingredientId: varchar("ingredient_id", { length: 64 }).notNull(),
  amountPerUnit: integer("amount_per_unit").notNull(), // amount per 1 yield unit
});

export const productionBatches = pgTable("production_batches", {
  id: varchar("id", { length: 64 }).primaryKey(),
  batchCode: varchar("batch_code", { length: 64 }).notNull(),
  recipeId: varchar("recipe_id", { length: 64 }).notNull(),
  targetQty: integer("target_qty").notNull(),
  stage: varchar("stage", { length: 32 }).notNull(), // planned, mixing, proofing, baking, completed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const dailyUsageLogs = pgTable("daily_usage_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ingredientId: varchar("ingredient_id", { length: 64 }).notNull(),
  qtyUsed: integer("qty_used").notNull(),
  usageDate: date("usage_date").notNull(),
});
