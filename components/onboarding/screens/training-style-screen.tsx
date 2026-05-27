'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  ChevronLeft,
  Dumbbell,
  Gauge,
  Layers,
  Minimize2,
  Triangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TRAINING_STYLE_OPTIONS } from '@/lib/onboarding/training-style'

import { SelectionCard } from '../selection-card'
import { useOnboarding } from '../onboarding-context'

const styleIcons = {
  hypertrophy: Dumbbell,
  strength: Gauge,
  v_taper: Triangle,
  powerbuilding: Layers,
  athletic: Activity,
  minimalist: Minimize2,
} as const

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function TrainingStyleScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const value = data.trainingStyle

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-6 pb-10"
    >
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
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            What training style fits you best?
          </h1>
          <p className="text-muted-foreground">
            Choose the training philosophy that best matches your goals and
            preferred experience.
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6 py-6"
      >
        <motion.div className="space-y-3">
          {TRAINING_STYLE_OPTIONS.map((style) => {
            const Icon = styleIcons[style.id]
            return (
              <motion.div key={style.id} variants={itemVariants}>
                <SelectionCard
                  icon={<Icon className="h-6 w-6" />}
                  title={style.title}
                  description={style.description}
                  selected={value === style.id}
                  onClick={() => updateData({ trainingStyle: style.id })}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-shrink-0 pt-4"
      >
        <Button
          type="button"
          onClick={goNext}
          disabled={!value}
          size="lg"
          className="h-14 w-full rounded-2xl text-lg font-semibold disabled:opacity-30"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  )
}
