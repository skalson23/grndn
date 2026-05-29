'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  ChevronLeft,
  Dumbbell,
  FileText,
  LockKeyhole,
  Mail,
  Play,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { BrandLogo } from '@/components/brand/brand-logo'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { Link, useRouter } from '@/i18n/navigation'
import {
  getCurrentMagicLinkUser,
  listSavedPrograms,
  sendMagicLink,
  type SavedProgram,
} from '@/lib/programs/saved-programs'
import type { TrainingStyleId } from '@/lib/onboarding/training-style'
import { WORKOUT_PLAN_STORAGE_KEY } from '@/lib/workout-plan/storage'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export default function MyProgramsPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('programs')
  const tAuth = useTranslations('auth')
  const tActions = useTranslations('actions')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const tNav = useTranslations('nav')
  const { trainingStyleLabel } = useOnboardingLabels()

  const [programs, setPrograms] = useState<SavedProgram[]>([])
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingLink, setIsSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    let alive = true

    async function loadPrograms() {
      try {
        const user = await getCurrentMagicLinkUser()
        if (!alive) return

        setIsAuthed(Boolean(user))
        if (!user) {
          return
        }

        const saved = await listSavedPrograms()
        if (!alive) return
        setPrograms(saved)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : tErrors('loadPrograms')
        toast.error(message)
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    void loadPrograms()

    return () => {
      alive = false
    }
  }, [tErrors])

  const totalSessions = useMemo(
    () => programs.reduce((sum, program) => sum + program.session_count, 0),
    [programs]
  )

  const handleSendLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSendingLink(true)
    try {
      await sendMagicLink(email.trim(), { next: `/${locale}/my-programs` })
      setLinkSent(true)
      toast.success(tAuth('magicLinkSent'))
    } catch (e) {
      const message =
        e instanceof Error ? e.message : tErrors('sendMagicLink')
      toast.error(message)
    } finally {
      setIsSendingLink(false)
    }
  }

  const openProgram = (program: SavedProgram) => {
    sessionStorage.setItem(
      WORKOUT_PLAN_STORAGE_KEY,
      JSON.stringify({ plan: program.plan, profile: program.profile })
    )
    router.push('/results')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-background pb-20 text-foreground"
    >
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 pl-5 pr-4 py-4 sm:gap-4">
          <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" asChild>
            <Link href="/results" aria-label={tNav('backToResults')}>
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
          <BrandLogo
            size="nav"
            variant="horizontal"
            glow="soft"
            className="shrink-0 items-center"
          />
          <div className="min-w-0 flex-1 pl-0.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t('account')}
            </p>
            <h1 className="truncate text-base font-semibold leading-tight tracking-tight sm:text-lg">
              {t('title')}
            </h1>
          </div>
          <LanguageSwitcher className="shrink-0" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-8">
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-3xl border border-border bg-card/80 p-5 sm:p-6"
        >
          <div className="flex justify-center sm:justify-start">
            <BrandLogo size="md" variant="horizontal" glow="soft" className="items-center sm:items-start" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight">
            {t('libraryTitle')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t('libraryDescription')}
          </p>

          {isAuthed && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                <p className="text-2xl font-semibold">{programs.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('programsStat')}</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                <p className="text-2xl font-semibold">{totalSessions}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('sessionsStat')}</p>
              </div>
            </div>
          )}
        </motion.section>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-border bg-card/60 p-8 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            {t('loading')}
          </div>
        ) : !isAuthed ? (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.08 }}
            className="rounded-3xl border border-border bg-card/80 p-5 sm:p-6"
          >
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-foreground text-background">
              <LockKeyhole className="size-5" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t('signInTitle')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('signInDescription')}
            </p>

            {linkSent ? (
              <div className="mt-5 rounded-2xl border border-border bg-secondary/50 p-4">
                <p className="text-sm font-medium">{tAuth('check_inbox')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('checkInboxDescription')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendLink} className="mt-5 space-y-3">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={tCommon('emailPlaceholder')}
                    className="h-12 rounded-2xl border-border bg-background/70 pl-10"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSendingLink || email.trim().length === 0}
                  className="h-12 w-full rounded-2xl font-semibold"
                >
                  {isSendingLink ? (
                    <>
                      <Spinner className="size-4" />
                      {tActions('sending')}
                    </>
                  ) : (
                    tActions('send_magic_link')
                  )}
                </Button>
              </form>
            )}
          </motion.section>
        ) : programs.length === 0 ? (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.08 }}
            className="rounded-3xl border border-border bg-card/70 p-8 text-center"
          >
            <Dumbbell className="mx-auto mb-4 size-8 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{t('emptyTitle')}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t('emptyDescription')}
            </p>
            <Button asChild className="mt-5 rounded-2xl">
              <Link href="/">{tActions('create_program')}</Link>
            </Button>
          </motion.section>
        ) : (
          <section className="flex flex-col gap-4">
            {programs.map((program, index) => (
              <motion.article
                key={program.id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.08 + index * 0.04 }}
                className="rounded-3xl border border-border bg-card/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[oklch(0.52_0.16_25)]">
                      {t('savedProgram')}
                    </p>
                    <h2 className="text-lg font-semibold leading-snug tracking-tight">
                      {program.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {program.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                    <CalendarDays className="size-3" />
                    {formatDate(program.created_at, locale)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                    <Dumbbell className="size-3" />
                    {t('sessionsCount', { count: program.session_count })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                    <FileText className="size-3" />
                    {program.pdf_metadata.fileName}
                  </span>
                  {program.training_style && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                      {trainingStyleLabel(
                        program.training_style as TrainingStyleId
                      )}
                    </span>
                  )}
                  {program.emphasis.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                      {program.emphasis.slice(0, 2).join(' + ')}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => openProgram(program)}
                  className="mt-5 h-11 w-full rounded-2xl font-semibold"
                >
                  <Play className="size-4" />
                  {tActions('open_program')}
                </Button>
              </motion.article>
            ))}
          </section>
        )}
      </main>
    </motion.div>
  )
}
