export type StockItem = {
  id: number; name: string; zone: string; unit: 'kg' | 'l' | 'szt'; unitPrice: number;
  opening: number; delivered: number; used: number; waste: number; counted: number; minimum: number;
  reason: string; expires: string; recipe: string;
};
export const stockItems: StockItem[] = [
  { id: 1, name: "Tomatoes", zone: "Produce storage", unit: 'kg', unitPrice: 12, opening: 12, delivered: 8, used: 14, waste: 1, counted: 4.5, minimum: 5, reason: "Damaged during storage", expires: '15.09.2026', recipe: "Sandwiches and salads" },
  { id: 2, name: "Beef tenderloin", zone: "Cold room", unit: 'kg', unitPrice: 140, opening: 5, delivered: 3, used: 5.5, waste: 0.2, counted: 2, minimum: 2.5, reason: "Past expiry date", expires: '14.09.2026', recipe: "Beef tartare" },
  { id: 3, name: 'Mozzarella', zone: "Cold room", unit: 'kg', unitPrice: 40, opening: 4, delivered: 4, used: 5, waste: 0.25, counted: 2.75, minimum: 2, reason: "Opened product not used in time", expires: '16.09.2026', recipe: 'Arancini' },
  { id: 4, name: "Arborio rice", zone: "Dry storage", unit: 'kg', unitPrice: 15, opening: 10, delivered: 5, used: 8, waste: 0, counted: 7.5, minimum: 3, reason: "No recorded waste", expires: '20.06.2027', recipe: 'Arancini' },
  { id: 5, name: "Olive oil", zone: "Dry storage", unit: 'l', unitPrice: 36, opening: 5, delivered: 2, used: 3.8, waste: 0.2, counted: 3, minimum: 2, reason: "Spilled during preparation", expires: '12.04.2027', recipe: "Main courses and sauces" },
  { id: 6, name: "Shrimp", zone: "Freezer", unit: 'kg', unitPrice: 112.5, opening: 4, delivered: 2, used: 3, waste: 0.4, counted: 2.4, minimum: 2, reason: "Unused thawed batch", expires: '30.11.2026', recipe: "Shrimp with wasabi mayo" },
  { id: 7, name: "Eggs", zone: "Cold room", unit: 'szt', unitPrice: 1.2, opening: 120, delivered: 60, used: 110, waste: 6, counted: 62, minimum: 30, reason: "Broken shells", expires: '21.09.2026', recipe: "Arancini and tartare" },
  { id: 8, name: "Lemon juice", zone: 'Bar', unit: 'l', unitPrice: 30, opening: 2, delivered: 1, used: 1.6, waste: 0.1, counted: 1.3, minimum: 1, reason: "Unused fresh juice", expires: '14.09.2026', recipe: 'Basil Smash' },
];
const round = (value: number) => Math.round(value * 100) / 100;
export function stockBalance(item: StockItem, counted: number) {
  const expected = round(item.opening + item.delivered - item.used - item.waste);
  const difference = round(counted - expected);
  const shortage = Math.max(0, -difference);
  const surplus = Math.max(0, difference);
  const recordedWasteCost = round(item.waste * item.unitPrice);
  const shortageCost = round(shortage * item.unitPrice);
  return { expected, difference, shortage, surplus, recordedWasteCost, shortageCost, surplusValue: round(surplus * item.unitPrice), totalLoss: round(recordedWasteCost + shortageCost), stockValue: round(counted * item.unitPrice) };
}
