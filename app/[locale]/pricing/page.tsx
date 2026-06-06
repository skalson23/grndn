import { PricingPage } from '@/components/billing/pricing-page'

type PageProps = {
  searchParams: Promise<{ reason?: string }>
}

export default async function PricingRoute({ searchParams }: PageProps) {
  const params = await searchParams
  return <PricingPage reason={params.reason ?? null} />
}
