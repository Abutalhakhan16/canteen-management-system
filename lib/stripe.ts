import 'server-only'

import Stripe from 'stripe'

export function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured')
  return secretKey
}

export function getStripeClient() {
  return new Stripe(getStripeSecretKey())
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? ''
}

