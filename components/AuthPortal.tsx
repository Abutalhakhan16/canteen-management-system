'use client'

import React, { useState } from 'react'
import {
  Store,
  UserRound,
  ShieldCheck,
  ArrowRight,
  Phone,
  LockKeyhole,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react'

export interface CustomerUser {
  name: string
  phone: string
  password?: string
  roll?: string
}

interface AuthPortalProps {
  onCustomerLogin: (customer: CustomerUser) => void
  onAdminLogin: () => void
}

const PRESEEDED_CUSTOMERS: CustomerUser[] = [
  {
    name: 'Arjun Mehta',
    phone: '9876543210',
    password: 'password123',
    roll: '22CS1047',
  },
]

export function AuthPortal({ onCustomerLogin, onAdminLogin }: AuthPortalProps) {
  // Screen mode: 'choose' | 'customer' | 'admin'
  const [selectedRole, setSelectedRole] = useState<'choose' | 'customer' | 'admin'>('choose')

  // Customer sub-tab: 'login' | 'register'
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login')

  // Customer login fields
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Customer register fields
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  // Error & notice message
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Load registered users from localStorage
  const getRegisteredUsers = (): CustomerUser[] => {
    try {
      const stored = localStorage.getItem('canteen_registered_users_v2')
      if (stored) {
        const parsed = JSON.parse(stored)
        return [...PRESEEDED_CUSTOMERS, ...parsed.filter((u: CustomerUser) => u.phone !== '9876543210')]
      }
    } catch (e) {
      console.warn('Failed reading users:', e)
    }
    return PRESEEDED_CUSTOMERS
  }

  // Handle Customer Login
  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const cleanPhone = loginPhone.trim().replace(/\D/g, '')

    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.')
      return
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.')
      return
    }

    const allUsers = getRegisteredUsers()
    const found = allUsers.find((u) => u.phone.replace(/\D/g, '') === cleanPhone)

    if (!found) {
      setErrorMsg('No account found with this phone number. Please click "Create Account" below.')
      return
    }

    if (found.password && found.password !== loginPassword) {
      setErrorMsg('Incorrect password. Please verify and try again.')
      return
    }

    onCustomerLogin(found)
  }

  // Handle Customer Account Creation
  const handleCustomerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const cleanPhone = regPhone.trim().replace(/\D/g, '')

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.')
      return
    }
    if (regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters.')
      return
    }

    const allUsers = getRegisteredUsers()
    const existing = allUsers.find((u) => u.phone.replace(/\D/g, '') === cleanPhone)
    if (existing) {
      setErrorMsg('An account with this phone number already exists! Please click "Log In".')
      return
    }

    const newUser: CustomerUser = {
      name: regName.trim(),
      phone: cleanPhone,
      password: regPassword,
      roll: `ID-${cleanPhone.slice(-4)}`,
    }

    try {
      const stored = localStorage.getItem('canteen_registered_users_v2')
      const existingList = stored ? JSON.parse(stored) : []
      localStorage.setItem('canteen_registered_users_v2', JSON.stringify([...existingList, newUser]))
    } catch (e) {
      console.warn('Failed saving user:', e)
    }

    setSuccessMsg('Account created successfully! Logging you in...')
    setTimeout(() => {
      onCustomerLogin(newUser)
    }, 600)
  }

  // Handle Admin Login (Strictly admin@canteen.com / 1234567890)
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanEmail = adminEmail.trim().toLowerCase()
    const cleanPassword = adminPassword

    if (cleanEmail === 'admin@canteen.com' && cleanPassword === '1234567890') {
      onAdminLogin()
    } else {
      setErrorMsg('Access Denied: Admin login can only be done through admin@canteen.com and password 1234567890.')
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f2] px-5 py-8 text-[#23251f] sm:px-8 lg:px-12 flex items-center justify-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#deded5] bg-[#fffdf7] shadow-[0_20px_70px_rgba(35,37,31,.12)]">
        {/* Top Header Bar inside card */}
        <div className="flex items-center justify-between border-b border-[#ecebe4] bg-[#23251f] px-6 py-5 text-[#fffdf7] sm:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6a117] text-[#23251f] shadow-md">
              <Store size={22} strokeWidth={2.5} />
            </span>
            <div>
              <span className="block font-display text-2xl font-bold leading-tight">Common Ground</span>
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a5a79e]">
                Campus Canteen System
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#3b3e34] px-3 py-1 text-xs font-semibold text-[#f1c55d]">
            <Sparkles size={14} />
            <span>Live Kitchen & Online/Offline Orders</span>
          </div>
        </div>

        {/* SCREEN 1: 2 LOGIN OPTIONS (Customer vs Admin) */}
        {selectedRole === 'choose' && (
          <div className="p-8 sm:p-12">
            <div className="max-w-xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-[#c17e00]">
                Access Gateway
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-[#23251f] sm:text-5xl">
                Who is signing in today?
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#797b72]">
                Select your account type to proceed to the dedicated workspace.
              </p>
            </div>

            {/* 2 Primary Choice Cards */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {/* Option 1: Customer */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('customer')
                  setErrorMsg('')
                }}
                className="group flex flex-col justify-between rounded-3xl border-2 border-[#deded5] bg-[#f8f7f2] p-7 text-left transition-all hover:border-[#e6a117] hover:bg-[#fff9e8] hover:shadow-lg"
              >
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6a117] text-[#23251f] shadow-sm transition group-hover:scale-105">
                    <UserRound size={26} />
                  </div>
                  <span className="mt-5 block font-display text-3xl font-bold text-[#23251f]">
                    Customer
                  </span>
                  <p className="mt-2 text-xs leading-5 text-[#797b72]">
                    Order meals from the live menu, pay via <strong>UPI, Cards, or Offline Cash</strong>, and get instant pickup tokens.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#23251f] group-hover:text-[#c17e00]">
                  <span>Sign in with Phone & Password</span>
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </button>

              {/* Option 2: Admin */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin')
                  setErrorMsg('')
                }}
                className="group flex flex-col justify-between rounded-3xl border-2 border-[#deded5] bg-[#f8f7f2] p-7 text-left transition-all hover:border-[#23251f] hover:bg-[#23251f] hover:text-[#fffdf7] hover:shadow-lg"
              >
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#23251f] text-[#fffdf7] shadow-sm transition group-hover:bg-[#e6a117] group-hover:text-[#23251f] group-hover:scale-105">
                    <ShieldCheck size={26} />
                  </div>
                  <span className="mt-5 block font-display text-3xl font-bold group-hover:text-[#fffdf7]">
                    Admin
                  </span>
                  <p className="mt-2 text-xs leading-5 text-[#797b72] group-hover:text-[#d1d0c5]">
                    Kitchen live token queue, order preparation stepper, stock toggle, food addition/removal, and money receiving QR settings.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#23251f] group-hover:text-[#e6a117]">
                  <span>Authorized Admin Portal</span>
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-[#9a9b91]">
              Secure Campus Canteen Portal · Orders sync between Customer and Admin in real time
            </p>
          </div>
        )}

        {/* SCREEN 2: CUSTOMER AUTH (Login / Create Account) */}
        {selectedRole === 'customer' && (
          <div className="p-8 sm:p-12">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('choose')
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#85877d] hover:text-[#23251f]"
            >
              ← Back to account type
            </button>

            <div className="max-w-md">
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#c17e00]">
                Customer Access
              </span>
              <h2 className="mt-1 font-display text-4xl font-bold text-[#23251f]">
                {customerMode === 'login' ? 'Welcome back.' : 'Create customer account.'}
              </h2>
              <p className="mt-1 text-xs text-[#797b72]">
                {customerMode === 'login'
                  ? 'Sign in with your registered phone number and password to order.'
                  : 'Register your mobile number and password to start ordering.'}
              </p>

              {/* Login vs Register Switch */}
              <div className="mt-6 flex rounded-2xl bg-[#ecebe4]/70 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('login')
                    setErrorMsg('')
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                    customerMode === 'login' ? 'bg-[#fffdf7] text-[#23251f] shadow-sm' : 'text-[#797b72]'
                  }`}
                >
                  <LogIn size={15} />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('register')
                    setErrorMsg('')
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                    customerMode === 'register' ? 'bg-[#fffdf7] text-[#23251f] shadow-sm' : 'text-[#797b72]'
                  }`}
                >
                  <UserPlus size={15} />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Error & Success Alerts */}
              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* CUSTOMER LOGIN FORM */}
              {customerMode === 'login' && (
                <form onSubmit={handleCustomerLoginSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#23251f]">Phone Number</label>
                    <div className="relative mt-1">
                      <Phone size={16} className="absolute left-3.5 top-3.5 text-[#9a9b91]" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                        className="h-11 w-full rounded-xl border border-[#deded5] bg-[#f8f7f2] pl-10 pr-4 text-sm outline-none focus:border-[#e6a117] focus:ring-1 focus:ring-[#e6a117]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#23251f]">Password</label>
                    <div className="relative mt-1">
                      <LockKeyhole size={16} className="absolute left-3.5 top-3.5 text-[#9a9b91]" />
                      <input
                        type="password"
                        required
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-11 w-full rounded-xl border border-[#deded5] bg-[#f8f7f2] pl-10 pr-4 text-sm outline-none focus:border-[#e6a117] focus:ring-1 focus:ring-[#e6a117]"
                      />
                    </div>
                  </div>

                  {/* Autofill test customer */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginPhone('9876543210')
                      setLoginPassword('password123')
                    }}
                    className="text-[11px] font-bold text-[#c17e00] hover:underline flex items-center gap-1"
                  >
                    ⚡ Autofill Demo Customer (9876543210)
                  </button>

                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#23251f] text-sm font-bold text-[#fffdf7] shadow-md transition hover:bg-[#3d4037]"
                  >
                    <span>Sign In & Open Canteen Menu</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* CUSTOMER CREATE ACCOUNT FORM */}
              {customerMode === 'register' && (
                <form onSubmit={handleCustomerRegisterSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#23251f]">Your Full Name</label>
                    <div className="relative mt-1">
                      <UserRound size={16} className="absolute left-3.5 top-3.5 text-[#9a9b91]" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="h-11 w-full rounded-xl border border-[#deded5] bg-[#f8f7f2] pl-10 pr-4 text-sm outline-none focus:border-[#e6a117] focus:ring-1 focus:ring-[#e6a117]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#23251f]">Phone Number (10 digits)</label>
                    <div className="relative mt-1">
                      <Phone size={16} className="absolute left-3.5 top-3.5 text-[#9a9b91]" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="e.g. 9811223344"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                        className="h-11 w-full rounded-xl border border-[#deded5] bg-[#f8f7f2] pl-10 pr-4 text-sm outline-none focus:border-[#e6a117] focus:ring-1 focus:ring-[#e6a117]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#23251f]">Create Password</label>
                    <div className="relative mt-1">
                      <LockKeyhole size={16} className="absolute left-3.5 top-3.5 text-[#9a9b91]" />
                      <input
                        type="password"
                        required
                        placeholder="At least 4 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="h-11 w-full rounded-xl border border-[#deded5] bg-[#f8f7f2] pl-10 pr-4 text-sm outline-none focus:border-[#e6a117] focus:ring-1 focus:ring-[#e6a117]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e6a117] text-sm font-bold text-[#23251f] shadow-md transition hover:bg-[#f0b12a]"
                  >
                    <span>Create Account & Start Ordering</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 3: ADMIN AUTH (Strictly admin@canteen.com / 1234567890) */}
        {selectedRole === 'admin' && (
          <div className="p-8 sm:p-12">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('choose')
                setErrorMsg('')
              }}
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#85877d] hover:text-[#23251f]"
            >
              ← Back to account type
            </button>

            <div className="max-w-md">
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#c17e00]">
                Staff & Kitchen Console
              </span>
              <h2 className="mt-1 font-display text-4xl font-bold text-[#23251f]">
                Admin Sign In.
              </h2>
              <p className="mt-1 text-xs text-[#797b72]">
                Admin access is restricted to authorized personnel only.
              </p>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#23251f]">Admin Email</label>
                  <div className="relative mt-1">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-[#9a9b91]" />
                    <input
                      type="email"
                      required
                      placeholder="admin@canteen.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#deded5] bg-[#f8f7f2] pl-10 pr-4 text-sm outline-none focus:border-[#e6a117] focus:ring-1 focus:ring-[#e6a117]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#23251f]">Password</label>
                  <div className="relative mt-1">
                    <LockKeyhole size={16} className="absolute left-3.5 top-3.5 text-[#9a9b91]" />
                    <input
                      type="password"
                      required
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#deded5] bg-[#f8f7f2] pl-10 pr-4 text-sm outline-none focus:border-[#e6a117] focus:ring-1 focus:ring-[#e6a117]"
                    />
                  </div>
                </div>

                {/* Autofill Admin Credentials helper */}
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('admin@canteen.com')
                    setAdminPassword('1234567890')
                  }}
                  className="text-[11px] font-bold text-[#c17e00] hover:underline flex items-center gap-1"
                >
                  ⚡ Autofill Required Admin Credentials (admin@canteen.com)
                </button>

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#23251f] text-sm font-bold text-[#fffdf7] shadow-md transition hover:bg-[#3d4037]"
                >
                  <ShieldCheck size={17} className="text-[#e6a117]" />
                  <span>Authenticate Admin</span>
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-[#f0e3c8]/60 p-3 text-[11px] text-[#795400] border border-[#e6a117]/30">
                <strong>Admin Credential Policy:</strong> Email must be <code>admin@canteen.com</code> and password <code>1234567890</code>.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
