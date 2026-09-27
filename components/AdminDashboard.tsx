'use client'

import React, { useState } from 'react'
import {
  LayoutDashboard,
  Utensils,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Smartphone,
  Plus,
  Search,
  Filter,
  PackageCheck,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Store,
  LogOut,
  Sparkles,
  Zap,
  ArrowRight,
  Trash2,
  RefreshCw,
  QrCode,
  Upload,
  Check,
  Edit3,
  X,
  Image as ImageIcon,
} from 'lucide-react'
import { MenuItem, OrderToken, OrderStatus, UpiSettings } from '../lib/types'
import { UpiQrCode } from './UpiQrCode'

interface AdminDashboardProps {
  orders: OrderToken[]
  menuItems: MenuItem[]
  rushMode: boolean
  upiSettings: UpiSettings
  setRushMode: (v: boolean) => void
  onUpdateOrderStatus: (tokenId: string, nextStatus: OrderStatus) => void
  onMarkCashPaid: (tokenId: string) => void
  onToggleStock: (itemId: number) => void
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void
  onDeleteMenuItem: (itemId: number) => void
  onUpdateUpiSettings: (settings: UpiSettings) => void
  onSwitchToCustomer: () => void
  onLogout?: () => void
}

// Preset food templates for quick item addition
const QUICK_PRESETS = [
  {
    name: 'Veg Cheese Sandwich',
    category: 'Breakfast',
    price: 65,
    time: '6 min',
    counter: 'Counter 2 (Fast Food)',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85',
    desc: 'Grilled whole wheat sandwich layered with cucumbers, tomatoes, bell peppers and melted cheese',
  },
  {
    name: 'Chole Kulche',
    category: 'Meals',
    price: 90,
    time: '10 min',
    counter: 'Counter 1 (Main Meals)',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=85',
    desc: 'Spicy tangy Amritsari chole served with two buttery soft kulchas and pickled onions',
  },
  {
    name: 'Masala Chai',
    category: 'Beverages',
    price: 20,
    time: '3 min',
    counter: 'Counter 3 (Beverage Bar)',
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=900&q=85',
    desc: 'Steaming hot aromatic Indian spiced tea infused with fresh ginger, cardamom and cloves',
  },
  {
    name: 'Crispy Veg Burger',
    category: 'Quick bites',
    price: 70,
    time: '8 min',
    counter: 'Counter 2 (Grill & Rolls)',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
    desc: 'Golden fried vegetable patty with fresh lettuce, sliced tomatoes, gherkins and chipotle mayo',
  },
  {
    name: 'Paneer Butter Masala Meal',
    category: 'Meals',
    price: 130,
    time: '15 min',
    counter: 'Counter 1 (Main Meals)',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85',
    desc: 'Rich paneer butter gravy served with choice of 2 butter rotis or steamed jeera rice and salad',
  },
]

export function AdminDashboard({
  orders,
  menuItems,
  rushMode,
  upiSettings,
  setRushMode,
  onUpdateOrderStatus,
  onMarkCashPaid,
  onToggleStock,
  onAddMenuItem,
  onDeleteMenuItem,
  onUpdateUpiSettings,
  onSwitchToCustomer,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'menu' | 'qr_settings' | 'analytics'>('tokens')
  
  // Orders filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ready' | 'completed'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'online' | 'offline'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Menu items filter state
  const [menuStockFilter, setMenuStockFilter] = useState<'all' | 'available' | 'soldOut'>('all')
  const [menuSearchQuery, setMenuSearchQuery] = useState('')
  const [menuCatFilter, setMenuCatFilter] = useState('All')

  // Item deletion confirmation modal
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  // Add Item Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('Breakfast')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemTime, setNewItemTime] = useState('8 min')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemCounter, setNewItemCounter] = useState('Counter 1 (South Kitchen)')
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85')
  const [newItemTag, setNewItemTag] = useState('')

  // QR & UPI Settings form state
  const [formUpiId, setFormUpiId] = useState(upiSettings.upiId)
  const [formPayeeName, setFormPayeeName] = useState(upiSettings.payeeName)
  const [formUseCustomImage, setFormUseCustomImage] = useState(upiSettings.useCustomImage)
  const [formCustomQrUrl, setFormCustomQrUrl] = useState(upiSettings.customQrImageUrl || '')
  const [qrSaveMessage, setQrSaveMessage] = useState('')

  // Financial statistics
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0)
  const onlineRevenue = orders
    .filter((ord) => ord.paymentCategory === 'online')
    .reduce((sum, ord) => sum + ord.totalAmount, 0)
  const offlineRevenue = orders
    .filter((ord) => ord.paymentCategory === 'offline')
    .reduce((sum, ord) => sum + ord.totalAmount, 0)
  const pendingCashTotal = orders
    .filter((ord) => ord.paymentStatus === 'pending_cash')
    .reduce((sum, ord) => sum + ord.totalAmount, 0)

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    if (statusFilter === 'active') {
      if (ord.orderStatus === 'completed') return false
    } else if (statusFilter === 'ready') {
      if (ord.orderStatus !== 'ready') return false
    } else if (statusFilter === 'completed') {
      if (ord.orderStatus !== 'completed') return false
    }

    if (paymentFilter === 'online' && ord.paymentCategory !== 'online') return false
    if (paymentFilter === 'offline' && ord.paymentCategory !== 'offline') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchToken = ord.tokenNumber.toLowerCase().includes(q)
      const matchCustomer = ord.customerName.toLowerCase().includes(q)
      const matchRoll = ord.customerRoll.toLowerCase().includes(q)
      const matchItem = ord.items.some((i) => i.name.toLowerCase().includes(q))
      if (!matchToken && !matchCustomer && !matchRoll && !matchItem) return false
    }

    return true
  })

  // Filter menu items for Menu & Stock tab
  const filteredMenuItems = menuItems.filter((item) => {
    if (menuStockFilter === 'available' && item.soldOut) return false
    if (menuStockFilter === 'soldOut' && !item.soldOut) return false
    if (menuCatFilter !== 'All' && item.category !== menuCatFilter) return false
    if (menuSearchQuery.trim()) {
      const q = menuSearchQuery.toLowerCase()
      const matchName = item.name.toLowerCase().includes(q)
      const matchDesc = item.description.toLowerCase().includes(q)
      if (!matchName && !matchDesc) return false
    }
    return true
  })

  // Apply Quick Preset to Add Item form
  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setNewItemName(preset.name)
    setNewItemCategory(preset.category)
    setNewItemPrice(preset.price.toString())
    setNewItemTime(preset.time)
    setNewItemCounter(preset.counter)
    setNewItemImage(preset.image)
    setNewItemDesc(preset.desc)
  }

  // Handle image file upload for Add Item
  const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewItemImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle QR image file upload for QR settings
  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormCustomQrUrl(event.target.result as string)
          setFormUseCustomImage(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit Add Item
  const handleAddNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim() || !newItemPrice) return

    onAddMenuItem({
      name: newItemName.trim(),
      category: newItemCategory,
      price: parseFloat(newItemPrice) || 50,
      time: newItemTime || '10 min',
      description: newItemDesc.trim() || 'Delicious fresh canteen specialty',
      counter: newItemCounter,
      image: newItemImage.trim(),
      tag: newItemTag.trim() || undefined,
      soldOut: false,
    })

    // Reset & close
    setNewItemName('')
    setNewItemPrice('')
    setNewItemDesc('')
    setNewItemTag('')
    setShowAddModal(false)
  }

  // Save QR Settings
  const handleSaveQrSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formUpiId.trim()) return

    onUpdateUpiSettings({
      upiId: formUpiId.trim(),
      payeeName: formPayeeName.trim() || 'Campus Canteen',
      useCustomImage: formUseCustomImage,
      customQrImageUrl: formCustomQrUrl.trim(),
    })

    setQrSaveMessage('✓ Money Receiving QR Code and UPI ID updated successfully!')
    setTimeout(() => setQrSaveMessage(''), 4000)
  }

  // Reset QR Settings
  const handleResetQr = () => {
    const defaultSettings: UpiSettings = {
      upiId: 'canteen.campus@icici',
      payeeName: 'Campus Canteen',
      customQrImageUrl: '',
      useCustomImage: false,
    }
    setFormUpiId(defaultSettings.upiId)
    setFormPayeeName(defaultSettings.payeeName)
    setFormUseCustomImage(false)
    setFormCustomQrUrl('')
    onUpdateUpiSettings(defaultSettings)
    setQrSaveMessage('Reset to standard campus canteen UPI QR.')
    setTimeout(() => setQrSaveMessage(''), 4000)
  }

  return (
    <div className="min-h-screen bg-[#1c1e19] text-[#f4f3ec]">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#2e3129] bg-[#1c1e19]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* Logo & Admin Indicator */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6a117] text-[#23251f]">
              <Store size={20} strokeWidth={2.5} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-[#fffdf7]">Common Ground</span>
                <span className="rounded-full bg-[#e6a117]/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6a117] border border-[#e6a117]/40">
                  Admin Console
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#8b8d83]">Kitchen Management & Live Tokens</p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { id: 'tokens', label: 'Live Tokens', icon: PackageCheck, count: orders.filter(o => o.orderStatus !== 'completed').length },
              { id: 'menu', label: 'Menu & Stock', icon: Utensils, count: menuItems.length },
              { id: 'qr_settings', label: 'Receiving QR & UPI', icon: QrCode },
              { id: 'analytics', label: 'Financials', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'bg-[#292c24] text-[#e6a117] shadow-inner border border-[#3b3e32]'
                      : 'text-[#9b9d93] hover:bg-[#252820] hover:text-[#fffdf7]'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e6a117] px-1 text-[10px] font-extrabold text-[#23251f]">
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right quick actions */}
          <div className="flex items-center gap-3">
            {/* Rush Mode Switch */}
            <div className="hidden items-center gap-2 rounded-xl border border-[#2e3129] bg-[#242720] px-3 py-1.5 sm:flex">
              <span className="text-[11px] font-semibold text-[#a5a79e]">Rush Mode</span>
              <button
                type="button"
                onClick={() => setRushMode(!rushMode)}
                className={`relative h-6 w-11 rounded-full transition ${rushMode ? 'bg-[#da604a]' : 'bg-[#3b3e32]'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${rushMode ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Switch to Customer Portal */}
            <button
              onClick={onSwitchToCustomer}
              className="flex items-center gap-2 rounded-xl bg-[#e6a117] px-4 py-2 text-xs font-bold text-[#23251f] shadow-sm transition hover:bg-[#f0b12a]"
            >
              <span>Customer View</span>
              <ArrowRight size={14} />
            </button>

            {/* Logout button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3 py-2 text-xs font-bold text-rose-400 hover:border-rose-700 hover:bg-rose-950/40 transition"
                title="Log out of Admin"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Nav */}
        <div className="flex border-t border-[#2e3129] px-2 py-2 overflow-x-auto md:hidden">
          {[
            { id: 'tokens', label: 'Tokens' },
            { id: 'menu', label: 'Menu & Stock' },
            { id: 'qr_settings', label: 'QR Settings' },
            { id: 'analytics', label: 'Financials' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 whitespace-nowrap px-3 py-1.5 text-center text-xs font-bold ${
                activeTab === t.id ? 'text-[#e6a117] border-b-2 border-[#e6a117]' : 'text-[#85877d]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        {/* TAB 1: LIVE TOKENS & ORDERS QUEUE */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            {/* Top Bar with KPI stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-[#2e3129] bg-[#242720] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#85877d]">Total Orders Today</p>
                <p className="mt-1 font-display text-4xl text-[#fffdf7]">{orders.length}</p>
                <p className="mt-1 text-xs text-[#a5a79e]">Tokens generated</p>
              </div>

              <div className="rounded-2xl border border-[#2e3129] bg-[#242720] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#85877d]">In Kitchen / Prep</p>
                <p className="mt-1 font-display text-4xl text-[#e6a117]">
                  {orders.filter((o) => o.orderStatus === 'preparing' || o.orderStatus === 'accepted').length}
                </p>
                <p className="mt-1 text-xs text-[#a5a79e]">Active queues</p>
              </div>

              <div className="rounded-2xl border border-[#2e3129] bg-[#242720] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#85877d]">Ready for Pickup</p>
                <p className="mt-1 font-display text-4xl text-emerald-400">
                  {orders.filter((o) => o.orderStatus === 'ready').length}
                </p>
                <p className="mt-1 text-xs text-[#a5a79e]">At counters</p>
              </div>

              <div className="rounded-2xl border border-[#2e3129] bg-[#242720] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#85877d]">Offline Cash Due</p>
                <p className="mt-1 font-display text-4xl text-amber-400">₹{pendingCashTotal.toFixed(2)}</p>
                <p className="mt-1 text-xs text-[#a5a79e]">To collect at counter</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2e3129] bg-[#242720] p-4 lg:flex-row lg:items-center">
              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#8b8d83]">Status:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active in Kitchen' },
                  { id: 'ready', label: 'Ready for Pickup' },
                  { id: 'completed', label: 'Completed' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      statusFilter === f.id
                        ? 'bg-[#e6a117] text-[#23251f]'
                        : 'bg-[#1c1e19] text-[#a5a79e] hover:bg-[#2c3026]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Payment Mode Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#8b8d83]">Payment:</span>
                {[
                  { id: 'all', label: 'All Modes' },
                  { id: 'online', label: 'Online (UPI/Card)' },
                  { id: 'offline', label: 'Offline (Cash/Wallet)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPaymentFilter(f.id as any)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      paymentFilter === f.id
                        ? 'bg-[#fffdf7] text-[#23251f]'
                        : 'bg-[#1c1e19] text-[#a5a79e] hover:bg-[#2c3026]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-[#85877d]" />
                <input
                  type="text"
                  placeholder="Search token #, roll, item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] pl-9 pr-3 text-xs text-[#f4f3ec] outline-none placeholder:text-[#6e7067] focus:border-[#e6a117] sm:w-60"
                />
              </div>
            </div>

            {/* Orders List / Cards */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-[#2e3129] bg-[#242720] p-12 text-center text-[#85877d]">
                  <PackageCheck size={40} className="mx-auto mb-3 text-[#55574f]" />
                  <p className="font-display text-2xl text-[#f4f3ec]">No orders matching your filter</p>
                  <p className="mt-1 text-xs">Switch filters or place an order from customer view to see it live.</p>
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isCashPending = ord.paymentStatus === 'pending_cash'
                  return (
                    <div
                      key={ord.id}
                      className="flex flex-col gap-4 rounded-2xl border border-[#2e3129] bg-[#242720] p-5 transition hover:border-[#3e4236] lg:flex-row lg:items-center lg:justify-between"
                    >
                      {/* Left: Token and Customer info */}
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#e6a117] font-display font-black text-[#23251f]">
                          <span className="text-[10px] uppercase tracking-tighter opacity-80">Token</span>
                          <span className="text-xl leading-none">{ord.tokenNumber}</span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#fffdf7]">{ord.customerName}</span>
                            <span className="rounded-md bg-[#1c1e19] px-2 py-0.5 text-[10px] font-mono text-[#a5a79e]">
                              {ord.customerRoll}
                            </span>
                            <span className="text-xs text-[#85877d]">· {ord.createdAt}</span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-[#d1d0c5]">
                            {ord.items.map((it, idx) => (
                              <span key={idx} className="rounded-lg bg-[#1c1e19] px-2 py-1 font-medium">
                                <strong className="text-[#e6a117]">{it.quantity}×</strong> {it.name}
                              </span>
                            ))}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#85877d]">
                            <span>Pickup: <strong>{ord.pickupCounter}</strong></span>
                            <span>· Est: <strong>{ord.estimatedReadyTime}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Payment badge & Actions */}
                      <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
                        <div className="text-right">
                          <p className="font-display text-xl text-[#fffdf7]">₹{ord.totalAmount.toFixed(2)}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            {/* Payment Category badge */}
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                ord.paymentCategory === 'online'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {ord.paymentMethodName}
                            </span>

                            {/* Cash pending or paid indicator */}
                            {isCashPending ? (
                              <span className="rounded-full bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800 animate-pulse">
                                Cash Pending
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#1c1e19] px-2 py-0.5 text-[10px] font-semibold text-[#8b8d83]">
                                Paid
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 1-Click Cash Collect button if cash is pending */}
                        {isCashPending && (
                          <button
                            type="button"
                            onClick={() => onMarkCashPaid(ord.id)}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-[#23251f] shadow-sm hover:bg-amber-400"
                          >
                            <Banknote size={15} />
                            <span>Mark Cash Received (₹{ord.totalAmount})</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Order Status progression stepper button */}
                      <div className="flex items-center gap-2 border-t border-[#2e3129] pt-3 lg:border-t-0 lg:pt-0">
                        {ord.orderStatus === 'placed' && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(ord.id, 'accepted')}
                            className="flex h-10 items-center gap-2 rounded-xl bg-[#e6a117] px-4 text-xs font-bold text-[#23251f] hover:bg-[#f0b12a]"
                          >
                            <span>Accept Order</span>
                            <ArrowRight size={14} />
                          </button>
                        )}

                        {ord.orderStatus === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                            className="flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white hover:bg-orange-500"
                          >
                            <Clock size={14} />
                            <span>Start Preparing</span>
                          </button>
                        )}

                        {ord.orderStatus === 'preparing' && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(ord.id, 'ready')}
                            className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-500"
                          >
                            <CheckCircle2 size={14} />
                            <span>Mark Ready for Pickup</span>
                          </button>
                        )}

                        {ord.orderStatus === 'ready' && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(ord.id, 'completed')}
                            className="flex h-10 items-center gap-2 rounded-xl bg-[#3b3e32] px-4 text-xs font-bold text-[#f4f3ec] hover:bg-[#4d5242]"
                          >
                            <PackageCheck size={14} />
                            <span>Mark Handed Over / Done</span>
                          </button>
                        )}

                        {ord.orderStatus === 'completed' && (
                          <span className="flex items-center gap-1.5 rounded-xl bg-[#1c1e19] px-3 py-2 text-xs font-bold text-emerald-400">
                            <CheckCircle2 size={14} /> Order Fulfilled
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MENU & STOCK MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Top action row */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-3xl text-[#fffdf7]">Menu & Food Items Management</h2>
                <p className="mt-1 text-xs text-[#85877d]">
                  Add new dishes, remove items, or toggle real-time availability (In Stock / Sold Out).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#e6a117] px-4 py-2.5 text-xs font-bold text-[#23251f] shadow-md transition hover:bg-[#f0b12a]"
              >
                <Plus size={16} />
                <span>Add New Food Item</span>
              </button>
            </div>

            {/* Filter and Search controls */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2e3129] bg-[#242720] p-4 lg:flex-row lg:items-center">
              {/* Availability Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#8b8d83]">Stock:</span>
                {[
                  { id: 'all', label: `All Items (${menuItems.length})` },
                  { id: 'available', label: `In Stock (${menuItems.filter(i => !i.soldOut).length})` },
                  { id: 'soldOut', label: `Sold Out (${menuItems.filter(i => i.soldOut).length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMenuStockFilter(f.id as any)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      menuStockFilter === f.id
                        ? 'bg-[#e6a117] text-[#23251f]'
                        : 'bg-[#1c1e19] text-[#a5a79e] hover:bg-[#2c3026]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#8b8d83]">Category:</span>
                {['All', 'Breakfast', 'Quick bites', 'Meals', 'Beverages'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMenuCatFilter(cat)}
                    className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                      menuCatFilter === cat
                        ? 'bg-[#fffdf7] text-[#23251f]'
                        : 'bg-[#1c1e19] text-[#a5a79e] hover:bg-[#2c3026]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search item */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-[#85877d]" />
                <input
                  type="text"
                  placeholder="Search dish name..."
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] pl-9 pr-3 text-xs text-[#f4f3ec] outline-none placeholder:text-[#6e7067] focus:border-[#e6a117] sm:w-56"
                />
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMenuItems.map((item) => {
                const isOutOfStock = Boolean(item.soldOut)
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between rounded-3xl border p-5 transition ${
                      isOutOfStock
                        ? 'border-[#383b31] bg-[#1e201a] opacity-80'
                        : 'border-[#2e3129] bg-[#242720] hover:border-[#3e4236]'
                    }`}
                  >
                    <div>
                      {/* Image container */}
                      <div className="relative mb-3.5 aspect-[1.3] overflow-hidden rounded-2xl bg-[#1c1e19]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`h-full w-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
                        />
                        <div className="absolute inset-x-2.5 top-2.5 flex justify-between">
                          <span className="rounded-full bg-[#1c1e19]/90 px-2.5 py-0.5 text-[10px] font-bold text-[#e6a117] border border-[#e6a117]/30">
                            {item.category}
                          </span>
                          {item.tag && (
                            <span className="rounded-full bg-[#e6a117] px-2 py-0.5 text-[10px] font-black text-[#23251f]">
                              {item.tag}
                            </span>
                          )}
                        </div>

                        {/* Sold Out Badge overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <span className="rounded-full bg-rose-950 px-3.5 py-1.5 text-xs font-black text-rose-300 border border-rose-800">
                              SOLD OUT / UNAVAILABLE
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-xl font-bold text-[#fffdf7]">{item.name}</h3>
                          <p className="mt-1 text-xs leading-5 text-[#85877d] line-clamp-2">{item.description}</p>
                        </div>
                        <span className="font-display text-xl font-bold text-[#e6a117]">₹{item.price}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-[#6e7067] border-t border-[#2e3129] pt-2.5">
                        <span>Station: <strong>{item.counter || 'Counter 1'}</strong></span>
                        <span>Prep: <strong>{item.time}</strong></span>
                      </div>
                    </div>

                    {/* Action Controls: Availability Switch & Remove Button */}
                    <div className="mt-4 flex items-center justify-between border-t border-[#2e3129] pt-3.5">
                      {/* Stock availability toggle */}
                      <button
                        type="button"
                        onClick={() => onToggleStock(item.id)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                          isOutOfStock
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
                        <span>{isOutOfStock ? 'Mark Available' : 'Available (In Stock)'}</span>
                      </button>

                      {/* Remove item button */}
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="flex items-center gap-1.5 rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3 py-2 text-xs font-bold text-rose-400 hover:border-rose-800 hover:bg-rose-950/40 transition"
                        title="Remove dish from menu"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MONEY RECEIVING QR CODE & UPI SETTINGS */}
        {activeTab === 'qr_settings' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6a117] text-[#23251f]">
                  <QrCode size={16} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#e6a117]">
                  Payment Gateway Settings
                </span>
              </div>
              <h2 className="mt-1 font-display text-3xl text-[#fffdf7]">Money Receiving QR & UPI Configuration</h2>
              <p className="mt-1 text-xs text-[#85877d]">
                Configure the merchant UPI ID, payee business name, or upload your physical counter QR code photo. Customers will scan this exact QR to pay.
              </p>
            </div>

            {/* Save success toast banner */}
            {qrSaveMessage && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300 animate-in fade-in">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>{qrSaveMessage}</span>
              </div>
            )}

            <div className="grid gap-7 lg:grid-cols-[1.2fr_1fr]">
              {/* Left Column: Form Controls */}
              <form onSubmit={handleSaveQrSettings} className="space-y-5 rounded-3xl border border-[#2e3129] bg-[#242720] p-6 text-xs">
                {/* UPI VPA Input */}
                <div>
                  <label className="block font-bold text-[#d1d0c5]">
                    Receiving UPI ID / VPA <span className="text-rose-400">*</span>
                  </label>
                  <p className="mt-0.5 text-[11px] text-[#85877d]">
                    Bank account UPI address where customer payments will be credited.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="e.g. canteen.campus@icici or 9876543210@paytm"
                    value={formUpiId}
                    onChange={(e) => setFormUpiId(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3.5 text-sm font-mono text-white outline-none focus:border-[#e6a117]"
                  />
                </div>

                {/* Payee Merchant Name */}
                <div>
                  <label className="block font-bold text-[#d1d0c5]">
                    Payee / Canteen Merchant Name <span className="text-rose-400">*</span>
                  </label>
                  <p className="mt-0.5 text-[11px] text-[#85877d]">
                    Name shown on the student&apos;s UPI app when making payment.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Campus Common Ground Canteen"
                    value={formPayeeName}
                    onChange={(e) => setFormPayeeName(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3.5 text-sm text-white outline-none focus:border-[#e6a117]"
                  />
                </div>

                {/* QR Code Presentation Mode */}
                <div className="border-t border-[#2e3129] pt-4">
                  <label className="block font-bold text-[#d1d0c5] mb-2">QR Code Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormUseCustomImage(false)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                        !formUseCustomImage
                          ? 'border-[#e6a117] bg-[#292c24] text-[#fffdf7]'
                          : 'border-[#3b3e32] bg-[#1c1e19] text-[#85877d] hover:bg-[#252820]'
                      }`}
                    >
                      <Sparkles size={20} className={!formUseCustomImage ? 'text-[#e6a117]' : ''} />
                      <span className="mt-2 font-bold text-xs">Dynamic UPI QR</span>
                      <span className="mt-0.5 text-[10px] text-[#85877d]">Auto-calculates order total</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormUseCustomImage(true)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                        formUseCustomImage
                          ? 'border-[#e6a117] bg-[#292c24] text-[#fffdf7]'
                          : 'border-[#3b3e32] bg-[#1c1e19] text-[#85877d] hover:bg-[#252820]'
                      }`}
                    >
                      <ImageIcon size={20} className={formUseCustomImage ? 'text-[#e6a117]' : ''} />
                      <span className="mt-2 font-bold text-xs">Custom QR Image</span>
                      <span className="mt-0.5 text-[10px] text-[#85877d]">Physical Standee / Photo</span>
                    </button>
                  </div>
                </div>

                {/* If Custom QR Image is selected */}
                {formUseCustomImage && (
                  <div className="space-y-3 rounded-2xl border border-[#3b3e32] bg-[#1c1e19] p-4 animate-in fade-in">
                    <div>
                      <label className="block font-bold text-[#d1d0c5]">
                        Option 1: Upload QR Photo / Standee Image
                      </label>
                      <label className="mt-2 flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#44473b] bg-[#242720] hover:border-[#e6a117] transition">
                        <Upload size={20} className="text-[#85877d]" />
                        <span className="mt-1 text-xs font-semibold text-[#a5a79e]">
                          Click to select QR image file (.png, .jpg)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block font-bold text-[#d1d0c5]">
                        Option 2: Or Paste QR Image URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/canteen-gpay-qr.png"
                        value={formCustomQrUrl}
                        onChange={(e) => setFormCustomQrUrl(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-xl border border-[#3b3e32] bg-[#242720] px-3 text-xs text-white outline-none focus:border-[#e6a117]"
                      />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#e6a117] py-3.5 text-xs font-bold text-[#23251f] shadow-md transition hover:bg-[#f0b12a]"
                  >
                    <Check size={16} />
                    <span>Save & Apply Receiving QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetQr}
                    className="rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-4 py-3.5 text-xs font-bold text-[#85877d] hover:bg-[#252820]"
                    title="Reset to default QR"
                  >
                    Reset
                  </button>
                </div>
              </form>

              {/* Right Column: Live Customer Preview */}
              <div className="flex flex-col items-center justify-center rounded-3xl border border-[#2e3129] bg-[#242720] p-6 text-center">
                <span className="rounded-full bg-[#1c1e19] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#e6a117] border border-[#3b3e32]">
                  Live Customer Preview
                </span>
                <p className="mt-2 font-display text-xl text-[#fffdf7]">
                  What customers scan at checkout
                </p>
                <p className="mt-1 text-xs text-[#85877d]">
                  Live test for sample ₹85.00 order
                </p>

                <div className="mt-5 rounded-2xl bg-[#f8f7f2] p-5 shadow-lg">
                  <UpiQrCode
                    amount={85}
                    tokenRef="TK-SAMPLE"
                    size={200}
                    upiId={formUpiId || upiSettings.upiId}
                    payeeName={formPayeeName || upiSettings.payeeName}
                    useCustomImage={formUseCustomImage}
                    customQrImageUrl={formCustomQrUrl || upiSettings.customQrImageUrl}
                  />
                </div>

                <div className="mt-5 text-left w-full space-y-1 rounded-xl bg-[#1c1e19] p-3 text-xs text-[#a5a79e]">
                  <p><strong>Configured VPA:</strong> <span className="font-mono text-[#e6a117]">{formUpiId || upiSettings.upiId}</span></p>
                  <p><strong>Merchant Name:</strong> <span>{formPayeeName || upiSettings.payeeName}</span></p>
                  <p><strong>QR Mode:</strong> <span>{formUseCustomImage ? 'Custom Merchant Standee' : 'Dynamic Auto-Generated'}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FINANCIALS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="font-display text-3xl text-[#fffdf7]">Canteen Financials & Payment Splits</h2>

            {/* Split Breakdown Cards */}
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#2e3129] bg-[#242720] p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#85877d]">Total Gross Revenue</span>
                  <TrendingUp size={20} className="text-[#e6a117]" />
                </div>
                <p className="mt-3 font-display text-5xl text-[#fffdf7]">₹{totalRevenue.toFixed(2)}</p>
                <p className="mt-2 text-xs text-[#a5a79e]">Across {orders.length} total tokens</p>
              </div>

              <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Online Payments (UPI & Cards)</span>
                  <Smartphone size={20} className="text-emerald-400" />
                </div>
                <p className="mt-3 font-display text-5xl text-emerald-400">₹{onlineRevenue.toFixed(2)}</p>
                <p className="mt-2 text-xs text-emerald-300/80">
                  {totalRevenue > 0 ? ((onlineRevenue / totalRevenue) * 100).toFixed(0) : 0}% of all payments
                </p>
              </div>

              <div className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Offline Payments (Cash & Wallet)</span>
                  <Banknote size={20} className="text-amber-400" />
                </div>
                <p className="mt-3 font-display text-5xl text-amber-400">₹{offlineRevenue.toFixed(2)}</p>
                <p className="mt-2 text-xs text-amber-300/80">
                  {totalRevenue > 0 ? ((offlineRevenue / totalRevenue) * 100).toFixed(0) : 0}% of all payments
                </p>
              </div>
            </div>

            {/* Payment Method Breakdown Table */}
            <div className="rounded-2xl border border-[#2e3129] bg-[#242720] p-6">
              <h3 className="font-display text-xl text-[#fffdf7]">Payment Channels Summary</h3>
              <div className="mt-4 divide-y divide-[#2e3129] text-xs">
                {[
                  { channel: 'UPI (QR Code & Apps)', type: 'Online', count: orders.filter(o => o.paymentMethod.startsWith('upi')).length, sum: orders.filter(o => o.paymentMethod.startsWith('upi')).reduce((s, o) => s + o.totalAmount, 0) },
                  { channel: 'Online Cards / Payment Gateway', type: 'Online', count: orders.filter(o => o.paymentMethod === 'card_gateway').length, sum: orders.filter(o => o.paymentMethod === 'card_gateway').reduce((s, o) => s + o.totalAmount, 0) },
                  { channel: 'Cash on Pickup (Billing Desk)', type: 'Offline', count: orders.filter(o => o.paymentMethod === 'offline_cash').length, sum: orders.filter(o => o.paymentMethod === 'offline_cash').reduce((s, o) => s + o.totalAmount, 0) },
                  { channel: 'Campus Student Wallet', type: 'Offline', count: orders.filter(o => o.paymentMethod === 'campus_wallet').length, sum: orders.filter(o => o.paymentMethod === 'campus_wallet').reduce((s, o) => s + o.totalAmount, 0) },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-bold text-[#fffdf7]">{row.channel}</p>
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                        row.type === 'Online' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {row.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-[#fffdf7]">₹{row.sum.toFixed(2)}</p>
                      <p className="text-[11px] text-[#85877d]">{row.count} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-rose-900/50 bg-[#242720] p-6 text-[#f4f3ec] shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-950/80 border border-rose-800">
                <Trash2 size={20} />
              </span>
              <h3 className="font-display text-2xl text-[#fffdf7]">Remove Dish?</h3>
            </div>

            <p className="text-xs text-[#a5a79e] leading-5">
              Are you sure you want to delete <strong className="text-[#fffdf7]">{itemToDelete.name}</strong> from the campus menu? This item will immediately be removed for all students.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 rounded-xl border border-[#3b3e32] bg-[#1c1e19] py-3 text-xs font-bold text-[#85877d] hover:bg-[#252820]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMenuItem(itemToDelete.id)
                  setItemToDelete(null)
                }}
                className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white hover:bg-rose-500 shadow-md"
              >
                Yes, Delete Dish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Food Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[#3b3e32] bg-[#242720] p-6 text-[#f4f3ec] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2e3129] pb-4">
              <div>
                <h3 className="font-display text-2xl text-[#fffdf7]">Add New Food Item</h3>
                <p className="text-[11px] text-[#85877d]">Instantly publish a new dish to the campus menu</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-[#85877d] hover:bg-[#1c1e19]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Presets row */}
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#e6a117] mb-2">
                ⚡ Quick Preset Templates:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {QUICK_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="whitespace-nowrap rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-2.5 py-1 text-[11px] font-semibold text-[#a5a79e] hover:border-[#e6a117] hover:text-[#fffdf7] transition"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddNewItemSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#d1d0c5]">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Butter Paneer Kulcha"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3 text-sm text-white outline-none focus:border-[#e6a117]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#d1d0c5]">Category *</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3 text-sm text-white outline-none focus:border-[#e6a117]"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Quick bites">Quick bites</option>
                    <option value="Meals">Meals</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#d1d0c5]">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    step="1"
                    placeholder="e.g. 75"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3 text-sm text-white outline-none focus:border-[#e6a117]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#d1d0c5]">Prep Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 min"
                    value={newItemTime}
                    onChange={(e) => setNewItemTime(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3 text-sm text-white outline-none focus:border-[#e6a117]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#d1d0c5]">Highlight Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller, Chef Special"
                    value={newItemTag}
                    onChange={(e) => setNewItemTag(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3 text-sm text-white outline-none focus:border-[#e6a117]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#d1d0c5]">Kitchen Counter Station</label>
                <select
                  value={newItemCounter}
                  onChange={(e) => setNewItemCounter(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3 text-sm text-white outline-none focus:border-[#e6a117]"
                >
                  <option value="Counter 1 (South Kitchen)">Counter 1 (South Kitchen)</option>
                  <option value="Counter 1 (Main Meals)">Counter 1 (Main Meals)</option>
                  <option value="Counter 2 (Grill & Rolls)">Counter 2 (Grill & Rolls)</option>
                  <option value="Counter 2 (Fast Food)">Counter 2 (Fast Food)</option>
                  <option value="Counter 3 (Beverage Bar)">Counter 3 (Beverage Bar)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#d1d0c5]">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, taste, serving notes..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] p-3 text-sm text-white outline-none focus:border-[#e6a117]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#d1d0c5]">Dish Image URL or File Upload</label>
                  <label className="cursor-pointer text-[10px] font-bold text-[#e6a117] hover:underline flex items-center gap-1">
                    <Upload size={12} />
                    <span>Upload from device</span>
                    <input type="file" accept="image/*" onChange={handleItemImageUpload} className="hidden" />
                  </label>
                </div>
                <input
                  type="text"
                  value={newItemImage}
                  onChange={(e) => setNewItemImage(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#3b3e32] bg-[#1c1e19] px-3 text-xs text-white outline-none focus:border-[#e6a117]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#2e3129]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-[#3b3e32] bg-[#1c1e19] py-3 text-xs font-bold text-[#85877d] hover:bg-[#2c3026]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#e6a117] py-3 text-xs font-bold text-[#23251f] hover:bg-[#f0b12a]"
                >
                  Add to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
