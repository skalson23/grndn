'use client'

import { useTranslations } from 'next-intl'

import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

type LegalPageProps = {
  page: 'privacy' | 'terms'
}

export function LegalPage({ page }: LegalPageProps) {
  const t = useTranslations('landing.legal')

  return (
    <div className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl">
        <BrandLogo size="nav" variant="horizontal" glow="soft" className="mb-10" />
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">
          {page === 'privacy' ? t('privacyTitle') : t('termsTitle')}
        </h1>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          {page === 'privacy' ? t('privacyBody') : t('termsBody')}
        </p>
        <Button variant="outline" className="mt-10 rounded-2xl" asChild>
          <Link href="/">{t('backHome')}</Link>
        </Button>
      </div>
    </div>
  )
}
