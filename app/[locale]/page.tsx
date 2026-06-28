'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { SaasLanding } from '@/components/landing/saas-landing'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)

  const enterOnboarding = () => {
    setIsUnlocking(true)
    window.setTimeout(() => {
      setShowOnboarding(true)
    }, 360)
  }

  if (showOnboarding) {
    return <OnboardingFlow />
  }

  return (
    <motion.main
      animate={{
        opacity: isUnlocking ? 0 : 1,
        scale: isUnlocking ? 1.015 : 1,
        filter: isUnlocking ? 'blur(12px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
      className="relative min-h-screen overflow-x-hidden bg-background pb-24 text-foreground lg:pb-0"
    >
      <SaasLanding onStartFree={enterOnboarding} isUnlocking={isUnlocking} />
    </motion.main>
  )
}
