import type { PlateConfig } from '@/types/workout'
import type { EquipmentCategory, LockerItem } from '@/types/locker'

const DEFAULT_BAR_KG = 20

/** Collect available plate weights from locker inventory. */
export function getAvailablePlates(items: LockerItem[]): number[] {
  return items
    .filter((i) => i.category === 'weight_plate' && i.weightKg != null)
    .map((i) => i.weightKg!)
}

/** Get bar weight from locker or fall back to Olympic standard. */
export function getBarWeight(items: LockerItem[]): number {
  const bar = items.find((i) => i.category === 'barbell' && i.weightKg != null)
  return bar?.weightKg ?? DEFAULT_BAR_KG
}

/**
 * Greedy plate loading per side.
 * Returns the closest achievable total ≤ target using available plates.
 */
export function configurePlates(
  targetKg: number,
  items: LockerItem[],
  equipment: EquipmentCategory[],
): PlateConfig {
  if (targetKg <= 0 || equipment.length === 0) {
    return {
      mode: 'bodyweight',
      targetKg,
      barWeightKg: 0,
      platesPerSide: [],
      totalKg: 0,
      achievable: true,
    }
  }

  const primary = equipment[0]

  if (primary === 'dumbbell') {
    return {
      mode: 'dumbbell',
      targetKg,
      barWeightKg: 0,
      platesPerSide: [],
      totalKg: targetKg,
      achievable: true,
      note: 'Per dumbbell',
    }
  }

  if (primary === 'kettlebell') {
    return {
      mode: 'kettlebell',
      targetKg,
      barWeightKg: 0,
      platesPerSide: [],
      totalKg: targetKg,
      achievable: true,
    }
  }

  if (primary !== 'barbell' && primary !== 'weight_plate') {
    return {
      mode: 'bodyweight',
      targetKg,
      barWeightKg: 0,
      platesPerSide: [],
      totalKg: targetKg,
      achievable: true,
      note: 'Geen barbell-configuratie nodig',
    }
  }

  const barWeight = getBarWeight(items)
  const plates = getAvailablePlates(items)

  if (plates.length === 0) {
    return {
      mode: 'barbell',
      targetKg,
      barWeightKg: barWeight,
      platesPerSide: [],
      totalKg: barWeight,
      achievable: targetKg <= barWeight,
      note: plates.length === 0 ? 'Geen schijven in locker' : undefined,
    }
  }

  const perSideTarget = Math.max(0, (targetKg - barWeight) / 2)
  const sorted = [...new Set(plates)].sort((a, b) => b - a)
  const perSide = greedyPlates(perSideTarget, sorted)
  const totalKg = barWeight + perSide.reduce((s, p) => s + p, 0) * 2
  const achievable = Math.abs(totalKg - targetKg) < 0.01 || totalKg <= targetKg

  return {
    mode: 'barbell',
    targetKg,
    barWeightKg: barWeight,
    platesPerSide: perSide,
    totalKg,
    achievable,
    note: totalKg < targetKg ? `Max ${totalKg} kg met huidige schijven` : undefined,
  }
}

function greedyPlates(target: number, plates: number[]): number[] {
  const result: number[] = []
  let remaining = target

  for (const plate of plates) {
    while (remaining >= plate - 0.001) {
      result.push(plate)
      remaining = Math.round((remaining - plate) * 100) / 100
    }
  }

  return result
}
