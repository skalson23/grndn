'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Gauge, Rabbit, ShieldCheck, Waves } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  WEIGHT_LOSS_PACE_OPTIONS,
  type WeightLossPaceId,
} from '@/lib/onboarding/weight-loss'

import { SelectionCard } from '../selection-card'
import { useOnboarding } from '../onboarding-context'

const icons: Record<WeightLossPaceId, typeof Rabbit> = {
  aggressive: Rabbit,
  moderate: Gauge,
  sustainable: Waves,
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

export function WeightLossPaceScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const value = data.weightLossPace

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
            <ShieldCheck className="h-5 w-5 text-foreground" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            What fat-loss pace fits your life?
          </h1>
          <p className="text-muted-foreground">
            Pace changes how conservative your training volume and systemic
            fatigue should be.
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6 py-6"
      >
        <div className="space-y-3">
          {WEIGHT_LOSS_PACE_OPTIONS.map((option) => {
            const Icon = icons[option.id]
            return (
              <motion.div key={option.id} variants={itemVariants}>
                <SelectionCard
                  icon={<Icon className="h-6 w-6" />}
                  title={option.title}
                  description={option.description}
                  selected={value === option.id}
                  onClick={() => updateData({ weightLossPace: option.id })}
                />
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <div className="flex-shrink-0 pt-4">
        <Button
          type="button"
          onClick={goNext}
          disabled={!value}
          size="lg"
          className="h-14 w-full rounded-2xl text-lg font-semibold disabled:opacity-30"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
