import assert from "node:assert/strict";

// Helper mocks for logic testing
function getExpiryStatus(expiryDateStr, baseDateStr) {
  const today = new Date(baseDateStr);
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expiryDateStr);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: "expired", daysLeft: diffDays };
  if (diffDays <= 3) return { status: "critical", daysLeft: diffDays };
  if (diffDays <= 7) return { status: "warning", daysLeft: diffDays };
  return { status: "good", daysLeft: diffDays };
}

function deductFEFO(batches, neededQty) {
  // Sort earliest expiry first
  const sorted = [...batches].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  let remainingNeeded = neededQty;
  const deductions = [];

  for (const b of sorted) {
    if (remainingNeeded <= 0) break;
    const deduct = Math.min(b.remainingQty, remainingNeeded);
    b.remainingQty -= deduct;
    remainingNeeded -= deduct;
    deductions.push({ lot: b.lotNumber, deduct });
  }

  assert.equal(remainingNeeded, 0, "All needed quantity must be deducted");
  return { batches: sorted, deductions };
}

// 1. Test Expiry Classifications
console.log("1. Testing Expiry Classifications...");
const baseDate = "2026-10-13";
assert.equal(getExpiryStatus("2026-10-10", baseDate).status, "expired");
assert.equal(getExpiryStatus("2026-10-15", baseDate).status, "critical"); // 2 days
assert.equal(getExpiryStatus("2026-10-18", baseDate).status, "warning");  // 5 days
assert.equal(getExpiryStatus("2026-10-30", baseDate).status, "good");     // 17 days
console.log("   ✓ Expiry status logic passed");

// 2. Test FEFO Deduction Order
console.log("2. Testing FEFO Deduction...");
const mockBatches = [
  { lotNumber: "LOT-LATE", expiryDate: "2026-12-01", remainingQty: 100 },
  { lotNumber: "LOT-EARLY", expiryDate: "2026-10-15", remainingQty: 30 },
  { lotNumber: "LOT-MID", expiryDate: "2026-10-25", remainingQty: 50 },
];

// Need 50 units: should take 30 from LOT-EARLY first, then 20 from LOT-MID
const result = deductFEFO(mockBatches, 50);
assert.equal(result.deductions[0].lot, "LOT-EARLY");
assert.equal(result.deductions[0].deduct, 30);
assert.equal(result.deductions[1].lot, "LOT-MID");
assert.equal(result.deductions[1].deduct, 20);

const earlyBatch = mockBatches.find((b) => b.lotNumber === "LOT-EARLY");
const midBatch = mockBatches.find((b) => b.lotNumber === "LOT-MID");
const lateBatch = mockBatches.find((b) => b.lotNumber === "LOT-LATE");

assert.equal(earlyBatch.remainingQty, 0, "Early batch should be depleted");
assert.equal(midBatch.remainingQty, 30, "Mid batch should have 30 left");
assert.equal(lateBatch.remainingQty, 100, "Late batch should remain untouched");
console.log("   ✓ FEFO deduction order passed");

console.log("\nALL VERIFICATION TESTS PASSED.");
