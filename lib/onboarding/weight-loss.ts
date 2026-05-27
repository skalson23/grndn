export const WEIGHT_LOSS_PACE_IDS = [
  'aggressive',
  'moderate',
  'sustainable',
] as const

export type WeightLossPaceId = (typeof WEIGHT_LOSS_PACE_IDS)[number]

export const WEIGHT_LOSS_PACE_LABELS: Record<WeightLossPaceId, string> = {
  aggressive: 'Aggressive',
  moderate: 'Moderate',
  sustainable: 'Sustainable',
}

export const WEIGHT_LOSS_PACE_OPTIONS: {
  id: WeightLossPaceId
  title: string
  description: string
}[] = [
  {
    id: 'aggressive',
    title: 'Aggressive',
    description: 'Faster fat loss with higher recovery demands.',
  },
  {
    id: 'moderate',
    title: 'Moderate',
    description: 'Balanced fat loss and performance.',
  },
  {
    id: 'sustainable',
    title: 'Sustainable',
    description: 'Slower long-term focused approach.',
  },
]
