/** Premium dark palette aligned with app/globals.css */
export const pdfColors = {
  background: '#0a0a0a',
  surface: '#141414',
  surfaceElevated: '#1c1c1c',
  border: '#2e2e2e',
  foreground: '#fafafa',
  muted: '#a3a3a3',
  accent: '#991b1b',
  accentMuted: 'rgba(127, 29, 29, 0.18)',
  destructive: '#f87171',
} as const

export const pdfSpacing = {
  pagePadding: 32,
  sectionGap: 20,
  cardPadding: 14,
} as const

/** Narrow portrait — readable on phones when opened in mobile viewers (points) */
export const PDF_PAGE_SIZE: [number, number] = [390, 844]
