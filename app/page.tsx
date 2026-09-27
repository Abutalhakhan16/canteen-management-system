'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Store,
  ShoppingBag,
  Bell,
  Search,
  Sparkles,
  Clock,
  Check,
  Plus,
  Minus,
  Trash2,
  X,
  ArrowRight,
  UserRound,
  ShieldCheck,
  WalletCards,
  Ticket,
  ChevronDown,
  LockKeyhole,
  LogIn,
  Mail,
  Zap,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Smartphone,
  CreditCard,
  Printer,
  RefreshCw,
  LogOut,
} from 'lucide-react'

import { MenuItem, CartItem, OrderToken, OrderStatus, PaymentCategory, PaymentMethod, PaymentStatus, UpiSettings } from '../lib/types'
import { INITIAL_MENU_ITEMS, CATEGORIES, INITIAL_ORDERS, DEFAULT_UPI_SETTINGS } from '../lib/data'
import { PaymentGatewayModal } from '../components/PaymentGatewayModal'
import { TokenSlipModal } from '../components/TokenSlipModal'
import { AdminDashboard } from '../components/AdminDashboard'
import { AuthPortal, CustomerUser } from '../components/AuthPortal'

export type CurrentUser =
  | { role: 'customer'; name: string; phone: string }
  | { role: 'admin'; email: string }
  | null

export default function CanteenApp() {
  // Authentication session state: null displays the 2-option login gateway
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null)
  
  // Customer navigation tab: 'menu' | 'orders' | 'wallet'
  const [customerTab, setCustomerTab] = useState<'menu' | 'orders' | 'wallet'>('menu')
  
  // Data states (with initial fallbacks)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS)
  const [orders, setOrders] = useState<OrderToken[]>(INITIAL_ORDERS)
  const [upiSettings, setUpiSettings] = useState<UpiSettings>(DEFAULT_UPI_SETTINGS)
  
  // Customer info
  const [customerName, setCustomerName] = useState('Arjun Mehta')
  const [customerRoll, setCustomerRoll] = useState('9876543210')
  const [walletBalance, setWalletBalance] = useState(420.5)

  // Canteen global operational states
  const [rushMode, setRushMode] = useState(false)
  
  // Cart state: Map of itemId -> CartItem
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, quantity: 1, item: INITIAL_MENU_ITEMS[0] },
    { id: 4, quantity: 2, item: INITIAL_MENU_ITEMS[3] },
  ])
  const [isTrayOpen, setIsTrayOpen] = useState(false)

  // Search & category filter in customer menu
  const [activeCategory, setActiveCategory] = useState<string>('All items')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [activeTokenModal, setActiveTokenModal] = useState<OrderToken | null>(null)
  const [topUpAmount, setTopUpAmount] = useState<number | null>(null)
  const [topUpSuccess, setTopUpSuccess] = useState('')

  // Load persisted state from localStorage on client mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('canteen_orders_v2')
      if (savedOrders) setOrders(JSON.parse(savedOrders))

      const savedMenu = localStorage.getItem('canteen_menu_v2')
      if (savedMenu) setMenuItems(JSON.parse(savedMenu))

      const savedWallet = localStorage.getItem('canteen_wallet_v2')
      if (savedWallet) setWalletBalance(parseFloat(savedWallet))

      const savedUpi = localStorage.getItem('canteen_upi_settings_v2')
      if (savedUpi) setUpiSettings(JSON.parse(savedUpi))

      const savedSession = sessionStorage.getItem('canteen_session_user_v2')
      if (savedSession) {
        const parsed = JSON.parse(savedSession)
        setCurrentUser(parsed)
        if (parsed.role === 'customer') {
          setCustomerName(parsed.name)
          setCustomerRoll(parsed.phone)
        }
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e)
    }
  }, [])

  // Authentication Handlers
  const handleCustomerLogin = (user: CustomerUser) => {
    const cust: CurrentUser = { role: 'customer', name: user.name, phone: user.phone }
    setCurrentUser(cust)
    setCustomerName(user.name)
    setCustomerRoll(user.phone)
    try {
      sessionStorage.setItem('canteen_session_user_v2', JSON.stringify(cust))
    } catch {}
  }

  const handleAdminLogin = () => {
    const adm: CurrentUser = { role: 'admin', email: 'admin@canteen.com' }
    setCurrentUser(adm)
    try {
      sessionStorage.setItem('canteen_session_user_v2', JSON.stringify(adm))
    } catch {}
  }

  const handleLogout = () => {
    setCurrentUser(null)
    try {
      sessionStorage.removeItem('canteen_session_user_v2')
    } catch {}
  }

  // Sync orders to localStorage
  const updateOrdersState = (newOrders: OrderToken[]) => {
    setOrders(newOrders)
    try {
      localStorage.setItem('canteen_orders_v2', JSON.stringify(newOrders))
    } catch (e) {
      console.warn('Could not save to localStorage:', e)
    }
  }

  // Sync menu to localStorage
  const updateMenuState = (newMenu: MenuItem[]) => {
    setMenuItems(newMenu)
    try {
      localStorage.setItem('canteen_menu_v2', JSON.stringify(newMenu))
    } catch (e) {
      console.warn('Could not save to localStorage:', e)
    }
  }

  // Sync wallet
  const updateWallet = (newBalance: number) => {
    setWalletBalance(newBalance)
    try {
      localStorage.setItem('canteen_wallet_v2', newBalance.toString())
    } catch (e) {
      console.warn('Could not save wallet:', e)
    }
  }

  // Sync UPI Settings to localStorage
  const updateUpiSettings = (newSettings: UpiSettings) => {
    setUpiSettings(newSettings)
    try {
      localStorage.setItem('canteen_upi_settings_v2', JSON.stringify(newSettings))
    } catch (e) {
      console.warn('Could not save upi settings:', e)
    }
  }

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
      }
      return [...prev, { id: item.id, quantity: 1, item }]
    })
  }

  const updateQuantity = (itemId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.id === itemId) {
            const nextQty = c.quantity + delta
            return nextQty > 0 ? { ...c, quantity: nextQty } : null
          }
          return c
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((c) => c.id !== itemId))
  }

  const clearCart = () => setCart([])

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0)
  }, [cart])

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = activeCategory === 'All items' || item.category === activeCategory
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [menuItems, activeCategory, searchQuery])

  // Handle Token & Order Creation when Payment completes
  const handleOrderSuccess = ({
    paymentCategory,
    paymentMethod,
    paymentMethodName,
    paymentStatus,
    transactionId,
    notes,
  }: {
    paymentCategory: PaymentCategory
    paymentMethod: PaymentMethod
    paymentMethodName: string
    paymentStatus: PaymentStatus
    transactionId?: string
    notes?: string
  }) => {
    // Generate sequential token number
    const nextTokenNum = `TK-${(orders.length + 101).toString()}`
    
    // Pick counter from first item or default
    const primaryCounter = cart[0]?.item.counter || 'Counter 1 (Main Kitchen)'

    // Calculate ready time (now + ~12 mins or +22 mins in rush)
    const prepMinutes = rushMode ? 22 : 12
    const now = new Date()
    now.setMinutes(now.getMinutes() + prepMinutes)
    const readyTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const activeCustomerName = currentUser?.role === 'customer' ? currentUser.name : customerName
    const activeCustomerPhone = currentUser?.role === 'customer' ? currentUser.phone : customerRoll

    const newOrder: OrderToken = {
      id: `ord-${Date.now()}`,
      tokenNumber: nextTokenNum,
      customerName: activeCustomerName,
      customerRoll: activeCustomerPhone,
      items: cart.map((c) => ({
        id: c.id,
        name: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
      })),
      totalAmount: cartTotal,
      paymentCategory,
      paymentMethod,
      paymentMethodName,
      paymentStatus,
      orderStatus: 'placed',
      createdAt: currentTimeStr,
      estimatedReadyTime: readyTimeStr,
      pickupCounter: primaryCounter,
      transactionId,
      notes,
    }

    // If paid via wallet, deduct
    if (paymentMethod === 'campus_wallet') {
      updateWallet(Math.max(0, walletBalance - cartTotal))
    }

    // Add order to orders
    const updated = [newOrder, ...orders]
    updateOrdersState(updated)

    // Clear cart and tray
    clearCart()
    setIsTrayOpen(false)

    // Open Token Slip Modal immediately!
    setActiveTokenModal(newOrder)
  }

  // Admin order status update
  const handleUpdateOrderStatus = (tokenId: string, nextStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === tokenId ? { ...o, orderStatus: nextStatus } : o))
    updateOrdersState(updated)
  }

  // Admin cash paid confirmation
  const handleMarkCashPaid = (tokenId: string) => {
    const updated = orders.map((o) =>
      o.id === tokenId ? { ...o, paymentStatus: 'paid' as PaymentStatus } : o
    )
    updateOrdersState(updated)
  }

  // Admin stock toggle
  const handleToggleStock = (itemId: number) => {
    const updated = menuItems.map((item) =>
      item.id === itemId ? { ...item, soldOut: !item.soldOut } : item
    )
    updateMenuState(updated)
  }

  // Admin add menu item
  const handleAddMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newId = Math.max(...menuItems.map((i) => i.id), 0) + 1
    const newItem: MenuItem = { ...itemData, id: newId }
    const updated = [newItem, ...menuItems]
    updateMenuState(updated)
  }

  // Admin delete menu item
  const handleDeleteMenuItem = (itemId: number) => {
    const updated = menuItems.filter((i) => i.id !== itemId)
    updateMenuState(updated)
  }

  // Wallet top-up handler
  const handleTopUpWallet = (amount: number) => {
    const newBal = walletBalance + amount
    updateWallet(newBal)
    setTopUpSuccess(`Successfully added ₹${amount} via Instant UPI to your Campus Wallet!`)
    setTimeout(() => setTopUpSuccess(''), 4000)
  }

  // Active user tokens
  const customerActiveTokens = orders.filter((o) => o.orderStatus !== 'completed')

  // 1. If not logged in, show initial 2-option login screen (Customer vs Admin)
  if (!currentUser) {
    return (
      <AuthPortal
        onCustomerLogin={handleCustomerLogin}
        onAdminLogin={handleAdminLogin}
      />
    )
  }

  // 2. If logged in as Admin (strictly admin@canteen.com / 1234567890)
  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        orders={orders}
        menuItems={menuItems}
        rushMode={rushMode}
        upiSettings={upiSettings}
        setRushMode={setRushMode}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onMarkCashPaid={handleMarkCashPaid}
        onToggleStock={handleToggleStock}
        onAddMenuItem={handleAddMenuItem}
        onDeleteMenuItem={handleDeleteMenuItem}
        onUpdateUpiSettings={updateUpiSettings}
        onSwitchToCustomer={() => {
          const cust: CurrentUser = { role: 'customer', name: customerName, phone: customerRoll }
          setCurrentUser(cust)
          try {
            sessionStorage.setItem('canteen_session_user_v2', JSON.stringify(cust))
          } catch {}
        }}
        onLogout={handleLogout}
      />
    )
  }

  // CUSTOMER INTERFACE
  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#23251f]">
      {/* Customer Header */}
      <header className="sticky top-0 z-30 border-b border-[#deded5] bg-[#f8f7f2]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* Logo & Canteen Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCustomerTab('menu')}
              className="flex items-center gap-3 text-left focus:outline-none"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6a117] text-[#23251f] shadow-sm">
                <Store size={22} strokeWidth={2.5} />
              </span>
              <div>
                <span className="block font-display text-2xl font-bold leading-none tracking-tight text-[#23251f]">
                  Common Ground
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[.2em] text-[#8b8d83]">
                  Campus Canteen · Customer Order
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1 sm:flex">
            {[
              { id: 'menu', label: 'Canteen Menu' },
              { id: 'orders', label: 'My Tokens & Orders', badge: customerActiveTokens.length },
              { id: 'wallet', label: 'Campus Wallet' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCustomerTab(tab.id as any)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  customerTab === tab.id
                    ? 'bg-[#f0e3c8] text-[#9b6200]'
                    : 'text-[#777970] hover:bg-[#efeee8] hover:text-[#23251f]'
                }`}
              >
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e6a117] px-1 text-[10px] font-extrabold text-[#23251f]">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Profile Pill */}
            {currentUser?.role === 'customer' && (
              <div className="hidden lg:flex items-center gap-2 rounded-xl border border-[#deded5] bg-[#fffdf7] px-3 py-1.5 text-xs">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f0e3c8] text-[#9b6200] font-bold text-[11px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <div className="text-left">
                  <p className="font-bold text-[#23251f] leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-[#8b8d83] font-mono leading-none mt-0.5">{currentUser.phone}</p>
                </div>
              </div>
            )}

            {/* Switch to Admin Mode Button */}
            <button
              onClick={() => {
                const adm: CurrentUser = { role: 'admin', email: 'admin@canteen.com' }
                setCurrentUser(adm)
                try {
                  sessionStorage.setItem('canteen_session_user_v2', JSON.stringify(adm))
                } catch {}
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[#deded5] bg-[#fffdf7] px-3 py-2 text-xs font-bold text-[#6a6d63] shadow-sm transition hover:border-[#23251f] hover:bg-[#23251f] hover:text-[#fffdf7]"
              title="Open Admin Console"
            >
              <ShieldCheck size={16} className="text-[#e6a117]" />
              <span className="hidden md:inline">Admin Interface</span>
              <span className="md:hidden">Admin</span>
            </button>

            {/* Tray / Cart Toggle Button */}
            <button
              onClick={() => setIsTrayOpen(true)}
              className="relative flex h-10 items-center gap-2 rounded-xl bg-[#23251f] px-3.5 sm:px-4 text-xs font-bold text-[#fffdf7] shadow-sm transition hover:bg-[#3d4037]"
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Your Tray</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e6a117] px-1 text-[11px] font-black text-[#23251f]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
              title="Log out of Canteen"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex border-t border-[#deded5] px-4 py-2 sm:hidden">
          {[
            { id: 'menu', label: 'Menu' },
            { id: 'orders', label: `My Tokens (${customerActiveTokens.length})` },
            { id: 'wallet', label: 'Wallet' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCustomerTab(tab.id as any)}
              className={`flex-1 py-1 text-center text-xs font-bold ${
                customerTab === tab.id ? 'text-[#c17e00] border-b-2 border-[#e6a117]' : 'text-[#8b8d83]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
        {/* CUSTOMER TAB 1: MENU & ORDER */}
        {customerTab === 'menu' && (
          <div className="space-y-8">
            {/* Hero / Banner */}
            <div className="flex flex-col justify-between gap-5 border-b border-[#deded5] pb-8 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#c17e00]">
                  <Sparkles size={14} /> Fresh & Hot Campus Meals
                </p>
                <h1 className="font-display text-5xl tracking-[-.05em] sm:text-6xl text-[#23251f]">
                  What&apos;s cooking?
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-6 text-[#797b72]">
                  Order ahead, pay online via UPI / Cards or pay cash on collection. Your pickup token is generated instantly.
                </p>
              </div>

              {/* Status Pill */}
              <div className="flex flex-wrap items-center gap-3">
                {rushMode ? (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-800">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Kitchen Rush Mode (+10 min prep)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-[#deded5] bg-[#fffdf7] px-3.5 py-2 text-xs font-semibold text-[#6f7168]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#64a66c] animate-pulse" />
                    <span>Kitchen is open · Regular prep (~12 min)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Active Token Callout if customer has active tokens */}
            {customerActiveTokens.length > 0 && (
              <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#e6a117] p-5 text-[#29271e] sm:flex-row sm:items-center sm:p-6 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#29271e] font-display text-2xl font-bold text-[#fff9e8]">
                    {customerActiveTokens[0].tokenNumber}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f4c00]">
                      Active Order in Kitchen
                    </span>
                    <h2 className="font-display text-xl">
                      Status: <strong className="uppercase">{customerActiveTokens[0].orderStatus}</strong>
                    </h2>
                    <p className="text-xs text-[#553b01]">
                      Pickup at {customerActiveTokens[0].pickupCounter} · Est: {customerActiveTokens[0].estimatedReadyTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTokenModal(customerActiveTokens[0])}
                    className="flex items-center gap-1.5 rounded-xl bg-[#29271e] px-4 py-2.5 text-xs font-bold text-[#fff9e8] hover:bg-[#3d3a2e]"
                  >
                    <span>View Token Slip</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setCustomerTab('orders')}
                    className="rounded-xl border border-[#29271e]/30 bg-[#fff9e8]/60 px-3.5 py-2.5 text-xs font-bold text-[#29271e] hover:bg-[#fff9e8]"
                  >
                    All Orders ({customerActiveTokens.length})
                  </button>
                </div>
              </div>
            )}

            {/* Category Filter & Search Bar */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex gap-1 overflow-x-auto pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition ${
                      activeCategory === cat
                        ? 'bg-[#23251f] text-[#fffdf7]'
                        : 'bg-[#fffdf7] text-[#797b72] hover:bg-[#ecebe4] hover:text-[#23251f] border border-[#deded5]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-[#9a9b91]" />
                <input
                  type="text"
                  placeholder="Search canteen menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#deded5] bg-[#fffdf7] pl-9 pr-3 text-xs text-[#23251f] outline-none placeholder:text-[#9a9b91] focus:border-[#e6a117] focus:ring-1 focus:ring-[#e6a117] sm:w-64"
                />
              </div>
            </div>

            {/* Menu Cards Grid */}
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMenuItems.map((item) => {
                const cartEntry = cart.find((c) => c.id === item.id)
                const inCart = Boolean(cartEntry)
                const isOutOfStock = item.soldOut

                return (
                  <article
                    key={item.id}
                    className={`group flex flex-col justify-between rounded-3xl border border-[#deded5] bg-[#fffdf7] p-4 transition-all hover:border-[#cfcfc4] hover:shadow-lg ${
                      isOutOfStock ? 'opacity-70' : ''
                    }`}
                  >
                    <div>
                      {/* Image container */}
                      <div className="relative mb-4 aspect-[1.25] overflow-hidden rounded-2xl bg-[#e5e3d9]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                            isOutOfStock ? 'grayscale' : ''
                          }`}
                        />
                        <div className="absolute inset-x-3 top-3 flex justify-between">
                          <span className="rounded-full bg-[#fffdf7]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#585a51] shadow-sm">
                            {item.category}
                          </span>
                          {item.tag && (
                            <span className="rounded-full bg-[#e6a117] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#23251f] shadow-sm">
                              {item.tag}
                            </span>
                          )}
                        </div>

                        {/* Sold out overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#23251f]/50 backdrop-blur-[2px]">
                            <span className="rounded-full bg-[#fffdf7] px-4 py-1.5 text-xs font-black text-[#b65b48] shadow-md">
                              Sold Out Today
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dish details */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-display text-2xl font-bold tracking-tight text-[#23251f]">
                            {item.name}
                          </h2>
                          <p className="mt-1 text-xs leading-5 text-[#85877d] line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display text-2xl font-bold text-[#23251f]">₹{item.price}</p>
                          <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#85877d]">
                            <Clock size={12} /> {rushMode ? '+10 min' : item.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Counter location & Add to Tray button */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#ecebe4] pt-3.5">
                      <span className="text-[11px] font-semibold text-[#8b8d83]">
                        {item.counter || 'Counter 1'}
                      </span>

                      {!isOutOfStock && (
                        <div>
                          {inCart ? (
                            <div className="flex items-center gap-2 rounded-xl bg-[#23251f] px-2 py-1 text-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 hover:text-[#e6a117]"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-5 text-center text-xs font-bold text-[#e6a117]">
                                {cartEntry?.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 hover:text-[#e6a117]"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="flex items-center gap-1.5 rounded-xl bg-[#e6a117] px-3.5 py-2 text-xs font-bold text-[#23251f] shadow-sm transition hover:bg-[#f0b12a]"
                            >
                              <Plus size={15} />
                              <span>Add to Tray</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {/* CUSTOMER TAB 2: MY TOKENS & ORDERS */}
        {customerTab === 'orders' && (
          <div className="space-y-6">
            <div className="border-b border-[#deded5] pb-6">
              <span className="text-xs font-bold uppercase tracking-[.18em] text-[#c17e00]">
                Live Counter Tracker
              </span>
              <h1 className="mt-1 font-display text-4xl text-[#23251f]">My Pickup Tokens</h1>
              <p className="mt-1 text-sm text-[#797b72]">
                Track food preparation and present your token at the counter when called.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-[#deded5] bg-[#fffdf7] p-12 text-center">
                <Ticket size={48} className="mx-auto mb-3 text-[#b1b2aa]" />
                <h2 className="font-display text-2xl text-[#23251f]">No orders placed yet</h2>
                <p className="mt-1 text-sm text-[#85877d]">
                  Pick your favorite meal from the menu to generate a pickup token.
                </p>
                <button
                  onClick={() => setCustomerTab('menu')}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e6a117] px-5 py-2.5 text-xs font-bold text-[#23251f] hover:bg-[#f0b12a]"
                >
                  <span>Browse Canteen Menu</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {orders.map((ord) => {
                  const isCashDue = ord.paymentStatus === 'pending_cash'
                  return (
                    <div
                      key={ord.id}
                      className="flex flex-col justify-between rounded-3xl border border-[#deded5] bg-[#fffdf7] p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div>
                        {/* Token Number Card Header */}
                        <div className="flex items-start justify-between border-b border-[#ecebe4] pb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9a9b91]">
                              Pickup Token
                            </span>
                            <div className="font-display text-4xl font-extrabold text-[#23251f]">
                              {ord.tokenNumber}
                            </div>
                            <span className="text-xs text-[#85877d]">{ord.createdAt}</span>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              ord.orderStatus === 'ready'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'completed'
                                ? 'bg-[#ecebe4] text-[#6f7168]'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.orderStatus === 'ready' ? 'Ready for Pickup' : ord.orderStatus}
                          </span>
                        </div>

                        {/* Order items */}
                        <div className="mt-4 space-y-1.5 text-xs">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="font-medium text-[#23251f]">
                                {it.quantity}× {it.name}
                              </span>
                              <span className="text-[#85877d]">₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Counter & Est Ready */}
                        <div className="mt-4 rounded-xl bg-[#f8f7f2] p-3 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#23251f]">
                            <MapPin size={14} className="text-[#e6a117]" />
                            <span>{ord.pickupCounter}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#797b72]">
                            <Clock size={14} />
                            <span>Estimated Ready: {ord.estimatedReadyTime}</span>
                          </div>
                        </div>

                        {/* Payment Status Notice */}
                        <div className="mt-3">
                          {isCashDue ? (
                            <div className="rounded-lg bg-amber-50 p-2.5 text-[11px] font-semibold text-amber-900 border border-amber-200">
                              ⚠️ Cash Due: Pay ₹{ord.totalAmount.toFixed(2)} at Counter 1
                            </div>
                          ) : (
                            <div className="rounded-lg bg-emerald-50 p-2.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                              ✓ Paid Online ({ord.paymentMethodName})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action to open token slip */}
                      <div className="mt-5 border-t border-[#ecebe4] pt-4 flex items-center justify-between">
                        <span className="font-display text-xl font-bold">₹{ord.totalAmount.toFixed(2)}</span>
                        <button
                          onClick={() => setActiveTokenModal(ord)}
                          className="flex items-center gap-1.5 rounded-xl bg-[#23251f] px-4 py-2 text-xs font-bold text-[#fffdf7] hover:bg-[#3d4037]"
                        >
                          <Ticket size={14} />
                          <span>View Full Token</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER TAB 3: CAMPUS WALLET */}
        {customerTab === 'wallet' && (
          <div className="max-w-2xl space-y-6">
            <div className="border-b border-[#deded5] pb-6">
              <span className="text-xs font-bold uppercase tracking-[.18em] text-[#c17e00]">
                Prepaid Canteen Account
              </span>
              <h1 className="mt-1 font-display text-4xl text-[#23251f]">Campus Wallet</h1>
              <p className="mt-1 text-sm text-[#797b72]">
                Instant 1-click token generation without bank OTPs or card details.
              </p>
            </div>

            {/* Wallet Balance Hero Card */}
            <div className="rounded-3xl bg-[#23251f] p-8 text-[#fffdf7] shadow-xl">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6a117] text-[#23251f]">
                  <Zap size={22} fill="currentColor" />
                </span>
                <span className="rounded-full bg-[#fffdf7]/10 px-3 py-1 text-[11px] font-bold text-[#f1c55d]">
                  Roll #{customerRoll}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#b9baae]">Available Balance</p>
                <p className="mt-1 font-display text-6xl text-[#fffdf7]">₹{walletBalance.toFixed(2)}</p>
                <p className="mt-2 text-xs text-[#a5a79e]">
                  Linked to student: <strong>{customerName}</strong>
                </p>
              </div>

              {/* Quick Top-up buttons */}
              <div className="mt-8 border-t border-[#3b3e34] pt-6">
                <p className="text-xs font-bold text-[#f1c55d] mb-3">Recharge with Instant UPI / Gateway:</p>
                <div className="flex flex-wrap gap-2.5">
                  {[100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleTopUpWallet(amt)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#fffdf7]/10 px-4 py-2.5 text-xs font-bold text-[#fffdf7] hover:bg-[#e6a117] hover:text-[#23251f] transition"
                    >
                      <Plus size={14} />
                      <span>Add ₹{amt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Success notification */}
            {topUpSuccess && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>{topUpSuccess}</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Customer Tray / Cart Sidebar Drawer */}
      {isTrayOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#191a16]/40 backdrop-blur-sm"
          onClick={() => setIsTrayOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-[#fffdf7] p-6 shadow-2xl sm:p-8 animate-in slide-in-from-right duration-200"
          >
            {/* Tray Header */}
            <div className="flex items-center justify-between border-b border-[#deded5] pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9a9b91]">
                  Your Tray ({cartCount})
                </p>
                <h2 className="mt-0.5 font-display text-3xl text-[#23251f]">Ready to order</h2>
              </div>
              <button
                onClick={() => setIsTrayOpen(false)}
                className="rounded-full p-2 text-[#797b72] hover:bg-[#efeee8]"
                aria-label="Close tray"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto py-4 divide-y divide-[#ecebe4]">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag size={48} className="mb-3 text-[#b1b2aa]" />
                  <p className="font-display text-2xl text-[#23251f]">Your tray is empty</p>
                  <p className="mt-1 text-xs text-[#85877d]">Select items from the canteen menu.</p>
                </div>
              ) : (
                cart.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 py-3.5">
                    <img
                      src={entry.item.image}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg text-[#23251f] truncate">{entry.item.name}</p>
                      <p className="text-xs text-[#85877d]">₹{entry.item.price} each</p>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(entry.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#deded5] bg-[#f8f7f2] text-xs font-bold hover:bg-[#ecebe4]"
                        >
                          -
                        </button>
                        <span className="min-w-4 text-center text-xs font-bold">{entry.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(entry.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#deded5] bg-[#f8f7f2] text-xs font-bold hover:bg-[#ecebe4]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-[#23251f]">
                        ₹{(entry.item.price * entry.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(entry.id)}
                        className="mt-2 text-xs font-semibold text-[#b65b48] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tray Footer & Checkout Trigger */}
            {cart.length > 0 && (
              <div className="border-t border-[#deded5] pt-5 space-y-4">
                <div className="flex items-center justify-between text-base font-bold">
                  <span>Grand Total</span>
                  <span className="font-display text-3xl text-[#23251f]">₹{cartTotal.toFixed(2)}</span>
                </div>

                {/* Payment Options Overview preview */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-xl bg-[#f0e3c8] p-2.5 text-[#9b6200] font-bold">
                    <Smartphone size={16} />
                    <span>Online UPI / Card</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-[#f8f7f2] border border-[#deded5] p-2.5 text-[#55574f] font-bold">
                    <Banknote size={16} />
                    <span>Offline Cash / Wallet</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#e6a117] text-sm font-bold text-[#29271e] shadow-md transition hover:bg-[#f0b12a]"
                >
                  <span>Select Payment & Generate Token</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Payment Gateway Modal (Supports Online UPI, Online Cards, Offline Cash, Campus Wallet) */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={cart}
        totalAmount={cartTotal}
        customerName={customerName}
        customerRoll={customerRoll}
        walletBalance={walletBalance}
        upiSettings={upiSettings}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Generated Token Slip / Receipt Modal */}
      <TokenSlipModal
        isOpen={Boolean(activeTokenModal)}
        onClose={() => setActiveTokenModal(null)}
        token={activeTokenModal}
        onViewAllOrders={() => {
          setActiveTokenModal(null)
          setCustomerTab('orders')
        }}
      />
    </div>
  )
}
