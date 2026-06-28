'use client'

import { SaasLanding } from '@/components/landing/saas-landing'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background pb-24 text-foreground lg:pb-0">
      <SaasLanding />
    </main>
  )
}
