'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { useOnboarding } from '../onboarding-context'

const MIN = 120
const MAX = 230

function formatHeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function isDecimalDraft(value: string): boolean {
  return value === '' || /^\d{0,3}(\.\d?)?$/.test(value)
}

function parseHeight(value: string): number | null {
  if (value === '' || value.endsWith('.')) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (n < MIN || n > MAX) return null
  return Number.isInteger(n * 2) ? n : null
}

export function HeightScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const t = useTranslations('onboarding.height')
  const tCommon = useTranslations('common')
  const value = data.heightCm
  const [draft, setDraft] = useState(() => formatHeight(value))

  useEffect(() => {
    setDraft(formatHeight(value))
  }, [value])

  const parsedHeight = useMemo(() => parseHeight(draft), [draft])
  const valid = parsedHeight != null

  const commitHeight = () => {
    if (parsedHeight == null) {
      setDraft(formatHeight(value))
      return null
    }

    updateData({ heightCm: parsedHeight })
    setDraft(formatHeight(parsedHeight))
    return parsedHeight
  }

  return (
    <div className="flex-1 flex flex-col p-6 pb-10 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{tCommon('back')}</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Ruler className="w-5 h-5 text-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex-1 flex flex-col justify-center py-8 max-w-sm mx-auto w-full"
      >
        <label className="text-sm font-medium text-muted-foreground mb-2">
          {t('label')}
        </label>
        <Input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft}
          onChange={(e) => {
            const raw = e.target.value
            if (isDecimalDraft(raw)) {
              setDraft(raw)
            }
          }}
          onBlur={() => {
            commitHeight()
          }}
          className="h-14 text-2xl font-semibold rounded-2xl bg-card border-border tabular-nums"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {t('hint', { min: MIN, max: MAX })}
        </p>
      </motion.div>

      <div className="flex-shrink-0 pt-4">
        <Button
          type="button"
          onClick={() => {
            if (commitHeight() != null) goNext()
          }}
          disabled={!valid}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl disabled:opacity-30"
        >
          {tCommon('continue')}
        </Button>
      </div>
    </div>
  )
}
