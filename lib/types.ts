export type ItemCategory = 'All items' | 'Breakfast' | 'Quick bites' | 'Meals' | 'Beverages' | 'Desserts'

export interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  time: string
  image: string
  tag?: string
  description: string
  soldOut?: boolean
  counter?: string
}

export interface CartItem {
  id: number
  quantity: number
  item: MenuItem
}

export type PaymentCategory = 'online' | 'offline'

export type PaymentMethod = 
  | 'upi_qr'
  | 'upi_app'
  | 'upi_id'
  | 'card_gateway'
  | 'stripe'
  | 'offline_cash'
  | 'campus_wallet'

export type PaymentStatus = 'paid' | 'pending_cash' | 'failed'

export type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'ready' | 'completed'

export interface OrderToken {
  id: string
  tokenNumber: string // e.g. "TK-101"
  customerName: string
  customerRoll: string
  items: {
    id: number
    name: string
    quantity: number
    price: number
  }[]
  totalAmount: number
  paymentCategory: PaymentCategory
  paymentMethod: PaymentMethod
  paymentMethodName: string
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  createdAt: string
  estimatedReadyTime: string
  pickupCounter: string
  notes?: string
  transactionId?: string
}

export interface UpiSettings {
  upiId: string
  payeeName: string
  customQrImageUrl?: string
  useCustomImage: boolean
}
