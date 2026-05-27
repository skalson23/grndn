import { EXERCISE_DATABASE } from './database'

function canonicalKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\bdb\b/g, 'dumbbell')
    .replace(/\bbb\b/g, 'barbell')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
}

const EXERCISE_NAME_ALIASES: Record<string, string> = {
  'bench press': 'Barbell Bench Press',
  'barbell bench': 'Barbell Bench Press',
  'flat bench press': 'Barbell Bench Press',
  'incline dumbbell press': 'Incline Dumbbell Press',
  'incline db press': 'Incline Dumbbell Press',
  'incline dumbbell bench press': 'Incline Dumbbell Press',
  'machine press': 'Machine Chest Press',
  'chest press machine': 'Machine Chest Press',
  'machine chest press': 'Machine Chest Press',
  'cable flye': 'Cable Fly',
  'cable fly': 'Cable Fly',
  'db shoulder press': 'Seated Dumbbell Shoulder Press',
  'dumbbell shoulder press': 'Seated Dumbbell Shoulder Press',
  'seated db shoulder press': 'Seated Dumbbell Shoulder Press',
  'lateral raise cable': 'Cable Lateral Raise',
  'cable lateral raises': 'Cable Lateral Raise',
  'cable lateral raise': 'Cable Lateral Raise',
  'chest supported row': 'Chest-Supported Row',
  'chest supported dumbbell row': 'Chest-Supported Row',
  'cable row': 'Seated Cable Row',
  'seated row': 'Seated Cable Row',
  'seated cable row': 'Seated Cable Row',
  'pulldown': 'Lat Pulldown',
  'lat pull down': 'Lat Pulldown',
  'lat pulldown': 'Lat Pulldown',
  'assisted pullup': 'Assisted Pull-Up',
  'assisted pull up': 'Assisted Pull-Up',
  'squat': 'Back Squat',
  'barbell squat': 'Back Squat',
  'back squat': 'Back Squat',
  'hack squat': 'Hack Squat',
  'leg press': 'Leg Press',
  'rdl': 'Romanian Deadlift',
  'romanian deadlift': 'Romanian Deadlift',
  'seated hamstring curl': 'Seated Leg Curl',
  'seated leg curl': 'Seated Leg Curl',
  'bulgarian split squat': 'Bulgarian Split Squat',
  'db bulgarian split squat': 'Bulgarian Split Squat',
  'walking lunges': 'Walking Lunge',
  'walking lunge': 'Walking Lunge',
  'bayesian cable curl': 'Bayesian Curl',
  'bayesian curl': 'Bayesian Curl',
  'incline curl': 'Incline Dumbbell Curl',
  'incline dumbbell curl': 'Incline Dumbbell Curl',
  'tricep pushdown': 'Cable Pushdown',
  'triceps pushdown': 'Cable Pushdown',
  'cable tricep pushdown': 'Cable Pushdown',
  'cable pushdown': 'Cable Pushdown',
  'overhead cable extension': 'Overhead Cable Triceps Extension',
  'overhead cable triceps extension': 'Overhead Cable Triceps Extension',
  'calf raise': 'Standing Calf Raise',
  'standing calf raise': 'Standing Calf Raise',
  'cable crunch': 'Cable Crunch',
  'deadbug': 'Dead Bug',
  'dead bug': 'Dead Bug',
}

const CANONICAL_EXERCISE_NAMES = new Map(
  EXERCISE_DATABASE.map((exercise) => [canonicalKey(exercise.name), exercise.name])
)

export function normalizeExerciseName(name: string): string {
  const key = canonicalKey(name)
  return (
    EXERCISE_NAME_ALIASES[key] ??
    CANONICAL_EXERCISE_NAMES.get(key) ??
    name.trim()
  )
}

export function isKnownExerciseName(name: string): boolean {
  return CANONICAL_EXERCISE_NAMES.has(canonicalKey(normalizeExerciseName(name)))
}
