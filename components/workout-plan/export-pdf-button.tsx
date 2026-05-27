'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { toast } from 'sonner'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { downloadWorkoutPlanPdf } from '@/lib/pdf/download-workout-plan-pdf'
import type { WorkoutPlan } from '@/lib/workout-plan/schema'
import { cn } from '@/lib/utils'

type ExportPdfButtonProps = {
  plan: WorkoutPlan
  profile?: OnboardingData | null
  className?: string
}

export function ExportPdfButton({ plan, profile, className }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadWorkoutPlanPdf(plan, profile)
      toast.success('PDF downloaded')
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Could not export PDF. Please try again.'
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isExporting}
      onClick={handleExport}
      className={cn(
        'w-full sm:w-auto h-11 rounded-2xl border-border bg-card/80',
        'hover:bg-secondary/80 hover:border-muted-foreground/40',
        'gap-2 font-medium',
        className
      )}
    >
      {isExporting ? (
        <>
          <Spinner className="size-4" />
          Exporting…
        </>
      ) : (
        <>
          <FileDown className="size-4 shrink-0" />
          Export PDF
        </>
      )}
    </Button>
  )
}
