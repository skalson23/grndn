'use client'

import { motion } from 'framer-motion'
import { Mars, Venus, Users, CircleSlash, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SelectionCard } from '../selection-card'
import { useOnboarding } from '../onboarding-context'

const options = [
  {
    id: 'male' as const,
    icon: Mars,
    title: 'Male',
    description: 'Used only to tune evidence-based training variables',
  },
  {
    id: 'female' as const,
    icon: Venus,
    title: 'Female',
    description: 'Used only to tune evidence-based training variables',
  },
  {
    id: 'non-binary' as const,
    icon: Users,
    title: 'Non-binary',
    description: 'Inclusive programming without assumptions',
  },
  {
    id: 'prefer-not-to-say' as const,
    icon: CircleSlash,
    title: 'Prefer not to say',
    description: 'Neutral prescriptions; no sex-specific assumptions',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function SexScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const value = data.sex

  return (
    <div className="flex-1 flex flex-col p-6 pb-10 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <button
          type="button"
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">About you</h1>
          <p className="text-muted-foreground">
            Helps calibrate recovery and programming style. You can update this
            later.
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 min-h-0 overflow-y-auto py-6 -mx-6 px-6 space-y-3"
      >
        {options.map((opt) => (
          <motion.div key={opt.id} variants={itemVariants}>
            <SelectionCard
              icon={<opt.icon className="w-6 h-6" />}
              title={opt.title}
              description={opt.description}
              selected={value === opt.id}
              onClick={() => updateData({ sex: opt.id })}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="flex-shrink-0 pt-4">
        <Button
          type="button"
          onClick={goNext}
          disabled={!value}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl disabled:opacity-30"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
