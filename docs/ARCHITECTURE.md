# Architecture Design: Bakery Production System

## 1. Arsitektur Komponen & Data Flow

```
[UI Dashboard / Touch Panels]
       │
       ▼
[Server Actions / API Handlers]
       │
       ├── FIFO / FEFO Deduction Engine
       ├── Batch Production State Machine
       └── Demand & Runway Calculator
       │
       ▼
[Repository Layer / Storage Adapter]
       ├── Neon Postgres (via Drizzle ORM saat DATABASE_URL aktif)
       └── InMemory / Local Stateful Store (fallback seamless saat offline/demo)
```

## 2. Skema Database Drizzle (PostgreSQL / Neon)

1. **`ingredients`**:
   - `id`: varchar (UUID / slug)
   - `name`: varchar (contoh: "Tepung Terigu Protein Tinggi", "Mentega Unsalted")
   - `category`: varchar ("flour", "dairy", "sweetener", "yeast", "topping")
   - `unit`: varchar ("gr", "ml", "pcs")
   - `min_stock`: integer
   - `cost_per_unit`: integer

2. **`ingredient_batches`**:
   - `id`: varchar
   - `ingredient_id`: varchar
   - `lot_number`: varchar (auto-generated, misal: LOT-FLOUR-20261013)
   - `initial_qty`: integer
   - `remaining_qty`: integer
   - `expiry_date`: date
   - `received_date`: date

3. **`recipes` & `recipe_ingredients`**:
   - `recipe`: id, name, yield_unit, yield_default, bake_temp, bake_time_mins
   - `recipe_ingredients`: recipe_id, ingredient_id, amount_per_unit

4. **`production_batches`**:
   - `id`: varchar
   - `batch_code`: varchar (misal: BATCH-CRS-001)
   - `recipe_id`: varchar
   - `target_qty`: integer
   - `stage`: "planned" | "mixing" | "proofing" | "baking" | "completed" | "cancelled"
   - `started_at`: timestamp
   - `completed_at`: timestamp

5. **`daily_usage_logs`**:
   - `id`: varchar
   - `ingredient_id`: varchar
   - `qty_used`: integer
   - `date`: date
