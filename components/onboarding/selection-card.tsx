'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectionCardProps {
  icon: React.ReactNode
  title: string
  description?: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function SelectionCard({
  icon,
  title,
  description,
  selected,
  onClick,
  className,
}: SelectionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-full p-5 rounded-2xl border-2 text-left transition-all duration-300',
        'bg-card/90 shadow-[0_18px_70px_rgba(0,0,0,0.12)] hover:bg-secondary/50',
        selected
          ? 'border-[oklch(0.52_0.16_25)] bg-[oklch(0.52_0.16_25)]/10 shadow-[0_0_45px_rgba(127,29,29,0.16)]'
          : 'border-border hover:border-[oklch(0.52_0.16_25)]/35',
        className
      )}
    >
      {/* Selection indicator */}
      <motion.div
        initial={false}
        animate={{
          scale: selected ? 1 : 0,
          opacity: selected ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[oklch(0.52_0.16_25)] flex items-center justify-center shadow-[0_0_18px_rgba(127,29,29,0.45)]"
      >
        <Check className="w-4 h-4 text-background" />
      </motion.div>

      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300',
            selected
              ? 'bg-[oklch(0.52_0.16_25)] text-foreground shadow-[0_0_22px_rgba(127,29,29,0.26)]'
              : 'bg-secondary text-foreground'
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  )
}
