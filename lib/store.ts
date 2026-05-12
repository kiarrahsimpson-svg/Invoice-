import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  name: string
  email: string
  pro: boolean
}

export interface LineItem {
  desc: string
  qty: number
  rate: number
}

export interface Invoice {
  id: string
  fromName: string
  fromTagline: string
  fromEmail: string
  fromAddress: string
  toName: string
  toEmail: string
  toAddress: string
  invNumber: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  invDate: string
  dueDate: string
  currency: string
  taxRate: number
  notes: string
  payment: string
  items: LineItem[]
  total: number
  savedAt: number
}

interface AuthState {
  users: Record<string, { name: string; email: string; ph: string; pro: boolean; createdAt: number }>
  currentUser: User | null
  session: string | null
}

interface InvoiceState {
  invoices: Record<string, Invoice[]>
  editingId: string | null
}

interface AppState extends AuthState, InvoiceState {
  // Auth actions
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string }
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  grantPro: () => void
  isPro: () => boolean
  
  // Invoice actions
  getInvoices: () => Invoice[]
  saveInvoice: (invoice: Omit<Invoice, 'id' | 'savedAt'>) => { success: boolean; error?: string }
  deleteInvoice: (id: string) => void
  setEditingId: (id: string | null) => void
}

function simpleHash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i)
  }
  return (h >>> 0).toString(36)
}

const FREE_LIMIT = 3

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: {},
      currentUser: null,
      session: null,
      invoices: {},
      editingId: null,

      signup: (name, email, password) => {
        const normalizedEmail = email.trim().toLowerCase()
        const { users } = get()
        
        if (!name.trim()) return { success: false, error: 'Please enter your name.' }
        if (!normalizedEmail.includes('@')) return { success: false, error: 'Enter a valid email address.' }
        if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' }
        if (users[normalizedEmail]) return { success: false, error: 'An account with that email already exists.' }

        const newUser = {
          name: name.trim(),
          email: normalizedEmail,
          ph: simpleHash(password),
          pro: false,
          createdAt: Date.now(),
        }

        set({
          users: { ...users, [normalizedEmail]: newUser },
          currentUser: { name: name.trim(), email: normalizedEmail, pro: false },
          session: normalizedEmail,
        })

        return { success: true }
      },

      login: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase()
        const { users } = get()
        const user = users[normalizedEmail]

        if (!user || user.ph !== simpleHash(password)) {
          return { success: false, error: 'Incorrect email or password.' }
        }

        set({
          currentUser: { name: user.name, email: user.email, pro: user.pro },
          session: normalizedEmail,
        })

        return { success: true }
      },

      logout: () => {
        set({ currentUser: null, session: null, editingId: null })
      },

      grantPro: () => {
        const { currentUser, users } = get()
        if (!currentUser) return

        const updatedUsers = {
          ...users,
          [currentUser.email]: { ...users[currentUser.email], pro: true },
        }

        set({
          users: updatedUsers,
          currentUser: { ...currentUser, pro: true },
        })
      },

      isPro: () => {
        const { currentUser, users } = get()
        if (!currentUser) return false
        return users[currentUser.email]?.pro ?? false
      },

      getInvoices: () => {
        const { currentUser, invoices } = get()
        if (!currentUser) return []
        return invoices[currentUser.email] || []
      },

      saveInvoice: (invoiceData) => {
        const { currentUser, invoices, editingId, isPro } = get()
        if (!currentUser) return { success: false, error: 'Please sign in to save invoices.' }

        const userInvoices = [...(invoices[currentUser.email] || [])]
        const existingIndex = editingId ? userInvoices.findIndex(i => i.id === editingId) : -1
        const isNew = existingIndex < 0

        if (isNew && !isPro() && userInvoices.length >= FREE_LIMIT) {
          return { success: false, error: 'limit_reached' }
        }

        const newId = isNew ? `inv_${Date.now()}` : editingId!
        const invoice: Invoice = {
          ...invoiceData,
          id: newId,
          savedAt: Date.now(),
        }

        if (isNew) {
          userInvoices.unshift(invoice)
        } else {
          userInvoices[existingIndex] = invoice
        }

        set({
          invoices: { ...invoices, [currentUser.email]: userInvoices },
          editingId: newId,
        })

        return { success: true }
      },

      deleteInvoice: (id) => {
        const { currentUser, invoices, editingId } = get()
        if (!currentUser) return

        const userInvoices = (invoices[currentUser.email] || []).filter(i => i.id !== id)

        set({
          invoices: { ...invoices, [currentUser.email]: userInvoices },
          editingId: editingId === id ? null : editingId,
        })
      },

      setEditingId: (id) => {
        set({ editingId: id })
      },
    }),
    {
      name: 'invoiceforge-storage',
      partialize: (state) => ({
        users: state.users,
        session: state.session,
        invoices: state.invoices,
        currentUser: state.currentUser,
      }),
    }
  )
)

// Currency symbols
export const currencySymbols: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = currencySymbols[currency] || '$'
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// Format date
export function formatDate(dateStr: string): string {
  if (!dateStr) return '--'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const parts = dateStr.split('-')
  return `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}, ${parts[0]}`
}

// Get today's date in ISO format
export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// Get date 30 days from now in ISO format
export function getDueDateISO(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

// Generate random invoice number
export function generateInvoiceNumber(): string {
  return `INV-${Math.floor(Math.random() * 900) + 100}`
}

// Demo keys for Pro activation
export const DEMO_KEYS = ['INVOICEFORGE-PRO-DEMO-2024', 'INVOICEFORGE-PRO-FREE-9999']
