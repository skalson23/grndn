'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

type PlanAnalysisRevealProps = {
  protocolName: string
  protocolBadge: string
  whyTitle: string
  whyIntro: string
  whyBullets: string[]
  scorecardTitle: string
  scorecardDisclaimer: string
  scorecard: Array<{ id: string; label: string; score: number }>
  insightTitle: string
  insightText: string
  className?: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

export function PlanAnalysisReveal({
  protocolName,
  protocolBadge,
  whyTitle,
  whyIntro,
  whyBullets,
  scorecardTitle,
  scorecardDisclaimer,
  scorecard,
  insightTitle,
  insightText,
  className,
}: PlanAnalysisRevealProps) {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
      className={cn('flex flex-col gap-5', className)}
    >
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="overflow-hidden rounded-[2rem] border border-[oklch(0.52_0.16_25)]/25 bg-gradient-to-br from-[oklch(0.52_0.16_25)]/10 via-card/90 to-card/80 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.35)]"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[oklch(0.62_0.17_25)]">
          {protocolBadge}
        </p>
        <h2 className="mt-2 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl">
          {protocolName}
        </h2>
      </motion.div>

      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="rounded-[1.75rem] border border-border/80 bg-card/80 p-5 sm:p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-[oklch(0.52_0.16_25)]/15 text-[oklch(0.62_0.17_25)]">
            <Sparkles className="size-4" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">{whyTitle}</h3>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{whyIntro}</p>
        <ul className="space-y-2.5">
          {whyBullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-sm text-foreground/90">
              <Check className="mt-0.5 size-4 shrink-0 text-[oklch(0.62_0.17_25)]" strokeWidth={2.5} />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="rounded-[1.75rem] border border-border/80 bg-card/70 p-5 sm:p-6"
      >
        <div className="mb-1 flex items-end justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">{scorecardTitle}</h3>
        </div>
        <p className="mb-5 text-[11px] leading-relaxed text-muted-foreground">
          {scorecardDisclaimer}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {scorecard.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.07, duration: 0.45 }}
              className="rounded-2xl border border-border/70 bg-background/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground/90">{metric.label}</p>
                <span className="text-xl font-semibold tabular-nums text-[oklch(0.62_0.17_25)]">
                  {metric.score}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary/80">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[oklch(0.43_0.14_25)] to-[oklch(0.62_0.17_25)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.score}%` }}
                  transition={{ delay: 0.25 + index * 0.08, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="rounded-[1.75rem] border border-l-[3px] border-border border-l-[oklch(0.52_0.16_25)] bg-card/60 p-5 sm:p-6"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[oklch(0.62_0.17_25)]">
          {insightTitle}
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">{insightText}</p>
      </motion.div>
    </motion.section>
  )
}
