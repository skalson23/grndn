'use client'

import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MobileStickyCtaProps = {
  accessGranted: boolean
  isUnlocking: boolean
  onPrimaryClick: () => void
}

export function MobileStickyCta({
  accessGranted,
  isUnlocking,
  onPrimaryClick,
}: MobileStickyCtaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.45 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 lg:hidden"
    >
      <div className="pointer-events-auto border-t border-white/8 bg-background/80 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <Button
          type="button"
          disabled={isUnlocking}
          onClick={onPrimaryClick}
          className={cn(
            'h-14 w-full rounded-2xl text-base font-semibold active:scale-[0.98]',
            'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
            'shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_16px_48px_rgba(0,0,0,0.45)]'
          )}
        >
          {accessGranted ? 'Continue to GRNDN' : 'Get beta access'}
          <ArrowRight className="size-5" />
        </Button>
      </div>
    </motion.div>
  )
}
