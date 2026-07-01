'use client'

import { useCallback, useState, type FormEvent } from 'react'
import { KeyRound, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { writePendingCheckout } from '@/lib/assessment/checkout-pending-storage'
import { writeAuthReturnPath } from '@/lib/auth/auth-return-path'
import type { StripeBillingPlan } from '@/lib/billing/types'
import { signInWithPassword, signUpWithPassword } from '@/lib/auth/password-auth'
import { sendCheckoutMagicLink } from '@/lib/auth/send-checkout-magic-link'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type CheckoutAuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: StripeBillingPlan | null
  locale: string
  onAuthenticated: () => void | Promise<void>
}

type PasswordMode = 'signin' | 'signup'

export function CheckoutAuthModal({
  open,
  onOpenChange,
  plan,
  locale,
  onAuthenticated,
}: CheckoutAuthModalProps) {
  const t = useTranslations('billing.checkoutAuth')
  const tActions = useTranslations('actions')
  const tCommon = useTranslations('common')
  const tAuth = useTranslations('auth')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('signup')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const planLabel =
    plan === 'quarterly' ? t('planQuarterly') : plan === 'monthly' ? t('planMonthly') : ''

  const resetForm = () => {
    setMagicLinkSent(false)
    setPassword('')
    setConfirmPassword('')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm()
    onOpenChange(next)
  }

  const handleMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!plan) return

    if (!isSupabaseConfigured()) {
      toast.error(tAuth('notConfigured'))
      return
    }

    setIsSubmitting(true)
    try {
      writePendingCheckout({ plan, locale })
      writeAuthReturnPath(`/${locale}/assessment`)
      await sendCheckoutMagicLink(email, plan, locale)
      setMagicLinkSent(true)
      toast.success(tAuth('magicLinkSent'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('magicLinkFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!plan) return

    if (!isSupabaseConfigured()) {
      toast.error(tAuth('notConfigured'))
      return
    }

    if (passwordMode === 'signup' && password !== confirmPassword) {
      toast.error(t('passwordMismatch'))
      return
    }

    if (password.length < 8) {
      toast.error(t('passwordTooShort'))
      return
    }

    setIsSubmitting(true)
    try {
      writePendingCheckout({ plan, locale })
      writeAuthReturnPath(`/${locale}/assessment`)

      if (passwordMode === 'signup') {
        await signUpWithPassword(email, password)
      } else {
        await signInWithPassword(email, password)
      }

      resetForm()
      onOpenChange(false)
      await onAuthenticated()
    } catch (error) {
      if (error instanceof Error && error.message === 'confirm_email') {
        toast.message(t('confirmEmailTitle'), { description: t('confirmEmailDescription') })
        return
      }
      toast.error(error instanceof Error ? error.message : t('authFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchPasswordMode = useCallback((mode: PasswordMode) => {
    setPasswordMode(mode)
    setPassword('')
    setConfirmPassword('')
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl border-border bg-card p-6 text-foreground shadow-2xl sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-foreground text-background">
            <LockKeyhole className="size-5" />
          </div>
          <DialogTitle className="text-2xl tracking-tight">{t('title')}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {t('description', { plan: planLabel })}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="magic" className="mt-2">
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-2xl bg-secondary/80 p-1">
            <TabsTrigger value="magic" className="rounded-xl text-sm">
              <Mail className="mr-1.5 size-3.5" />
              {t('tabMagicLink')}
            </TabsTrigger>
            <TabsTrigger value="password" className="rounded-xl text-sm">
              <KeyRound className="mr-1.5 size-3.5" />
              {t('tabPassword')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="magic" className="mt-4 space-y-4">
            {magicLinkSent ? (
              <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                <p className="text-sm font-medium">{tAuth('check_inbox')}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t('magicLinkInbox')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
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
                  disabled={isSubmitting || email.trim().length === 0 || !plan}
                  className="h-12 w-full rounded-2xl font-semibold"
                >
                  {isSubmitting ? (
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
          </TabsContent>

          <TabsContent value="password" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={passwordMode === 'signup' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 rounded-xl"
                onClick={() => switchPasswordMode('signup')}
              >
                {t('createAccount')}
              </Button>
              <Button
                type="button"
                variant={passwordMode === 'signin' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 rounded-xl"
                onClick={() => switchPasswordMode('signin')}
              >
                {t('signIn')}
              </Button>
            </div>

            <form onSubmit={handlePasswordAuth} className="space-y-3">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={tCommon('emailPlaceholder')}
                  className="h-12 rounded-2xl border-border bg-background/70 pl-10"
                />
              </div>
              <Input
                type="password"
                autoComplete={passwordMode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="h-12 rounded-2xl border-border bg-background/70"
              />
              {passwordMode === 'signup' && (
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="h-12 rounded-2xl border-border bg-background/70"
                />
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !plan}
                className={cn(
                  'h-12 w-full rounded-2xl font-semibold',
                  'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
                  'border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)]'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" />
                    {t('continuing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    {t('continueToCheckout')}
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
