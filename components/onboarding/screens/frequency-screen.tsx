'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Minus, Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOnboarding } from '../onboarding-context'

const getFrequencyLabel = (freq: number) => {
  if (freq === 1) return 'Light'
  if (freq <= 2) return 'Easy Start'
  if (freq <= 3) return 'Balanced'
  if (freq <= 4) return 'Committed'
  if (freq <= 5) return 'Serious'
  if (freq <= 6) return 'Dedicated'
  return 'Beast Mode'
}

const getFrequencyDescription = (freq: number) => {
  if (freq === 1) return 'Perfect for maintaining fitness'
  if (freq <= 2) return 'Great for beginners'
  if (freq <= 3) return 'Ideal for most people'
  if (freq <= 4) return 'Optimal for building strength'
  if (freq <= 5) return 'For serious athletes'
  if (freq <= 6) return 'Elite training schedule'
  return 'Maximum results, maximum effort'
}

export function FrequencyScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const value = data.frequency
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

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
              <Calendar className="w-5 h-5 text-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Weekly frequency
          </h1>
          <p className="text-muted-foreground">
            How many days per week can you train?
          </p>
        </motion.div>
      </div>

      {/* Selector */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          {/* Main number */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                updateData({ frequency: Math.max(1, value - 1) })
              }
              disabled={value <= 1}
              className={cn(
                'w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all',
                value <= 1
                  ? 'border-muted text-muted cursor-not-allowed'
                  : 'border-border hover:border-foreground hover:bg-secondary'
              )}
            >
              <Minus className="w-6 h-6" />
            </motion.button>

            <div className="w-32">
              <motion.div
                key={value}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-7xl font-bold tracking-tight"
              >
                {value}
              </motion.div>
              <p className="text-muted-foreground text-sm mt-1">
                days / week
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                updateData({ frequency: Math.min(7, value + 1) })
              }
              disabled={value >= 7}
              className={cn(
                'w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all',
                value >= 7
                  ? 'border-muted text-muted cursor-not-allowed'
                  : 'border-border hover:border-foreground hover:bg-secondary'
              )}
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Label */}
          <motion.div
            key={getFrequencyLabel(value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-secondary text-foreground font-semibold">
              {getFrequencyLabel(value)}
            </span>
            <p className="text-sm text-muted-foreground mt-3">
              {getFrequencyDescription(value)}
            </p>
          </motion.div>

          {/* Week visualization */}
          <div className="flex gap-2 justify-center">
            {days.map((day, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300',
                  index < value
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                {day}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

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
