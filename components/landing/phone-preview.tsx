'use client'

import { motion } from 'framer-motion'
import { Activity, Flame } from 'lucide-react'

export function PhonePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
      className="relative mx-auto w-full max-w-[280px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-[radial-gradient(circle,rgba(127,29,29,0.22),transparent_68%)] blur-2xl"
      />
      <div className="relative rounded-[2.25rem] border border-white/12 bg-gradient-to-b from-neutral-900 to-black p-2 shadow-[0_40px_100px_rgba(0,0,0,0.65)]">
        <div className="overflow-hidden rounded-[1.85rem] border border-white/8 bg-background">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Today
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.52_0.16_25)]/15 px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.62_0.17_25)]">
              <Flame className="size-3" />
              14 streak
            </span>
          </div>
          <div className="space-y-3 p-4">
            <div className="rounded-2xl border border-border/70 bg-card/80 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Push A · Week 3
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight">Bench progression</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[oklch(0.43_0.14_25)] to-[oklch(0.64_0.16_25)]" />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">72% complete</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Volume', value: '18.2k' },
                { label: 'RPE avg', value: '7.8' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/60 bg-background/60 px-3 py-2.5"
                >
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[oklch(0.52_0.16_25)]/25 bg-[oklch(0.52_0.16_25)]/10 px-3 py-2">
              <Activity className="size-4 text-[oklch(0.62_0.17_25)]" />
              <p className="text-[11px] font-medium">Recovery score: Optimal</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
