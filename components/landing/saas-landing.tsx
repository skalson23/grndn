'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BrandLogo } from '@/components/brand/brand-logo'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import {
  FAQ_KEYS,
  FEATURE_KEYS,
  HOW_IT_WORKS_STEPS,
  SOCIAL_PROOF_KEYS,
} from '@/lib/landing/saas-content'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
}

type SaasLandingProps = {
  className?: string
}

export function SaasLanding({ className }: SaasLandingProps) {
  const t = useTranslations('landing')

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  const primaryButtonClass = cn(
    'h-12 rounded-2xl px-6 text-base font-semibold active:scale-[0.98]',
    'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
    'border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)]'
  )

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <BrandLogo size="nav" variant="horizontal" glow="soft" />
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Button
              type="button"
              variant="ghost"
              className="hidden rounded-xl sm:inline-flex"
              onClick={scrollToHowItWorks}
            >
              {t('hero.viewPlans')}
            </Button>
            <Button
              asChild
              className={cn(primaryButtonClass, 'h-10 px-4 text-sm')}
            >
              <Link href="/assessment">{t('hero.startAssessment')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.2),transparent_50%),radial-gradient(ellipse_80%_50%_at_80%_20%,rgba(127,29,29,0.08),transparent_60%)]"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-32 h-72 w-72 -translate-x-1/2 rounded-full border border-white/[0.06] bg-white/[0.02] shadow-[0_0_120px_rgba(127,29,29,0.15)] blur-[1px]"
          animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative mx-auto max-w-4xl text-center"
        >
          <motion.p
            variants={fadeUp}
            className="mb-5 inline-flex rounded-full border border-[oklch(0.52_0.16_25)]/25 bg-[oklch(0.52_0.16_25)]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[oklch(0.62_0.17_25)]"
          >
            {t('hero.eyebrow')}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl"
          >
            <span className="block">{t('hero.headlineLine1')}</span>
            <span className="mt-1 block">{t('hero.headlineLine2')}</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {t('hero.subheadline')}
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className={cn(primaryButtonClass, 'h-14 w-full sm:w-auto sm:min-w-[180px]')}
            >
              <Link href="/assessment">
                {t('hero.startAssessment')}
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={scrollToHowItWorks}
              className="h-14 w-full rounded-2xl border-border bg-card/50 sm:w-auto sm:min-w-[180px]"
            >
              {t('hero.viewPlans')}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Social proof */}
      <section className="border-y border-white/[0.06] bg-card/30 px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {SOCIAL_PROOF_KEYS.map((key, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
              className="rounded-2xl border border-border/70 bg-background/60 px-4 py-5 text-center backdrop-blur"
            >
              <p className="text-sm font-semibold tracking-tight sm:text-base">
                {t(`socialProof.${key}`)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center sm:mb-16"
          >
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {t('howItWorks.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {t('howItWorks.subtitle')}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map(({ step, icon: Icon, key }, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/70 p-8 backdrop-blur"
              >
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-[oklch(0.52_0.16_25)]/30 bg-[oklch(0.52_0.16_25)]/10 text-sm font-bold text-[oklch(0.62_0.17_25)]">
                    {step}
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background/80">
                    <Icon className="size-5 text-[oklch(0.62_0.17_25)]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {t(`howItWorks.steps.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`howItWorks.steps.${key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/[0.06] bg-card/20 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center sm:mb-16"
          >
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {t('features.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_KEYS.map(({ icon: Icon, key }, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: index * 0.05, duration: 0.45 }}
                className="group rounded-[1.5rem] border border-border/70 bg-background/60 p-6 transition-colors hover:border-[oklch(0.52_0.16_25)]/30 hover:bg-card/80"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-card/80 transition-colors group-hover:border-[oklch(0.52_0.16_25)]/25 group-hover:bg-[oklch(0.52_0.16_25)]/10">
                  <Icon className="size-5 text-[oklch(0.62_0.17_25)]" />
                </div>
                <h3 className="font-semibold tracking-tight">
                  {t(`features.items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`features.items.${key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/[0.06] bg-card/20 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {t('faq.title')}
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {FAQ_KEYS.map((key) => (
              <AccordionItem key={key} value={key} className="border-border/70">
                <AccordionTrigger className="text-left text-base hover:no-underline">
                  {t(`faq.items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(`faq.items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-border/80 bg-card/70 px-8 py-16 text-center backdrop-blur sm:px-16 sm:py-20"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(127,29,29,0.18),transparent_55%)]"
          />
          <h2 className="relative text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {t('finalCta.headline')}
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-muted-foreground">
            {t('finalCta.subheadline')}
          </p>
          <Button
            asChild
            size="lg"
            className={cn(
              'relative mt-8 h-14 min-w-[200px] rounded-2xl',
              primaryButtonClass
            )}
          >
            <Link href="/assessment">
              {t('hero.startAssessment')}
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <BrandLogo size="sm" variant="horizontal" glow="none" href="/" />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              {t('footer.terms')}
            </Link>
            <a
              href="mailto:grndnapp@gmail.com"
              className="transition-colors hover:text-foreground"
            >
              {t('footer.contact')}
            </a>
          </nav>
          <p className="text-xs text-muted-foreground">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-background/85 backdrop-blur-xl pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <div className="pointer-events-auto px-4">
          <Button
            asChild
            className={cn(primaryButtonClass, 'h-14 w-full')}
          >
            <Link href="/assessment">
              {t('hero.startAssessment')}
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
