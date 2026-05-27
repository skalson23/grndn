'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOnboarding } from '../onboarding-context'

const durations = [
  { value: 15, label: '15 min', description: 'Quick burst' },
  { value: 30, label: '30 min', description: 'Efficient' },
  { value: 45, label: '45 min', description: 'Standard' },
  { value: 60, label: '60 min', description: 'Complete' },
  { value: 75, label: '75 min', description: 'Extended' },
  { value: 90, label: '90 min', description: 'Intense' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function DurationScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const value = data.duration
  return (
    <div className="flex-1 flex flex-col p-6 pb-10 h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Clock className="w-5 h-5 text-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Session duration
          </h1>
          <p className="text-muted-foreground">
            How long can you workout each session?
          </p>
        </motion.div>
      </div>

      {/* Options */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 flex items-center justify-center py-8"
      >
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {durations.map((duration) => {
            const isSelected = value === duration.value
            return (
              <motion.button
                key={duration.value}
                variants={itemVariants}
                whileTap={{ scale: 0.96 }}
                onClick={() => updateData({ duration: duration.value })}
                className={cn(
                  'relative p-6 rounded-2xl border-2 text-center transition-all duration-300',
                  'bg-card hover:bg-secondary/50',
                  isSelected
                    ? 'border-foreground bg-secondary/80'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isSelected ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {duration.label}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {duration.description}
                  </p>
                </motion.div>

                {/* Selection ring */}
                {isSelected && (
                  <motion.div
                    layoutId="duration-ring"
                    className="absolute inset-0 rounded-2xl border-2 border-foreground"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* CTA */}
      <div className="flex-shrink-0 pt-4">
        <Button
          onClick={goNext}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
