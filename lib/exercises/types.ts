export const MOVEMENT_CATEGORIES = [
  'horizontal_press',
  'incline_press',
  'vertical_press',
  'horizontal_pull',
  'vertical_pull',
  'squat',
  'hinge',
  'unilateral_lower',
  'chest_isolation',
  'shoulder_isolation',
  'biceps_isolation',
  'triceps_isolation',
  'calves',
  'abs_core',
] as const

export type MovementCategory = (typeof MOVEMENT_CATEGORIES)[number]

export const MUSCLE_GROUPS = [
  'chest',
  'upper_chest',
  'front_delts',
  'lateral_delts',
  'rear_delts',
  'triceps',
  'biceps',
  'forearms',
  'lats',
  'upper_back',
  'traps',
  'quads',
  'hamstrings',
  'glutes',
  'adductors',
  'calves',
  'abs',
  'deep_core',
  'lower_back',
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

export type FatigueRating = 'low' | 'moderate' | 'high'
export type SystemicFatigue = 'low' | 'moderate' | 'high'
export type StabilityRequirement = 'low' | 'moderate' | 'high'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type FatigueClass =
  | 'low_fatigue'
  | 'moderate_fatigue'
  | 'high_pressing'
  | 'high_pulling'
  | 'high_lower'
  | 'high_hinge'

export type CompoundType =
  | 'compound_press'
  | 'compound_pull'
  | 'compound_lower'
  | 'isolation'
  | 'core'

export type OverlapTag =
  | 'chest_pressing'
  | 'front_delt'
  | 'triceps_pressing'
  | 'shoulder_pressing'
  | 'upper_back_row'
  | 'lat_pull'
  | 'lower_back'
  | 'quad_dominant'
  | 'hinge_pattern'
  | 'unilateral_lower'
  | 'low_fatigue_accessory'

export type EquipmentType =
  | 'barbell'
  | 'dumbbells'
  | 'machine'
  | 'cable_machine'
  | 'smith_machine'
  | 'bench'
  | 'pull_up_bar'
  | 'bodyweight'

export type StimulusProfile =
  | 'strength'
  | 'hypertrophy'
  | 'power'
  | 'conditioning'
  | 'stability'

export type ExerciseId = string

export interface ExerciseMetadata {
  id: ExerciseId
  name: string
  movement_category: MovementCategory
  movementCategory?: MovementCategory
  primary_muscles: MuscleGroup[]
  secondary_muscles: MuscleGroup[]
  fatigue_rating: FatigueRating
  fatigueClass?: FatigueClass
  systemic_fatigue: SystemicFatigue
  stability_requirement: StabilityRequirement
  equipment_type: EquipmentType[]
  stimulus_profile: StimulusProfile[]
  difficulty_level: DifficultyLevel
  compoundType?: CompoundType
  overlapTags?: OverlapTag[]
}

export type ExerciseOverlapProfile = {
  movement_category: MovementCategory
  direct_muscles: MuscleGroup[]
  indirect_muscles: MuscleGroup[]
  fatigue_rating: FatigueRating
  systemic_fatigue: SystemicFatigue
}
