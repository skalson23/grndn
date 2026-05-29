'use client'

import { type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  LockKeyhole,
  Mail,
} from 'lucide-react'

import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { DESKTOP_FEATURES } from '@/lib/landing/content'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

type DesktopLandingProps = {
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
}

export function DesktopLanding({
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
}: DesktopLandingProps) {
  return (
    <div className="hidden lg:block">
      <section className="relative mx-auto flex h-svh min-h-svh w-full max-w-6xl flex-col overflow-hidden px-8">
        <header className="pointer-events-none absolute right-8 top-6 z-10">
          <span className="pointer-events-auto rounded-full border border-border bg-card/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
            Closed Beta
          </span>
        </header>

        <div className="flex min-h-0 flex-1 items-center justify-center pt-[4.75rem]">
          <div className="grid w-full max-w-[64rem] -translate-y-[3.75rem] grid-cols-[1.12fr_0.88fr] items-start gap-5">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
              className="flex max-w-[32rem] flex-col text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                className="relative w-full"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-6 top-1/2 h-28 w-[115%] -translate-y-1/2 bg-[radial-gradient(ellipse_at_left,rgba(127,29,29,0.14),transparent_72%)] blur-2xl"
                />
                <div className="relative w-fit origin-left scale-[0.85]">
                  <BrandLogo
                    size="display"
                    variant="horizontal"
                    glow="soft"
                    className="items-start"
                  />
                </div>
              </motion.div>
              <div className="-mt-4 origin-top scale-[1.15]">
                <div className="mt-1 inline-flex rounded-full border border-[oklch(0.52_0.16_25)]/25 bg-[oklch(0.52_0.16_25)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[oklch(0.62_0.17_25)]">
                  Closed Beta • Launching June 2026
                </div>
                <h1 className="mt-2.5 max-w-[30rem] text-balance text-[3.15rem] font-semibold leading-[0.88] tracking-[-0.05em]">
                  Smarter AI Workout Programming.
                </h1>
                <p className="mt-3 max-w-lg text-base leading-6 text-foreground/72">
                  Built for lifters who care about recovery, fatigue management and
                  real progression.
                </p>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {['Recovery-aware', 'Hypertrophy logic', 'Premium programs'].map(
                    (label) => (
                      <span
                        key={label}
                        className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur"
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
              className="max-w-[20rem] justify-self-end xl:max-w-[20rem]"
            >
              <div className="origin-top scale-[1.05] rounded-[1.75rem] border border-border/80 bg-card/85 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
                <div className="mb-3.5 flex size-10 items-center justify-center rounded-xl bg-foreground text-background shadow-[0_0_24px_rgba(127,29,29,0.18)]">
                  <LockKeyhole className="size-4" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Enter the closed beta
                </h2>
                <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                  Early access is limited while GRNDN&apos;s programming engine is being
                  refined for serious lifters.
                </p>

                {accessGranted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'mt-5 space-y-2.5',
                      isUnlocking && 'scale-[0.985] opacity-55 blur-sm'
                    )}
                  >
                    <div className="rounded-2xl border border-[oklch(0.52_0.16_25)]/25 bg-[oklch(0.52_0.16_25)]/10 p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-[oklch(0.52_0.16_25)] text-foreground">
                          <Check className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Access granted</p>
                          <p className="text-xs text-muted-foreground">
                            Your beta access is saved on this device.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={isUnlocking}
                      onClick={onEnterOnboarding}
                      className={cn(
                        'h-11 w-full rounded-2xl font-semibold',
                        'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
                        'shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_18px_60px_rgba(0,0,0,0.5)]',
                        'hover:from-white hover:to-neutral-200'
                      )}
                    >
                      {isUnlocking ? (
                        <>
                          <Spinner className="size-4" />
                          Entering…
                        </>
                      ) : (
                        <>
                          Continue to GRNDN
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={onAccessSubmit}
                    className={cn(
                      'mt-5 space-y-2.5',
                      isUnlocking && 'scale-[0.985] opacity-55 blur-sm'
                    )}
                  >
                    <Input
                      type="password"
                      autoComplete="off"
                      value={accessCode}
                      onChange={(e) => onAccessCodeChange(e.target.value)}
                      placeholder="Enter Closed Beta Access Code"
                      aria-invalid={Boolean(accessError)}
                      className="h-13 rounded-2xl border-border bg-background/70 px-4 text-base shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]"
                    />
                    {accessError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {accessError}
                      </motion.p>
                    )}
                    <Button
                      type="submit"
                      disabled={
                        isCheckingAccess ||
                        isUnlocking ||
                        accessCode.trim().length === 0
                      }
                      className={cn(
                        'h-11 w-full rounded-2xl font-semibold',
                        'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
                        'shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_18px_60px_rgba(0,0,0,0.5)]',
                        'hover:from-white hover:to-neutral-200'
                      )}
                    >
                      {isCheckingAccess || isUnlocking ? (
                        <>
                          <Spinner className="size-4" />
                          Entering…
                        </>
                      ) : (
                        <>
                          Unlock GRNDN
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                <div className="my-5 h-px bg-border/80" />

                <div>
                  <h3 className="text-base font-semibold tracking-tight">
                    Want early access?
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">
                    Join the waitlist for launch updates and creator beta drops.
                  </p>

                  {waitlistJoined ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-3 rounded-2xl border border-[oklch(0.52_0.16_25)]/25 bg-[oklch(0.52_0.16_25)]/10 p-4 text-sm font-medium text-foreground"
                    >
                      <Check className="size-4 text-[oklch(0.52_0.16_25)]" />
                      You&apos;re on the list.
                    </motion.div>
                  ) : (
                    <form onSubmit={onWaitlistSubmit} className="mt-3.5 space-y-2.5">
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          required
                          value={waitlistEmail}
                          onChange={(e) => onWaitlistEmailChange(e.target.value)}
                          placeholder="you@example.com"
                          className="h-12 rounded-2xl border-border bg-background/70 pl-10"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={
                          isJoiningWaitlist || waitlistEmail.trim().length === 0
                        }
                        className="h-11 w-full rounded-2xl border-border bg-background/50"
                      >
                        {isJoiningWaitlist ? (
                          <>
                            <Spinner className="size-4" />
                            Joining…
                          </>
                        ) : (
                          'Join Waitlist'
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-8 pb-20 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="mb-6 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[oklch(0.52_0.16_25)]">
            Built for serious lifters.
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">
            Designed around real hypertrophy principles.
          </h2>
        </motion.div>

        <div className="grid grid-cols-5 gap-3">
          {DESKTOP_FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.04, duration: 0.45 }}
              className="group rounded-3xl border border-border/80 bg-card/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[oklch(0.52_0.16_25)]/35 hover:bg-card hover:shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
            >
              <div className="mb-5 flex size-10 items-center justify-center rounded-2xl border border-border bg-secondary/70 transition-colors group-hover:border-[oklch(0.52_0.16_25)]/35">
                <feature.icon className="size-5 text-foreground" />
              </div>
              <h3 className="text-sm font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-border bg-card/60 p-6 text-center backdrop-blur">
          <p className="text-pretty text-sm leading-7 text-muted-foreground">
            GRNDN is being built for lifters who want intelligent programming, not
            random workouts. Closed beta access helps us keep quality high while the
            coaching engine matures.
          </p>
        </div>
      </section>
    </div>
  )
}
