'use client'

import { type FormEvent, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronRight,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BrandLogo } from '@/components/brand/brand-logo'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { PhonePreview } from '@/components/landing/phone-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  LIVE_ACTIVITY,
  MOBILE_FEATURE_KEYS,
  SOCIAL_STATS,
} from '@/lib/landing/content'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

type MobileLandingProps = {
  accessGranted: boolean
  accessCode: string
  accessError: string
  isCheckingAccess: boolean
  isUnlocking: boolean
  waitlistEmail: string
  waitlistJoined: boolean
  isJoiningWaitlist: boolean
  onAccessCodeChange: (value: string) => void
  onAccessSubmit: (event: FormEvent<HTMLFormElement>) => void
  onWaitlistEmailChange: (value: string) => void
  onWaitlistSubmit: (event: FormEvent<HTMLFormElement>) => void
  onEnterOnboarding: () => void
  onScrollToAccess: () => void
}

export function MobileLanding({
  accessGranted,
  accessCode,
  accessError,
  isCheckingAccess,
  isUnlocking,
  waitlistEmail,
  waitlistJoined,
  isJoiningWaitlist,
  onAccessCodeChange,
  onAccessSubmit,
  onWaitlistEmailChange,
  onWaitlistSubmit,
  onEnterOnboarding,
  onScrollToAccess,
}: MobileLandingProps) {
  const accessRef = useRef<HTMLElement>(null)
  const t = useTranslations('landing.mobile')
  const tFeatures = useTranslations('landing.features.mobile')
  const tSocial = useTranslations('landing.social')
  const tActions = useTranslations('actions')
  const tCommon = useTranslations('common')

  const scrollToAccess = () => {
    onScrollToAccess()
    accessRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="lg:hidden">
      {/* Glass nav */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/6 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3.5">
          <BrandLogo size="sm" variant="horizontal" className="items-center" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <span className="rounded-full border border-[oklch(0.52_0.16_25)]/30 bg-[oklch(0.52_0.16_25)]/12 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[oklch(0.62_0.17_25)]">
              {tCommon('beta')}
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[100dvh] overflow-hidden px-5 pb-28 pt-[4.75rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.22),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.04),transparent_30%)]"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-24 h-48 w-48 -translate-x-1/2 rounded-full bg-[oklch(0.52_0.16_25)]/20 blur-[80px]"
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.55 }}
          className="relative flex flex-col items-center text-center"
        >
          <div className="relative w-fit scale-[0.92]">
            <BrandLogo size="hero" variant="horizontal" glow="hero" className="items-center" />
          </div>

          <span className="mt-5 inline-flex rounded-full border border-[oklch(0.52_0.16_25)]/30 bg-[oklch(0.52_0.16_25)]/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[oklch(0.62_0.17_25)]">
            {t('closedBeta')}
          </span>

          <h1 className="mt-5 max-w-[18rem] text-balance text-[2.65rem] font-bold leading-[0.9] tracking-[-0.04em]">
            {t('heroLine1')}
            <br />
            <span className="text-[oklch(0.62_0.17_25)]">{t('heroLine2')}</span>
          </h1>

          <p className="mt-4 max-w-[20rem] text-pretty text-base leading-relaxed text-foreground/75">
            {t('heroSubtitle')}
          </p>

          <div className="mt-7 flex w-full max-w-sm flex-col gap-3">
            <Button
              type="button"
              disabled={isUnlocking}
              onClick={accessGranted ? onEnterOnboarding : scrollToAccess}
              className={cn(
                'h-14 rounded-2xl text-base font-semibold active:scale-[0.98]',
                'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
                'shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_20px_60px_rgba(0,0,0,0.5)]'
              )}
            >
              {accessGranted ? tActions('continue_to_grndn') : tActions('get_beta_access')}
              <ArrowRight className="size-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={scrollToAccess}
              className="h-12 rounded-2xl border-border/80 bg-card/40 text-sm font-medium backdrop-blur"
            >
              {tActions('join_waitlist')}
            </Button>
          </div>
        </motion.div>

        <div className="relative mt-10">
          <PhonePreview />
        </div>
      </section>

      {/* Social proof */}
      <section className="px-5 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
        >
          <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            {t('liveOnGrnd')}
          </p>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 snap-x snap-mandatory scrollbar-none">
            {SOCIAL_STATS.map((stat) => (
              <div
                key={stat.labelKey}
                className="min-w-[9.5rem] shrink-0 snap-start rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur"
              >
                <stat.icon className="mb-2 size-4 text-[oklch(0.62_0.17_25)]" />
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tSocial(stat.labelKey)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {LIVE_ACTIVITY.map((item) => (
              <div
                key={item.user}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/50 px-4 py-3"
              >
                <p className="text-sm">
                  <span className="font-semibold text-foreground">@{item.user}</span>{' '}
                  <span className="text-muted-foreground">{tSocial(item.actionKey)}</span>
                </p>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features carousel */}
      <section className="pb-10">
        <div className="mb-4 px-5">
          <h2 className="text-2xl font-bold tracking-tight">{t('builtDifferent')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('swipeStack')}</p>
        </div>
        <div className="-mx-0 flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-none">
          {MOBILE_FEATURE_KEYS.map((feature, index) => (
            <motion.article
              key={feature.key}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="w-[78vw] max-w-[300px] shrink-0 snap-center rounded-3xl border border-border/70 bg-card/75 p-5 backdrop-blur"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[oklch(0.52_0.16_25)]/25 bg-[oklch(0.52_0.16_25)]/10">
                <feature.icon className="size-5 text-[oklch(0.62_0.17_25)]" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">
                {tFeatures(`${feature.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tFeatures(`${feature.key}.line`)}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Access */}
      <section
        ref={accessRef}
        id="beta-access"
        className="scroll-mt-24 px-5 pb-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="rounded-3xl border border-border/80 bg-card/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-foreground text-background">
            <LockKeyhole className="size-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t('enterBeta')}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('limitedSpots')}</p>

          {accessGranted ? (
            <div
              className={cn(
                'mt-5 space-y-3',
                isUnlocking && 'scale-[0.98] opacity-60 blur-sm'
              )}
            >
              <div className="flex items-center gap-3 rounded-2xl border border-[oklch(0.52_0.16_25)]/25 bg-[oklch(0.52_0.16_25)]/10 p-4">
                <div className="flex size-9 items-center justify-center rounded-full bg-[oklch(0.52_0.16_25)]">
                  <Check className="size-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{t('accessGranted')}</p>
                  <p className="text-xs text-muted-foreground">{t('savedOnDevice')}</p>
                </div>
              </div>
              <Button
                type="button"
                disabled={isUnlocking}
                onClick={onEnterOnboarding}
                className="h-12 w-full rounded-2xl bg-gradient-to-b from-neutral-100 to-neutral-300 text-base font-semibold text-neutral-950"
              >
                {isUnlocking ? (
                  <>
                    <Spinner className="size-4" />
                    {tActions('entering')}
                  </>
                ) : (
                  <>
                    {tCommon('continue')}
                    <ChevronRight className="size-5" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={onAccessSubmit}
              className={cn(
                'mt-5 space-y-3',
                isUnlocking && 'scale-[0.98] opacity-60 blur-sm'
              )}
            >
              <Input
                type="password"
                autoComplete="off"
                value={accessCode}
                onChange={(e) => onAccessCodeChange(e.target.value)}
                placeholder={t('betaAccessCode')}
                aria-invalid={Boolean(accessError)}
                className="h-12 rounded-2xl border-border bg-background/70 px-4 text-base"
              />
              {accessError && (
                <p className="text-sm text-destructive">{accessError}</p>
              )}
              <Button
                type="submit"
                disabled={
                  isCheckingAccess || isUnlocking || accessCode.trim().length === 0
                }
                className="h-12 w-full rounded-2xl bg-gradient-to-b from-neutral-100 to-neutral-300 text-base font-semibold text-neutral-950"
              >
                {isCheckingAccess || isUnlocking ? (
                  <>
                    <Spinner className="size-4" />
                    {tActions('unlocking')}
                  </>
                ) : (
                  <>
                    {tActions('unlock_grndn')}
                    <ArrowRight className="size-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="my-5 h-px bg-border/70" />

          <h3 className="text-base font-semibold">{t('wantEarlyAccess')}</h3>
          {waitlistJoined ? (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[oklch(0.52_0.16_25)]/25 bg-[oklch(0.52_0.16_25)]/10 p-4 text-sm font-medium">
              <Check className="size-4 text-[oklch(0.52_0.16_25)]" />
              {t('onTheList')}
            </div>
          ) : (
            <form onSubmit={onWaitlistSubmit} className="mt-3 space-y-3">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={waitlistEmail}
                  onChange={(e) => onWaitlistEmailChange(e.target.value)}
                  placeholder={tCommon('emailPlaceholder')}
                  className="h-12 rounded-2xl border-border bg-background/70 pl-10"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={isJoiningWaitlist || waitlistEmail.trim().length === 0}
                className="h-12 w-full rounded-2xl"
              >
                {isJoiningWaitlist ? (
                  <>
                    <Spinner className="size-4" />
                    {tActions('joining')}
                  </>
                ) : (
                  tActions('join_waitlist_short')
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </section>
    </div>
  )
}
