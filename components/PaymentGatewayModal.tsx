'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  WalletCards,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { CartItem, PaymentCategory, PaymentMethod, PaymentStatus, UpiSettings } from '../lib/types'
import { UpiQrCode } from './UpiQrCode'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  totalAmount: number
  customerName: string
  customerRoll: string
  walletBalance: number
  upiSettings?: UpiSettings
  onOrderSuccess: (orderData: {
    paymentCategory: PaymentCategory
    paymentMethod: PaymentMethod
    paymentMethodName: string
    paymentStatus: PaymentStatus
    transactionId?: string
    notes?: string
  }) => void
}

export function PaymentGatewayModal({
  isOpen,
  onClose,
  cart,
  totalAmount,
  customerName,
  customerRoll,
  walletBalance,
  upiSettings,
  onOrderSuccess,
}: PaymentModalProps) {
  // Main tabs: 'online' or 'offline'
  const [paymentCategory, setPaymentCategory] = useState<PaymentCategory>('online')
  
  // Online sub-method: 'upi' or 'card'
  const [onlineTab, setOnlineTab] = useState<'upi' | 'card'>('upi')
  // UPI sub-mode: 'qr' | 'apps' | 'id'
  const [upiSubMode, setUpiSubMode] = useState<'qr' | 'apps' | 'id'>('qr')
  
  // Offline sub-method: 'cash' or 'wallet'
  const [offlineTab, setOfflineTab] = useState<'cash' | 'wallet'>('cash')

  // Form states
  const [upiIdInput, setUpiIdInput] = useState('')
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay')
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState(customerName || '')
  
  // Loading & status
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [countdown, setCountdown] = useState(300) // 5 minutes for UPI QR

  // Countdown timer for QR
  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen])

  if (!isOpen) return null

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = val.replace(/(\d{4})/g, '$1 ').trim()
    setCardNumber(formatted)
  }

  // Format card expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2)
    }
    setCardExpiry(val)
  }

  // Execute Payment Simulation & Token Generation
  const executePayment = async (
    method: PaymentMethod,
    methodName: string,
    category: PaymentCategory,
    status: PaymentStatus,
    customNotes?: string
  ) => {
    setErrorMessage('')
    setIsProcessing(true)

    try {
      if (category === 'online') {
        setProcessingStep('Connecting to secure payment gateway...')
        await new Promise((r) => setTimeout(r, 600))
        setProcessingStep('Verifying transaction with bank...')
        await new Promise((r) => setTimeout(r, 700))
        setProcessingStep('Authorizing payment and issuing token...')
        await new Promise((r) => setTimeout(r, 500))
      } else {
        setProcessingStep('Confirming order with kitchen & generating pickup token...')
        await new Promise((r) => setTimeout(r, 600))
      }

      const randomTxn = `${category === 'online' ? 'ONL' : 'OFF'}-${Date.now().toString().slice(-6)}`

      onOrderSuccess({
        paymentCategory: category,
        paymentMethod: method,
        paymentMethodName: methodName,
        paymentStatus: status,
        transactionId: randomTxn,
        notes: customNotes,
      })
      onClose()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Payment could not be processed. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  // UPI QR simulation
  const handleUpiQrSuccess = () => {
    executePayment('upi_qr', 'UPI QR Code', 'online', 'paid', 'Scanned and verified via UPI QR')
  }

  // UPI App click
  const handleUpiAppPay = (appName: string) => {
    executePayment('upi_app', `UPI (${appName})`, 'online', 'paid', `Paid via ${appName} Intent`)
  }

  // UPI ID request
  const handleUpiIdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!upiIdInput.trim() || !upiIdInput.includes('@')) {
      setErrorMessage('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or rollno@paytm)')
      return
    }
    executePayment('upi_id', `UPI ID (${upiIdInput})`, 'online', 'paid', `Requested to ${upiIdInput}`)
  }

  // Card Gateway submit
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanNum = cardNumber.replace(/\s/g, '')
    if (cleanNum.length < 15) {
      setErrorMessage('Please enter a valid 16-digit debit/credit card number')
      return
    }
    if (cardExpiry.length < 5) {
      setErrorMessage('Please enter card expiry in MM/YY format')
      return
    }
    if (cardCvv.length < 3) {
      setErrorMessage('Please enter a valid 3-digit CVV')
      return
    }
    executePayment('card_gateway', 'Online Payment Gateway (Card)', 'online', 'paid', `Card ending with **${cleanNum.slice(-4)}`)
  }

  // Offline Cash submit
  const handleOfflineCashOrder = () => {
    executePayment(
      'offline_cash',
      'Pay with Cash on Pickup',
      'offline',
      'pending_cash',
      `Please collect ₹${totalAmount} in cash at billing desk`
    )
  }

  // Campus Wallet submit
  const handleCampusWalletOrder = () => {
    if (walletBalance < totalAmount) {
      setErrorMessage(`Insufficient wallet balance (₹${walletBalance.toFixed(2)}). Need ₹${totalAmount}. Please choose Cash or Online.`)
      return
    }
    executePayment(
      'campus_wallet',
      'Campus Student Wallet',
      'offline',
      'paid',
      `Auto-debited ₹${totalAmount} from roll #${customerRoll}`
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191a16]/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#deded5] bg-[#fffdf7] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ecebe4] bg-[#f8f7f2] px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6a117] text-[11px] font-black text-[#23251f]">₹</span>
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#9a9b91]">Checkout & Payment Gateway</p>
            </div>
            <h2 className="mt-1 font-display text-2xl tracking-tight text-[#23251f]">
              Choose Payment Method
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#797b72]">Payable Amount</p>
              <p className="font-display text-2xl text-[#23251f]">₹{totalAmount.toFixed(2)}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-full p-2 text-[#797b72] transition hover:bg-[#ecebe4] hover:text-[#23251f] disabled:opacity-50"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#fffdf7]/95 p-6 backdrop-blur-sm">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0e3c8] text-[#9b6200]">
              <Loader2 size={32} className="animate-spin text-[#9b6200]" />
            </div>
            <h3 className="font-display text-2xl text-[#23251f]">Processing Your Payment</h3>
            <p className="mt-2 text-center text-sm font-medium text-[#797b72]">{processingStep}</p>
            <div className="mt-6 flex items-center gap-2 rounded-full bg-[#f8f7f2] px-4 py-2 text-xs font-semibold text-[#8b8d83]">
              <ShieldCheck size={16} className="text-emerald-600" />
              128-bit Encrypted Campus Gateway
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-6 py-3 text-xs font-semibold text-rose-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Payment Category Selector: Online vs Offline */}
        <div className="grid grid-cols-2 border-b border-[#ecebe4] bg-[#f8f7f2] p-2 gap-2 text-sm font-bold">
          <button
            type="button"
            onClick={() => { setPaymentCategory('online'); setErrorMessage('') }}
            className={`flex items-center justify-center gap-2.5 rounded-2xl py-3 transition-all ${
              paymentCategory === 'online'
                ? 'bg-[#23251f] text-[#fffdf7] shadow-md'
                : 'bg-transparent text-[#6f7168] hover:bg-[#ecebe4]'
            }`}
          >
            <Sparkles size={17} className={paymentCategory === 'online' ? 'text-[#e6a117]' : 'text-[#9a9b91]'} />
            <span>Online Payment</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
              paymentCategory === 'online' ? 'bg-[#e6a117] text-[#23251f]' : 'bg-[#e7e5dc] text-[#55574f]'
            }`}>
              UPI & Cards
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setPaymentCategory('offline'); setErrorMessage('') }}
            className={`flex items-center justify-center gap-2.5 rounded-2xl py-3 transition-all ${
              paymentCategory === 'offline'
                ? 'bg-[#23251f] text-[#fffdf7] shadow-md'
                : 'bg-transparent text-[#6f7168] hover:bg-[#ecebe4]'
            }`}
          >
            <Banknote size={17} className={paymentCategory === 'offline' ? 'text-[#e6a117]' : 'text-[#9a9b91]'} />
            <span>Offline Payment</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
              paymentCategory === 'offline' ? 'bg-[#e6a117] text-[#23251f]' : 'bg-[#e7e5dc] text-[#55574f]'
            }`}>
              Cash & Wallet
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ONLINE PAYMENT CONTENT */}
          {paymentCategory === 'online' && (
            <div className="space-y-6">
              {/* Online Sub-Tabs: UPI vs Card Gateway */}
              <div className="flex gap-2 rounded-xl bg-[#ecebe4]/70 p-1">
                <button
                  type="button"
                  onClick={() => { setOnlineTab('upi'); setErrorMessage('') }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                    onlineTab === 'upi'
                      ? 'bg-[#fffdf7] text-[#23251f] shadow-sm'
                      : 'text-[#6f7168] hover:text-[#23251f]'
                  }`}
                >
                  <span className="flex h-5 w-7 items-center justify-center rounded bg-[#5e2786] text-[9px] font-black text-white">UPI</span>
                  <span>UPI Payment (Instant)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setOnlineTab('card'); setErrorMessage('') }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                    onlineTab === 'card'
                      ? 'bg-[#fffdf7] text-[#23251f] shadow-sm'
                      : 'text-[#6f7168] hover:text-[#23251f]'
                  }`}
                >
                  <CreditCard size={15} />
                  <span>Cards / Payment Gateway</span>
                </button>
              </div>

              {/* UPI Options */}
              {onlineTab === 'upi' && (
                <div className="space-y-4">
                  {/* UPI Sub-modes: QR, Apps, VPA ID */}
                  <div className="flex border-b border-[#ecebe4] pb-2 text-xs font-bold text-[#8b8d83]">
                    {[
                      { id: 'qr', label: 'Scan QR Code', icon: QrCode },
                      { id: 'apps', label: 'UPI Apps', icon: Smartphone },
                      { id: 'id', label: 'UPI ID / VPA', icon: ShieldCheck },
                    ].map((mode) => {
                      const Icon = mode.icon
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setUpiSubMode(mode.id as any)}
                          className={`flex items-center gap-1.5 border-b-2 px-4 py-2 transition ${
                            upiSubMode === mode.id
                              ? 'border-[#e6a117] text-[#23251f]'
                              : 'border-transparent hover:text-[#23251f]'
                          }`}
                        >
                          <Icon size={14} />
                          {mode.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Mode 1: UPI QR CODE */}
                  {upiSubMode === 'qr' && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#deded5] bg-[#f8f7f2] p-6 text-center">
                      <div className="mb-3 flex items-center gap-2 rounded-full bg-[#f0e3c8] px-3 py-1 text-[11px] font-bold text-[#9b6200]">
                        <span>Time remaining: {formatTimer(countdown)}</span>
                      </div>

                      {/* Dynamic/Custom UPI QR */}
                      <UpiQrCode
                        amount={totalAmount}
                        tokenRef={`TK-${Math.floor(100 + Math.random() * 900)}`}
                        size={210}
                        upiId={upiSettings?.upiId}
                        payeeName={upiSettings?.payeeName}
                        customQrImageUrl={upiSettings?.customQrImageUrl}
                        useCustomImage={upiSettings?.useCustomImage}
                      />

                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Cred'].map((app) => (
                          <span key={app} className="rounded-md border border-[#deded5] bg-[#fffdf7] px-2 py-1 text-[10px] font-semibold text-[#66685f]">
                            {app}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 w-full max-w-sm">
                        <button
                          type="button"
                          onClick={handleUpiQrSuccess}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#23251f] text-sm font-bold text-[#fffdf7] shadow-md transition hover:bg-[#3d4037]"
                        >
                          <CheckCircle2 size={18} className="text-[#e6a117]" />
                          <span>I Have Paid via UPI (Verify & Get Token)</span>
                        </button>
                        <p className="mt-2 text-[11px] text-[#85877d]">
                          Opens instant simulated verification and automatically generates your token.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: FAST UPI APPS SELECTOR */}
                  {upiSubMode === 'apps' && (
                    <div className="space-y-4">
                      <p className="text-xs text-[#797b72]">
                        Choose your preferred UPI application to authorize an instant ₹{totalAmount.toFixed(2)} payment:
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {[
                          { id: 'gpay', name: 'Google Pay', badge: 'GPay', color: 'bg-[#4285f4]' },
                          { id: 'phonepe', name: 'PhonePe', badge: 'Pe', color: 'bg-[#5f259f]' },
                          { id: 'paytm', name: 'Paytm UPI', badge: 'Paytm', color: 'bg-[#002e6e]' },
                          { id: 'bhim', name: 'BHIM UPI', badge: 'BHIM', color: 'bg-[#007b5e]' },
                          { id: 'cred', name: 'CRED Pay', badge: 'CRED', color: 'bg-[#181818]' },
                          { id: 'amazonpay', name: 'Amazon Pay', badge: 'aPay', color: 'bg-[#ff9900]' },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => handleUpiAppPay(app.name)}
                            className="group flex flex-col items-center justify-center rounded-2xl border border-[#deded5] bg-[#f8f7f2] p-4 text-center transition hover:border-[#e6a117] hover:bg-[#f0e3c8]"
                          >
                            <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm transition group-hover:scale-110 ${app.color}`}>
                              {app.badge}
                            </span>
                            <span className="mt-2 block text-xs font-bold text-[#23251f]">{app.name}</span>
                            <span className="mt-0.5 block text-[10px] text-[#85877d]">Instant Intent</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode 3: ENTER UPI ID */}
                  {upiSubMode === 'id' && (
                    <form onSubmit={handleUpiIdSubmit} className="space-y-4 rounded-2xl border border-[#deded5] bg-[#f8f7f2] p-5">
                      <div>
                        <label className="block text-xs font-bold text-[#23251f]">
                          Enter Your Virtual Payment Address (VPA / UPI ID)
                        </label>
                        <p className="mt-0.5 text-[11px] text-[#85877d]">
                          A payment request will be sent to your UPI app for approval.
                        </p>
                        <div className="relative mt-2">
                          <input
                            type="text"
                            required
                            placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                            value={upiIdInput}
                            onChange={(e) => setUpiIdInput(e.target.value)}
                            className="h-12 w-full rounded-xl border border-[#deded5] bg-[#fffdf7] px-4 text-sm font-medium outline-none transition focus:border-[#e6a117] focus:ring-2 focus:ring-[#e6a117]/20"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="text-[#85877d]">Popular handles:</span>
                        {['@okaxis', '@okhdfcbank', '@paytm', '@ybl', '@ibl'].map((handle) => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => {
                              const prefix = upiIdInput.includes('@') ? upiIdInput.split('@')[0] : upiIdInput || 'user'
                              setUpiIdInput(`${prefix}${handle}`)
                            }}
                            className="rounded-full bg-[#ecebe4] px-2.5 py-0.5 text-[11px] font-semibold text-[#55574f] hover:bg-[#deded5]"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>

                      <button
                        type="submit"
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#23251f] text-sm font-bold text-[#fffdf7] shadow-md transition hover:bg-[#3d4037]"
                      >
                        <span>Verify VPA & Pay ₹{totalAmount.toFixed(2)}</span>
                        <ArrowRight size={16} />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Card Payment Gateway */}
              {onlineTab === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="rounded-2xl border border-[#deded5] bg-[#f8f7f2] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#deded5] pb-3">
                      <span className="text-xs font-bold text-[#23251f]">Debit / Credit Card Gateway</span>
                      <div className="flex gap-1.5">
                        <span className="rounded bg-[#fffdf7] px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-[#deded5]">VISA</span>
                        <span className="rounded bg-[#fffdf7] px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-[#deded5]">Mastercard</span>
                        <span className="rounded bg-[#fffdf7] px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-[#deded5]">RuPay</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#23251f]">Card Number</label>
                      <div className="relative mt-1.5">
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4532 •••• •••• 8921"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="h-11 w-full rounded-xl border border-[#deded5] bg-[#fffdf7] pl-10 pr-4 text-sm font-mono tracking-wider outline-none transition focus:border-[#e6a117]"
                        />
                        <CreditCard size={18} className="absolute left-3 top-3 text-[#9a9b91]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#23251f]">Valid Thru</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="mt-1.5 h-11 w-full rounded-xl border border-[#deded5] bg-[#fffdf7] px-3 text-sm font-mono outline-none transition focus:border-[#e6a117]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#23251f]">CVV / CVC</label>
                        <div className="relative mt-1.5">
                          <input
                            type="password"
                            required
                            maxLength={4}
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="h-11 w-full rounded-xl border border-[#deded5] bg-[#fffdf7] pl-9 pr-3 text-sm font-mono outline-none transition focus:border-[#e6a117]"
                          />
                          <Lock size={15} className="absolute left-3 top-3 text-[#9a9b91]" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#23251f]">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Name on card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#deded5] bg-[#fffdf7] px-4 text-sm outline-none transition focus:border-[#e6a117]"
                      />
                    </div>
                  </div>

                  {/* Quick autofill for fast testing */}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('4532 8901 2345 8921')
                        setCardExpiry('12/28')
                        setCardCvv('789')
                        setCardName(customerName || 'Arjun Mehta')
                      }}
                      className="text-[#9b6200] font-bold hover:underline"
                    >
                      ⚡ Autofill Test Card Details
                    </button>
                    <span className="flex items-center gap-1 text-[#85877d]">
                      <Lock size={12} /> 256-bit SSL Gateway
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#23251f] text-sm font-bold text-[#fffdf7] shadow-md transition hover:bg-[#3d4037]"
                  >
                    <span>Pay ₹{totalAmount.toFixed(2)} via Secure Gateway</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* OFFLINE PAYMENT CONTENT */}
          {paymentCategory === 'offline' && (
            <div className="space-y-6">
              {/* Offline Sub-tabs: Cash at Counter vs Campus Wallet */}
              <div className="flex gap-2 rounded-xl bg-[#ecebe4]/70 p-1">
                <button
                  type="button"
                  onClick={() => { setOfflineTab('cash'); setErrorMessage('') }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                    offlineTab === 'cash'
                      ? 'bg-[#fffdf7] text-[#23251f] shadow-sm'
                      : 'text-[#6f7168] hover:text-[#23251f]'
                  }`}
                >
                  <Banknote size={16} />
                  <span>Pay Cash on Pickup (Counter)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setOfflineTab('wallet'); setErrorMessage('') }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                    offlineTab === 'wallet'
                      ? 'bg-[#fffdf7] text-[#23251f] shadow-sm'
                      : 'text-[#6f7168] hover:text-[#23251f]'
                  }`}
                >
                  <WalletCards size={16} />
                  <span>Campus Wallet Balance</span>
                </button>
              </div>

              {/* Option 1: Cash at Counter */}
              {offlineTab === 'cash' && (
                <div className="rounded-2xl border border-[#deded5] bg-[#f8f7f2] p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0e3c8] text-[#9b6200]">
                      <Banknote size={24} />
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-[#23251f]">Pay Cash at the Billing Counter</h3>
                      <p className="mt-1 text-xs leading-5 text-[#797b72]">
                        Order now and pick up without delay. Your pickup token will be generated right away and sent to the kitchen queue.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-amber-900">
                      <span>Cash Payable on Pickup:</span>
                      <span className="text-sm">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-amber-800">
                      📍 Please keep exact change ready and present your <strong>Pickup Token</strong> at Counter 1 / Cashier when collecting your food.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOfflineCashOrder}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#23251f] text-sm font-bold text-[#fffdf7] shadow-md transition hover:bg-[#3d4037]"
                  >
                    <span>Generate Token (Pay Cash ₹{totalAmount.toFixed(2)} Later)</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Option 2: Campus Wallet */}
              {offlineTab === 'wallet' && (
                <div className="rounded-2xl border border-[#deded5] bg-[#f8f7f2] p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#23251f] text-[#e6a117]">
                        <WalletCards size={24} />
                      </span>
                      <div>
                        <h3 className="font-display text-xl text-[#23251f]">Campus Student Wallet</h3>
                        <p className="mt-1 text-xs text-[#797b72]">
                          Linked to Roll #{customerRoll} · Prepaid Canteen Credits
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#deded5] bg-[#fffdf7] p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a9b91]">Current Balance</p>
                      <p className="mt-1 font-display text-3xl text-[#23251f]">₹{walletBalance.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a9b91]">Balance After Order</p>
                      <p className={`mt-1 font-display text-xl ${
                        walletBalance >= totalAmount ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        ₹{(walletBalance - totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {walletBalance < totalAmount ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      ⚠️ Insufficient balance to pay for this order. Please use <strong>Cash on Pickup</strong> or <strong>Online UPI</strong>.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCampusWalletOrder}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#23251f] text-sm font-bold text-[#fffdf7] shadow-md transition hover:bg-[#3d4037]"
                    >
                      <CheckCircle2 size={18} className="text-[#e6a117]" />
                      <span>Deduct ₹{totalAmount.toFixed(2)} & Generate Token</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Order Summary Line */}
        <div className="border-t border-[#ecebe4] bg-[#f8f7f2] px-6 py-3.5 flex items-center justify-between text-xs text-[#797b72]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-600" />
            Verified Canteen Merchant ID: <strong>CAMPUS-FOOD-008</strong>
          </span>
          <span className="font-semibold">{cart.reduce((s, i) => s + i.quantity, 0)} items in tray</span>
        </div>
      </div>
    </div>
  )
}
