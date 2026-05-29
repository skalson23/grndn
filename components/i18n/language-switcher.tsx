'use client'

import { useLocale } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { routing, type AppLocale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type LanguageSwitcherProps = {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale
  const pathname = usePathname()

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-border/80 bg-card/60 p-0.5 backdrop-blur',
        className
      )}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          className={cn(
            'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors',
            locale === loc
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {loc}
        </Link>
      ))}
    </div>
  )
}
