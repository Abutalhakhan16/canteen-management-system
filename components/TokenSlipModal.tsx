'use client'

import React from 'react'
import {
  X,
  PackageCheck,
  Clock,
  MapPin,
  Printer,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { OrderToken } from '../lib/types'

interface TokenSlipModalProps {
  isOpen: boolean
  onClose: () => void
  token: OrderToken | null
  onViewAllOrders?: () => void
}

const STATUS_STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'preparing', label: 'In Kitchen' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'completed', label: 'Collected' },
]

export function TokenSlipModal({
  isOpen,
  onClose,
  token,
  onViewAllOrders,
}: TokenSlipModalProps) {
  if (!isOpen || !token) return null

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === token.orderStatus)
  const isCashPending = token.paymentStatus === 'pending_cash'

  const handlePrint = () => {
    window.print()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#191a16]/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#deded5] bg-[#fffdf7] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Token Header Banner */}
        <div className="relative overflow-hidden bg-[#e6a117] p-6 text-[#29271e]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full bg-[#29271e] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#fff9e8]">
              <PackageCheck size={14} /> Token Generated
            </span>
            <button
              onClick={onClose}
              className="rounded-full bg-[#29271e]/15 p-1.5 text-[#29271e] transition hover:bg-[#29271e]/30"
              aria-label="Close token modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Big Token Display */}
          <div className="mt-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.25em] text-[#6f4c00]">
              Your Kitchen Pickup Token
            </p>
            <div className="my-1 font-display text-7xl font-semibold tracking-tight sm:text-8xl">
              {token.tokenNumber}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#443003]">
              <Clock size={14} />
              <span>Estimated Pickup: {token.estimatedReadyTime}</span>
            </div>
          </div>

          {/* Decorative jagged tear line at bottom */}
          <div className="absolute -bottom-1 left-0 right-0 flex justify-between overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="inline-block h-2 w-3 rotate-45 bg-[#fffdf7]" />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Stepper */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#797b72] mb-2">
              <span>Order Progress</span>
              <span className="uppercase text-[#c17e00]">
                {STATUS_STEPS[currentStepIndex]?.label ?? 'Processing'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex
                const isCurrent = idx === currentStepIndex
                return (
                  <div key={step.key} className="flex flex-col gap-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-[#e6a117] ring-2 ring-[#e6a117]/30'
                          : isPassed
                          ? 'bg-[#29271e]'
                          : 'bg-[#e3e1d5]'
                      }`}
                    />
                    <span className={`text-[9px] font-bold leading-tight ${
                      isPassed ? 'text-[#23251f]' : 'text-[#a2a39a]'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pickup Counter Card */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#deded5] bg-[#f8f7f2] p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#23251f] text-[#e6a117]">
              <MapPin size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8d83]">Pickup Station</p>
              <p className="font-display text-lg text-[#23251f]">{token.pickupCounter}</p>
              <p className="text-xs text-[#797b72]">Flash token on screen when your number is called</p>
            </div>
          </div>

          {/* Payment Status Notice */}
          {isCashPending ? (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs">
              <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  Offline Payment: Pay ₹{token.totalAmount.toFixed(2)} Cash at Counter
                </p>
                <p className="mt-0.5 text-amber-800">
                  Please pay cash to the cashier at Counter 1 prior to receiving your tray.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  Paid Online ({token.paymentMethodName})
                </p>
                <p className="text-[11px] text-emerald-700">
                  Ref: {token.transactionId || 'CAMPUS-TXN'} · Verified & Confirmed
                </p>
              </div>
            </div>
          )}

          {/* Itemized Order Breakdown */}
          <div className="rounded-2xl border border-[#deded5] bg-[#fffdf7] p-4">
            <div className="flex items-center justify-between border-b border-[#ecebe4] pb-2 text-xs font-bold text-[#8b8d83]">
              <span>Items Ordered</span>
              <span>Subtotal</span>
            </div>
            <div className="divide-y divide-[#ecebe4] text-xs">
              {token.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[#f0e3c8] text-[10px] font-bold text-[#9b6200]">
                      {item.quantity}×
                    </span>
                    <span className="font-semibold text-[#23251f]">{item.name}</span>
                  </div>
                  <span className="font-mono font-medium text-[#23251f]">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#ecebe4] pt-3 text-sm font-bold text-[#23251f]">
              <span>Grand Total</span>
              <span className="font-display text-xl">₹{token.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Student metadata */}
          <div className="flex items-center justify-between text-[11px] text-[#8b8d83] px-1">
            <span>Customer: <strong>{token.customerName}</strong> ({token.customerRoll})</span>
            <span>Ordered at: <strong>{token.createdAt}</strong></span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="border-t border-[#ecebe4] bg-[#f8f7f2] p-4 flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#deded5] bg-[#fffdf7] px-4 py-3 text-xs font-bold text-[#23251f] hover:bg-[#ecebe4]"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Print Token</span>
          </button>

          {onViewAllOrders && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onViewAllOrders()
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#23251f] px-4 py-3 text-xs font-bold text-[#fffdf7] hover:bg-[#3d4037]"
            >
              <span>Track in My Orders</span>
              <ArrowRight size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#deded5] bg-[#fffdf7] px-4 py-3 text-xs font-bold text-[#797b72] hover:bg-[#ecebe4]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
