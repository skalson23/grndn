import { cn } from '@/lib/utils'

type ExerciseRowProps = {
  name: string
  sets: number
  repsOrDuration: string
  restSeconds: number | null
  coachingCue: string | null
  className?: string
}

export function ExerciseRow({
  name,
  sets,
  repsOrDuration,
  restSeconds,
  coachingCue,
  className,
}: ExerciseRowProps) {
  const restLabel =
    restSeconds == null
      ? '—'
      : restSeconds >= 60
        ? `${Math.round(restSeconds / 60)} min`
        : `${restSeconds}s`

  return (
    <li
      className={cn(
        'flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-border/60',
        'bg-secondary/25 p-4 transition-all duration-300',
        'hover:border-muted-foreground/35 hover:bg-secondary/40',
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h4 className="text-base font-semibold leading-snug tracking-[-0.01em] text-foreground break-words">
          {name}
        </h4>
        {coachingCue != null && coachingCue !== '' && (
          <p className="text-xs leading-relaxed text-muted-foreground break-words">
            {coachingCue}
          </p>
        )}
      </div>

      <dl className="grid w-full min-w-0 grid-cols-3 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60">
        <div className="flex min-w-0 flex-col gap-0.5 bg-background/55 p-3">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Sets
          </dt>
          <dd className="text-sm font-medium tabular-nums text-foreground">{sets}</dd>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5 bg-background/55 p-3">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Reps
          </dt>
          <dd className="text-sm font-medium leading-snug text-foreground break-words">
            {repsOrDuration}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5 bg-background/55 p-3">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Rest
          </dt>
          <dd className="text-sm font-medium tabular-nums text-muted-foreground">
            {restLabel}
          </dd>
        </div>
      </dl>
    </li>
  )
}
