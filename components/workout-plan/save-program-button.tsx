'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, LockKeyhole, Mail, Save } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Link, useRouter } from '@/i18n/navigation'
import {
  getCurrentMagicLinkUser,
  saveProgramToAccount,
  sendMagicLink,
} from '@/lib/programs/saved-programs'
import { logSaveFlow, logSaveFlowError, logSaveFlowWarn } from '@/lib/programs/save-flow-log'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { writePendingProgramSave } from '@/lib/workout-plan/pending-save-storage'
import type { WorkoutPlan } from '@/lib/workout-plan/schema'
import { cn } from '@/lib/utils'

type SaveProgramButtonProps = {
  plan: WorkoutPlan
  profile?: OnboardingData | null
  className?: string
}

export function SaveProgramButton({
  plan,
  profile,
  className,
}: SaveProgramButtonProps) {
  const router = useRouter()
  const locale = useLocale()
  const tActions = useTranslations('actions')
  const tAuth = useTranslations('auth')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingLink, setIsSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null)
  const didAutoSave = useRef(false)

  const saveProgram = async () => {
    setIsSaving(true)
    try {
      logSaveFlow('client_save_program_start')
      const saved = await saveProgramToAccount({ plan, profile })
      setSavedProgramId(saved.id)
      toast.success(tAuth('programSaved'))
      logSaveFlow('client_save_program_success', { programId: saved.id })
      return saved
    } catch (e) {
      const message =
        e instanceof Error ? e.message : tErrors('saveProgram')
      logSaveFlowError('client_save_program_failed', { message })
      toast.error(message)
      throw e
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('save') !== '1' || didAutoSave.current) return

    didAutoSave.current = true
    logSaveFlow('client_auto_save_triggered')

    void (async () => {
      let user = await getCurrentMagicLinkUser()
      if (!user) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        user = await getCurrentMagicLinkUser()
      }

      if (!user) {
        logSaveFlowWarn('client_auto_save_no_session')
      }

      try {
        await saveProgram()
        router.replace('/results', { scroll: false })
      } catch {
        setOpen(true)
      }
    })()
  }, [router])

  const handleSaveClick = async () => {
    if (!isSupabaseConfigured()) {
      toast.error(tAuth('notConfigured'))
      return
    }

    setIsSaving(true)
    try {
      const user = await getCurrentMagicLinkUser()
      if (user) {
        try {
          await saveProgram()
        } catch {
          // saveProgram already surfaced the error with a toast.
        }
        return
      }
      setOpen(true)
    } catch {
      setOpen(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSendingLink(true)
    try {
      writePendingProgramSave(plan, profile)
      logSaveFlow('client_pending_save_written_browser')

      await sendMagicLink(email.trim(), {
        next: `/${locale}/results`,
        saveCurrentProgram: true,
        plan,
        profile,
      })
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

  return (
    <>
      <Button
        type="button"
        disabled={isSaving || Boolean(savedProgramId)}
        onClick={handleSaveClick}
        className={cn(
          'h-11 w-full rounded-2xl border border-white/15 bg-foreground text-background',
          'font-semibold shadow-[0_12px_40px_rgba(0,0,0,0.35)] hover:bg-foreground/90 sm:w-auto',
          className
        )}
      >
        {isSaving ? (
          <>
            <Spinner className="size-4" />
            {tActions('saving')}
          </>
        ) : savedProgramId ? (
          <>
            <Check className="size-4" />
            {tActions('saved')}
          </>
        ) : (
          <>
            <Save className="size-4" />
            {tActions('save_program')}
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-border bg-card p-6 text-foreground shadow-2xl sm:max-w-md">
          <DialogHeader className="text-left">
            <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-foreground text-background">
              <LockKeyhole className="size-5" />
            </div>
            <DialogTitle className="text-2xl tracking-tight">
              {tAuth('save_title')}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {tAuth('save_description')}
            </DialogDescription>
          </DialogHeader>

          {linkSent ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                <p className="text-sm font-medium">{tAuth('check_inbox')}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {tAuth('magic_link_sent')}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-2xl border-border bg-background/60"
                asChild
              >
                <Link href="/my-programs">{tActions('go_to_my_programs')}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendLink} className="space-y-4">
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
        </DialogContent>
      </Dialog>
    </>
  )
}
