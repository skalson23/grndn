import { Clock, Dumbbell, Layers3 } from 'lucide-react'

import type { WorkoutPlan } from '@/lib/workout-plan/schema'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { ExerciseRow } from './exercise-row'

type Session = WorkoutPlan['weeklySessions'][number]

type WorkoutSessionCardProps = {
  session: Session
  className?: string
}

function SessionListSection({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <section className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-border/60 bg-background/35 p-4">
      <h5 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h5>
      <ul className="flex flex-col gap-2 pl-4 text-sm leading-relaxed text-foreground/90 list-disc marker:text-[oklch(0.52_0.16_25)]">
        {items.map((line, i) => (
          <li key={`${title}-${i}`} className="break-words">
            {line}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function WorkoutSessionCard({ session, className }: WorkoutSessionCardProps) {
  return (
    <Card
      className={cn(
        'group w-full min-w-0 gap-0 overflow-hidden rounded-[2rem] border-border/80 bg-card/85 py-0',
        'shadow-[0_18px_80px_rgba(0,0,0,0.22)] transition-all duration-300',
        'hover:border-[oklch(0.52_0.16_25)]/35 hover:shadow-[0_24px_100px_rgba(0,0,0,0.32)]',
        className
      )}
    >
      <header className="relative flex w-full min-w-0 flex-col border-b border-border/80 px-4 py-5 sm:px-6">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-[oklch(0.52_0.16_25)]/[0.05] opacity-80"
        />
        <div className="relative flex w-full min-w-0 items-start gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-secondary/80 transition-colors group-hover:border-[oklch(0.52_0.16_25)]/40"
            aria-hidden
          >
            <Dumbbell className="size-5 text-[oklch(0.52_0.16_25)]" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-background/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Day {session.order}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                <Clock className="size-3" />~{session.estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                <Layers3 className="size-3" />
                {session.exercises.length} moves
              </span>
            </div>
            <h3 className="text-xl font-semibold leading-snug tracking-[-0.02em] text-foreground break-words sm:text-2xl">
              {session.name}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground break-words">
              {session.primaryFocus}
            </p>
          </div>
        </div>
      </header>

      <CardContent className="flex w-full min-w-0 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
        {session.warmup != null && session.warmup.length > 0 && (
          <SessionListSection title="Warm-up" items={session.warmup} />
        )}

        <section className="flex w-full min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Main work
            </h5>
            <div className="h-px flex-1 bg-border/70" />
          </div>
          <ul className="flex w-full min-w-0 flex-col gap-3">
            {session.exercises.map((ex, i) => (
              <ExerciseRow
                key={`${session.order}-${ex.name}-${i}`}
                name={ex.name}
                sets={ex.sets}
                repsOrDuration={ex.repsOrDuration}
                restSeconds={ex.restSeconds}
                coachingCue={ex.coachingCue}
              />
            ))}
          </ul>
        </section>

        {session.cooldown != null && session.cooldown.length > 0 && (
          <SessionListSection title="Cool-down" items={session.cooldown} />
        )}
      </CardContent>
    </Card>
  )
}
