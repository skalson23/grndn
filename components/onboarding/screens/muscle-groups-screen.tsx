'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOnboarding } from '../onboarding-context'

const muscleGroups = [
  { id: 'chest', label: 'Chest', icon: '💪' },
  { id: 'back', label: 'Back', icon: '🦾' },
  { id: 'shoulders', label: 'Shoulders', icon: '🔥' },
  { id: 'arms', label: 'Arms', icon: '💥' },
  { id: 'core', label: 'Core', icon: '⚡' },
  { id: 'legs', label: 'Legs', icon: '🦵' },
  { id: 'glutes', label: 'Glutes', icon: '🍑' },
  { id: 'full-body', label: 'Full Body', icon: '🎯' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
}

export function MuscleGroupsScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const value = data.muscleGroups

  const toggleGroup = (id: string) => {
    if (id === 'full-body') {
      updateData({ muscleGroups: value.includes('full-body') ? [] : ['full-body'] })
    } else {
      const withoutFull = value.filter((v) => v !== 'full-body')
      if (withoutFull.includes(id)) {
        updateData({ muscleGroups: withoutFull.filter((v) => v !== id) })
      } else {
        updateData({ muscleGroups: [...withoutFull, id] })
      }
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Priority muscles
          </h1>
          <p className="text-muted-foreground">
            Which areas do you want to focus on?
          </p>
        </motion.div>
      </div>

      {/* Options */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 min-h-0 overflow-y-auto py-6 -mx-6 px-6"
      >
        <div className="grid grid-cols-2 gap-3">
          {muscleGroups.map((group) => {
            const isSelected = value.includes(group.id)
            return (
              <motion.button
                key={group.id}
                variants={itemVariants}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  'relative p-5 rounded-2xl border-2 text-center transition-all duration-300',
                  'bg-card hover:bg-secondary/50',
                  isSelected
                    ? 'border-foreground bg-secondary/80'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                {/* Selection indicator */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isSelected ? 1 : 0,
                    opacity: isSelected ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-foreground flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-background" />
                </motion.div>

                <div className="text-3xl mb-2">{group.icon}</div>
                <span className="text-sm font-semibold text-foreground">
                  {group.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* CTA */}
      <div className="flex-shrink-0 pt-4">
        <Button
          onClick={goNext}
          disabled={value.length === 0}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl disabled:opacity-30"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
