'use client'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import {
  BRAND_HORIZONTAL_SRC,
  BRAND_MARK_SRC,
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_WORDMARK_SRC,
} from '@/lib/brand'

type BrandLogoGlow = 'none' | 'soft' | 'hero' | 'cinematic'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'nav' | 'stage' | 'display'
  showTagline?: boolean
  className?: string
  variant?: 'mark' | 'logotype' | 'horizontal'
  glow?: BrandLogoGlow
}

const sizeMap = {
  sm: {
    mark: 'size-12 rounded-lg',
    img: 'size-12',
    wordmark: 'h-8 w-auto max-w-[11rem]',
    horizontal: 'h-10 w-auto max-w-[14rem]',
    tag: 'text-[9px]',
  },
  md: {
    mark: 'size-16 rounded-xl',
    img: 'size-16',
    wordmark: 'h-12 w-auto max-w-[16rem]',
    horizontal: 'h-12 w-auto max-w-[19rem]',
    tag: 'text-[10px]',
  },
  nav: {
    mark: 'size-[3.25rem] rounded-xl',
    img: 'size-[3.25rem]',
    wordmark: 'h-[4.25rem] w-auto max-w-[18rem]',
    horizontal: 'h-[4.25rem] w-auto max-w-[22rem] sm:h-[4.75rem] sm:max-w-[26rem]',
    tag: 'text-[10px]',
  },
  lg: {
    mark: 'size-20 rounded-2xl',
    img: 'size-20',
    wordmark: 'h-16 w-auto max-w-[21rem]',
    horizontal: 'h-16 w-auto max-w-[24rem]',
    tag: 'text-xs',
  },
  hero: {
    mark: 'size-32 rounded-[1.35rem]',
    img: 'size-32',
    wordmark: 'h-[5.5rem] w-auto max-w-[29rem] sm:h-24 sm:max-w-[35rem]',
    horizontal: 'h-[5.5rem] w-auto max-w-[32rem] sm:h-[7.25rem] sm:max-w-[45rem]',
    tag: 'text-xs',
  },
  stage: {
    mark: 'size-40 rounded-[1.5rem] sm:size-44',
    img: 'size-40 sm:size-44',
    wordmark:
      'h-[11rem] w-auto max-w-[min(92vw,38rem)] sm:h-[13rem] sm:max-w-[44rem]',
    horizontal:
      'h-[11rem] w-auto max-w-[min(92vw,40rem)] sm:h-[13rem] sm:max-w-[48rem]',
    tag: 'text-xs',
  },
  display: {
    mark: 'size-44 rounded-[1.65rem] sm:size-52',
    img: 'size-44 sm:size-52',
    wordmark:
      'h-[10rem] w-auto max-w-[min(94vw,36rem)] sm:h-[13rem] sm:max-w-[48rem] lg:h-[16rem] lg:max-w-[56rem]',
    horizontal:
      'h-[10rem] w-auto max-w-[min(94vw,38rem)] sm:h-[13rem] sm:max-w-[50rem] lg:h-[16rem] lg:max-w-[58rem]',
    tag: 'text-xs',
  },
} as const

const glowMap: Record<
  Exclude<BrandLogoGlow, 'none'>,
  { primary: string; secondary?: string }
> = {
  soft: {
    primary:
      'absolute left-1/2 top-1/2 h-[85%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.07] blur-3xl',
  },
  hero: {
    primary:
      'absolute left-1/2 top-1/2 h-[120%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.52_0.16_25)]/25 blur-[72px] sm:blur-[88px]',
    secondary:
      'absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[48px]',
  },
  cinematic: {
    primary:
      'absolute left-1/2 top-[58%] h-[130%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.52_0.16_25)]/18 blur-[96px] sm:blur-[110px]',
    secondary:
      'absolute left-1/2 top-1/2 h-[55%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08] bg-white/[0.02] shadow-[0_0_120px_rgba(127,29,29,0.16)] blur-[2px]',
  },
}

const imageGlowClass =
  'drop-shadow-[0_0_28px_rgba(127,29,29,0.22)] brightness-[1.03] contrast-[1.04]'

export function BrandLogo({
  size = 'md',
  showTagline = false,
  className,
  variant = 'logotype',
  glow = 'none',
}: BrandLogoProps) {
  const s = sizeMap[size]
  const isMark = variant === 'mark'
  const isHorizontal = variant === 'horizontal'
  const hasGlow = glow !== 'none'
  const glowLayers = hasGlow ? glowMap[glow] : null

  const imageClass = cn(
    'block object-contain [image-rendering:auto]',
    isHorizontal || !isMark ? imageGlowClass : '',
    isHorizontal ? cn('object-left', s.horizontal) : isMark ? s.img : s.wordmark
  )

  const logoImage = isHorizontal ? (
    <img
      src={BRAND_HORIZONTAL_SRC}
      alt={BRAND_NAME}
      className={imageClass}
      draggable={false}
    />
  ) : isMark ? (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-foreground ring-1 ring-white/10',
        'shadow-[0_0_22px_rgba(127,29,29,0.28)]',
        s.mark
      )}
      aria-hidden
    >
      <img src={BRAND_MARK_SRC} alt="" className={imageClass} draggable={false} />
    </div>
  ) : (
    <>
      <img src={BRAND_WORDMARK_SRC} alt={BRAND_NAME} className={imageClass} draggable={false} />
      {showTagline && (
        <span className={cn('uppercase tracking-widest text-muted-foreground', s.tag)}>
          {BRAND_TAGLINE}
        </span>
      )}
    </>
  )

  return (
    <motion.div
      initial={false}
      whileHover={hasGlow ? undefined : { y: -1 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        'relative flex min-w-0 flex-col',
        isMark ? 'items-center' : 'items-start',
        className
      )}
    >
      {glowLayers && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className={glowLayers.primary} />
          {glowLayers.secondary && <div className={glowLayers.secondary} />}
        </div>
      )}
      <div className={cn('relative z-[1]', isHorizontal && 'px-0.5')}>{logoImage}</div>
    </motion.div>
  )
}
