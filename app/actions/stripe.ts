'use server'

import { headers } from 'next/headers'
import { PRODUCTS } from '../../lib/products'
import { getStripeClient } from '../../lib/stripe'

export async function createCanteenCheckout(productIds: string[]) {
  if (!productIds.length) throw new Error('Your tray is empty')

  const products = productIds.map((id) => PRODUCTS.find((product) => product.id === id)).filter(Boolean)
  if (!products.length || products.length !== productIds.length) throw new Error('Invalid order')

  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin') ?? 'http://localhost:3000'
  const suffix = Math.random().toString(36).slice(2, 10)
  const session = await getStripeClient().checkout.sessions.create({
    mode: 'payment',
    line_items: products.map((product) => ({
      price_data: {
        currency: 'inr',
        product_data: { name: product!.name, description: product!.description },
        unit_amount: product!.priceInCents,
      },
      quantity: 1,
    })),
    success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?payment=cancelled`,
    metadata: {
      source: 'campus-canteen',
      checkout_reference: suffix,
    },
  })

  if (!session.url) throw new Error('Stripe did not return a checkout URL')
  return session.url
}
