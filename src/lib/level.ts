// 1 level HSK naik setiap 100 XP, maksimal HSK 6
export function calculateHskLevel(xp: number): number {
  const level = 1 + Math.floor(xp / 100);
  return Math.min(level, 6);
}
