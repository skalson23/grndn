'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { DesktopLanding } from '@/components/landing/desktop-landing'
import { MobileLanding } from '@/components/landing/mobile-landing'
import { MobileStickyCta } from '@/components/landing/mobile-sticky-cta'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { persistBetaAccessCookie } from '@/lib/billing/beta-access-cookie'
import { BETA_ACCESS_STORAGE_KEY } from '@/lib/billing/constants'
import { joinWaitlist } from '@/lib/supabase/waitlist'

const ACCESS_STORAGE_KEY = BETA_ACCESS_STORAGE_KEY
const ACCESS_CODE_HASH =
  '6331d4d5255ba9f19ed2fae41990f7495459fcad25c37ba80c0b43a887c69605'

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export default function Home() {
  const tErrors = useTranslations('landing.errors')
  const [accessGranted, setAccessGranted] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [accessError, setAccessError] = useState('')
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistJoined, setWaitlistJoined] = useState(false)
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false)

  useEffect(() => {
    const granted = localStorage.getItem(ACCESS_STORAGE_KEY) === 'true'
    setAccessGranted(granted)
    if (granted) {
      persistBetaAccessCookie()
    }
  }, [])

  const enterOnboarding = () => {
    setIsUnlocking(true)
    window.setTimeout(() => {
      setShowOnboarding(true)
    }, 360)
  }

  const handleAccessSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAccessError('')
    setIsCheckingAccess(true)

    try {
      const hash = await sha256(accessCode.trim())
      if (hash !== ACCESS_CODE_HASH) {
        setAccessError(tErrors('invalidAccessCode'))
        return
      }

      localStorage.setItem(ACCESS_STORAGE_KEY, 'true')
      persistBetaAccessCookie()
      setAccessGranted(true)
      enterOnboarding()
    } finally {
      setIsCheckingAccess(false)
    }
  }

  const handleWaitlistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsJoiningWaitlist(true)

    try {
      const status = await joinWaitlist(waitlistEmail)
      setWaitlistJoined(true)
      toast.success(
        status === 'duplicate'
          ? tErrors('waitlistDuplicate')
          : tErrors('waitlistJoined')
      )
    } catch {
      toast.error(tErrors('waitlistFailed'))
    } finally {
      setIsJoiningWaitlist(false)
    }
  }

  const scrollToAccess = () => {
    document.getElementById('beta-access')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleStickyPrimary = () => {
    if (accessGranted) {
      enterOnboarding()
      return
    }
    scrollToAccess()
  }

  if (showOnboarding) {
    return <OnboardingFlow />
  }

  const landingProps = {
    accessGranted,
    accessCode,
    accessError,
    isCheckingAccess,
    isUnlocking,
    waitlistEmail,
    waitlistJoined,
    isJoiningWaitlist,
    onAccessCodeChange: (value: string) => {
      setAccessCode(value)
      setAccessError('')
    },
    onAccessSubmit: handleAccessSubmit,
    onWaitlistEmailChange: setWaitlistEmail,
    onWaitlistSubmit: handleWaitlistSubmit,
    onEnterOnboarding: enterOnboarding,
  }

  return (
    <motion.main
      animate={{
        opacity: isUnlocking ? 0 : 1,
        scale: isUnlocking ? 1.015 : 1,
        filter: isUnlocking ? 'blur(12px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
      className="relative min-h-screen overflow-x-hidden bg-background text-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(127,29,29,0.16),transparent_46%),radial-gradient(ellipse_70%_45%_at_30%_38%,rgba(127,29,29,0.1),transparent_52%)] lg:block"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[36%] hidden h-64 w-64 -translate-x-1/2 rounded-full border border-white/[0.06] bg-white/[0.015] shadow-[0_0_100px_rgba(127,29,29,0.14)] blur-[2px] lg:left-[42%] lg:top-[38%] lg:block lg:h-72 lg:w-72"
        animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.58, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <MobileLanding {...landingProps} onScrollToAccess={scrollToAccess} />
      <DesktopLanding {...landingProps} />

      <MobileStickyCta
        accessGranted={accessGranted}
        isUnlocking={isUnlocking}
        onPrimaryClick={handleStickyPrimary}
      />
    </motion.main>
  )
}
