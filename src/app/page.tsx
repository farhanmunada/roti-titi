import { Suspense } from "react";
import { connection } from "next/server";
import { getDashboardDataAction } from "./actions";
import { BakeryDashboardClient } from "@/components/BakeryDashboardClient";

async function DashboardContent() {
  await connection();
  const data = await getDashboardDataAction();

  return (
    <BakeryDashboardClient
      initialInventory={data.inventory}
      initialRecipes={data.recipes}
      initialProductionBatches={data.productionBatches}
    />
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Menyiapkan Dapur Roti Titi...
            </p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
