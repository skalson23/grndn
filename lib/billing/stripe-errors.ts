import Stripe from 'stripe'

export type StripeErrorDetails = {
  type?: string
  code?: string
  param?: string
  statusCode?: number
  message: string
}

export function getStripeErrorDetails(error: unknown): StripeErrorDetails {
  if (error instanceof Stripe.errors.StripeError) {
    return {
      type: error.type,
      code: error.code,
      param: error.param ?? undefined,
      statusCode: error.statusCode,
      message: error.message,
    }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: String(error) }
}

export function logStripeError(context: string, error: unknown): StripeErrorDetails {
  const details = getStripeErrorDetails(error)

  if (process.env.NODE_ENV === 'development') {
    console.error(`[GRNDN ${context}]`, details)
  } else {
    console.error(`[GRNDN ${context}]`, details.message, details.type ?? '', details.code ?? '')
  }

  return details
}

export function stripeErrorStatusCode(error: unknown, fallback = 500): number {
  if (error instanceof Stripe.errors.StripeError && error.statusCode) {
    return error.statusCode
  }
  return fallback
}
