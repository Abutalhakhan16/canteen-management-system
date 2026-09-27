export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  { id: 'masala-dosa', name: 'Masala Dosa', description: 'Crisp dosa, potato masala, coconut chutney', priceInCents: 5500 },
  { id: 'paneer-kathi-roll', name: 'Paneer Kathi Roll', description: 'Tandoori paneer, mint chutney, flaky paratha', priceInCents: 8500 },
  { id: 'south-indian-thali', name: 'South Indian Thali', description: 'Rice, dal, two sabzis, curd, sweet', priceInCents: 12000 },
  { id: 'filter-coffee', name: 'Filter Coffee', description: 'Strong, smooth, freshly brewed', priceInCents: 3000 },
  { id: 'samosa-chaat', name: 'Samosa Chaat', description: 'Two samosas, yogurt, chutneys, sev', priceInCents: 4500 },
  { id: 'veg-hakka-noodles', name: 'Veg Hakka Noodles', description: 'Wok-tossed noodles, greens, sesame', priceInCents: 9500 },
  { id: 'maggi-masala', name: 'Maggi Masala', description: 'The campus classic, extra masala', priceInCents: 5000 },
  { id: 'fresh-lime-soda', name: 'Fresh Lime Soda', description: 'Chilled, fizzy, sweet or salty', priceInCents: 3500 },
]
