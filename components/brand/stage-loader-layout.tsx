'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

const stepEase = [0.32, 0.72, 0, 1] as const

type StageLoaderLayoutProps = {
  progressBar?: ReactNode
  logo: ReactNode
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function StageLoaderLayout({
  progressBar,
  logo,
  title,
  children,
  footer,
}: StageLoaderLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.52_0.16_25)] opacity-[0.12] blur-[120px]" />
        <motion.div
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08] bg-foreground/[0.02] shadow-[0_0_140px_rgba(127,29,29,0.22)]"
          animate={{ scale: [1, 1.05, 1], opacity: [0.45, 0.78, 0.45] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {progressBar ? (
        <div className="relative z-10 w-full shrink-0 bg-background/95 backdrop-blur-sm">
          {progressBar}
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center px-6 py-8 sm:py-10">
          <div className="flex w-full flex-col items-center gap-8 sm:gap-10">
            <div className="flex w-full justify-center">{logo}</div>
            {title ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: stepEase }}
                className="w-full text-center"
              >
                {title}
              </motion.div>
            ) : null}
            <div className="w-full">{children}</div>
          </div>
        </div>
      </div>

      {footer}
    </motion.div>
  )
}
