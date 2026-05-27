'use client'

import { motion } from 'framer-motion'
import { Flame, Scale, Dumbbell, Heart, Trophy, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SelectionCard } from '../selection-card'
import { useOnboarding } from '../onboarding-context'

const goals = [
  {
    id: 'lose-weight',
    icon: Scale,
    title: 'Lose Weight',
    description: 'Burn fat and get lean with targeted cardio and strength training',
  },
  {
    id: 'build-muscle',
    icon: Dumbbell,
    title: 'Build Muscle',
    description: 'Gain strength and size with progressive overload programs',
  },
  {
    id: 'get-fit',
    icon: Flame,
    title: 'Get Fit',
    description: 'Improve overall fitness, stamina, and daily energy levels',
  },
  {
    id: 'stay-healthy',
    icon: Heart,
    title: 'Stay Healthy',
    description: 'Maintain your current fitness with balanced workouts',
  },
  {
    id: 'compete',
    icon: Trophy,
    title: 'Compete',
    description: 'Train for athletic performance and competition',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function GoalSelectionScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const value = data.goals
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
            {"What's your goal?"}
          </h1>
          <p className="text-muted-foreground">
            Select one or more fitness objectives
          </p>
        </motion.div>
      </div>

      {/* Options */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 min-h-0 overflow-y-auto py-6 -mx-6 px-6 space-y-3"
      >
        {goals.map((goal) => (
          <motion.div key={goal.id} variants={itemVariants}>
            <SelectionCard
              icon={<goal.icon className="w-6 h-6" />}
              title={goal.title}
              description={goal.description}
              selected={value.includes(goal.id)}
              onClick={() => {
                if (value.includes(goal.id)) {
                  const nextGoals = value.filter((id) => id !== goal.id)
                  updateData({
                    goals: nextGoals,
                    ...(goal.id === 'lose-weight'
                      ? {
                          targetWeightKg: null,
                          weightLossPace: '',
                        }
                      : {}),
                  })
                } else {
                  updateData({ goals: [...value, goal.id] })
                }
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <div className="flex-shrink-0 pt-4 pb-safe">
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
