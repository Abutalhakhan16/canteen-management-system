import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient, getStripeWebhookSecret } from '../../../../lib/stripe'

export async function POST(request: Request) {
  const signature = (await headers()).get('stripe-signature')
  const secret = getStripeWebhookSecret()
  if (!signature || !secret) return NextResponse.json({ error: 'Webhook is not configured' }, { status: 400 })

  const body = await request.text()
  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(body, signature, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status === 'paid') console.log('[v0] Canteen payment confirmed:', session.id)
  }

  return NextResponse.json({ received: true })
}
