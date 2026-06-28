'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export default function BillingCancelPage() {
  const t = useTranslations('billing.cancel')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-md flex-col items-center text-center"
      >
        <BrandLogo size="md" glow="soft" className="mb-8 items-center" />
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('description')}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/">{t('backHome')}</Link>
          </Button>
          <Button asChild className="rounded-2xl">
            <Link href="/assessment">{t('tryAgain')}</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
