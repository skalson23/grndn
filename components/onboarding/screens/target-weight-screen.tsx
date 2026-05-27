'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Goal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useOnboarding } from '../onboarding-context'

const MIN = 30
const MAX = 300

function formatWeight(value: number | null): string {
  if (value == null) return ''
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function isDecimalDraft(value: string): boolean {
  return value === '' || /^\d{0,3}(\.\d?)?$/.test(value)
}

function parseTargetWeight(value: string, currentWeight: number): number | null {
  if (value === '' || value.endsWith('.')) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (n < MIN || n > MAX || n >= currentWeight) return null
  return Math.round(n * 10) / 10
}

export function TargetWeightScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const [draft, setDraft] = useState(() => formatWeight(data.targetWeightKg))

  useEffect(() => {
    setDraft(formatWeight(data.targetWeightKg))
  }, [data.targetWeightKg])

  const parsedTarget = useMemo(
    () => parseTargetWeight(draft, data.weightKg),
    [draft, data.weightKg]
  )
  const valid = parsedTarget != null

  const commitTarget = () => {
    if (parsedTarget == null) {
      setDraft(formatWeight(data.targetWeightKg))
      return null
    }

    updateData({ targetWeightKg: parsedTarget })
    setDraft(formatWeight(parsedTarget))
    return parsedTarget
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-6 pb-10">
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Goal className="h-5 w-5 text-foreground" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            What target weight are you aiming for?
          </h1>
          <p className="text-muted-foreground">
            This helps calibrate fatigue and recovery expectations for fat-loss
            training.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8"
      >
        <label className="mb-2 text-sm font-medium text-muted-foreground">
          Target weight (kg)
        </label>
        <Input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft}
          onChange={(e) => {
            const raw = e.target.value
            if (isDecimalDraft(raw)) setDraft(raw)
          }}
          onBlur={() => {
            commitTarget()
          }}
          placeholder={`${Math.max(MIN, Math.round(data.weightKg - 5))}`}
          className="h-14 rounded-2xl border-border bg-card text-2xl font-semibold tabular-nums"
        />
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Enter a realistic target below your current {data.weightKg} kg body
          weight.
        </p>
      </motion.div>

      <div className="flex-shrink-0 pt-4">
        <Button
          type="button"
          onClick={() => {
            if (commitTarget() != null) goNext()
          }}
          disabled={!valid}
          size="lg"
          className="h-14 w-full rounded-2xl text-lg font-semibold disabled:opacity-30"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
