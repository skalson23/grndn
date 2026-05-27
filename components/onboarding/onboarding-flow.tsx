'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { WelcomeScreen } from './screens/welcome-screen'
import { GoalSelectionScreen } from './screens/goal-selection-screen'
import { ExperienceScreen } from './screens/experience-screen'
import { TrainingStyleScreen } from './screens/training-style-screen'
import { EquipmentScreen } from './screens/equipment-screen'
import { InjuriesScreen } from './screens/injuries-screen'
import { SexScreen } from './screens/sex-screen'
import { AgeScreen } from './screens/age-screen'
import { WeightScreen } from './screens/weight-screen'
import { HeightScreen } from './screens/height-screen'
import { ActivityLevelScreen } from './screens/activity-level-screen'
import { TargetWeightScreen } from './screens/target-weight-screen'
import { WeightLossPaceScreen } from './screens/weight-loss-pace-screen'
import { MuscleGroupsScreen } from './screens/muscle-groups-screen'
import { FrequencyScreen } from './screens/frequency-screen'
import { DurationScreen } from './screens/duration-screen'
import { SummaryScreen } from './screens/summary-screen'
import { ProgressBar } from './progress-bar'
import {
  OnboardingProvider,
  useOnboarding,
  ONBOARDING_STEP_COUNT,
  isWeightLossGoal,
} from './onboarding-context'

export type { OnboardingData } from './onboarding-context'
export {
  OnboardingProvider,
  useOnboarding,
  defaultOnboardingData,
  ONBOARDING_STEP_COUNT,
} from './onboarding-context'

function OnboardingFlowInner() {
  const { currentStep, direction, data } = useOnboarding()

  const screens = [
    <WelcomeScreen key="welcome" />,
    <AgeScreen key="age" />,
    <HeightScreen key="height" />,
    <WeightScreen key="weight" />,
    <SexScreen key="sex" />,
    <ActivityLevelScreen key="activity" />,
    <ExperienceScreen key="experience" />,
    <GoalSelectionScreen key="goal" />,
    ...(isWeightLossGoal(data)
      ? [
          <TargetWeightScreen key="target-weight" />,
          <WeightLossPaceScreen key="weight-loss-pace" />,
        ]
      : []),
    <TrainingStyleScreen key="training-style" />,
    <MuscleGroupsScreen key="muscles" />,
    <EquipmentScreen key="equipment" />,
    <InjuriesScreen key="injuries" />,
    <FrequencyScreen key="frequency" />,
    <DurationScreen key="duration" />,
    <SummaryScreen key="summary" />,
  ]

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      filter: 'blur(8px)',
      scale: 0.985,
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      filter: 'blur(8px)',
      scale: 0.985,
    }),
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.75, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-0 flex flex-col overflow-hidden bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.18),transparent_35%),radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.055),transparent_24%)]"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] h-80 w-80 -translate-x-1/2 rounded-full border border-white/[0.07] bg-white/[0.015] shadow-[0_0_160px_rgba(127,29,29,0.18)] blur-[1px] sm:top-[16%] sm:h-96 sm:w-96"
        animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.72, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <AnimatePresence>
        {currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            <ProgressBar
              currentStep={currentStep}
              totalSteps={screens.length - 1}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 260, damping: 32 },
              opacity: { duration: 0.28 },
              filter: { duration: 0.32 },
              scale: { duration: 0.32 },
            }}
            className="absolute inset-0 flex flex-col overflow-hidden"
          >
            {screens[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export function OnboardingFlow() {
  return (
    <OnboardingProvider>
      <OnboardingFlowInner />
    </OnboardingProvider>
  )
}
