'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function BillingSuccessPage() {
  const t = useTranslations('billing.success')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [beginSetup, setBeginSetup] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSessionId(params.get('session_id'))
  }, [])

  if (beginSetup) {
    return <OnboardingFlow />
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16 text-foreground">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-md flex-col items-center text-center"
      >
        <BrandLogo size="md" glow="soft" className="mb-8 items-center" />
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-[oklch(0.52_0.16_25)]/15 text-[oklch(0.62_0.17_25)]">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('description')}</p>
        {sessionId && (
          <p className="mt-4 text-[10px] text-muted-foreground/70">{t('sessionNote')}</p>
        )}
        <Button
          type="button"
          size="lg"
          onClick={() => setBeginSetup(true)}
          className={cn(
            'mt-8 h-14 min-w-[220px] rounded-2xl px-8 text-base font-semibold',
            'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
            'border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)]'
          )}
        >
          {t('beginSetup')}
        </Button>
      </motion.div>
    </div>
  )
}
