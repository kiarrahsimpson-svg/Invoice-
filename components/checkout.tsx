'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { CheckCircle, Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Products with amounts in kobo (smallest Nigerian currency unit)
// 1 NGN = 100 kobo, so NGN 9,000 = 900,000 kobo
const PRODUCTS = {
  'invoiceforge-pro-monthly': {
    name: 'InvoiceForge Pro - Monthly',
    amount: 900000, // NGN 9,000 in kobo (~$9)
    description: 'Monthly subscription',
  },
  'invoiceforge-pro-yearly': {
    name: 'InvoiceForge Pro - Yearly',
    amount: 7200000, // NGN 72,000 in kobo (~$72)
    description: 'Yearly subscription (save 33%)',
  },
} as const

// Paystack types
interface PaystackPopupOptions {
  key: string
  email: string
  amount: number
  ref: string
  metadata?: {
    custom_fields?: Array<{
      display_name: string
      variable_name: string
      value: string
    }>
  }
  onClose: () => void
  callback: (response: { reference: string }) => void
}

interface PaystackPopup {
  setup: (options: PaystackPopupOptions) => { openIframe: () => void }
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopup
  }
}

interface CheckoutProps {
  productId: 'invoiceforge-pro-monthly' | 'invoiceforge-pro-yearly'
  onSuccess: () => void
  onCancel: () => void
}

export function Checkout({ productId, onSuccess, onCancel }: CheckoutProps) {
  const [status, setStatus] = useState<'loading' | 'form' | 'processing' | 'success' | 'error'>('loading')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const { grantPro, user } = useStore()

  const product = PRODUCTS[productId]
  const publicKey = 'pk_live_bbd474d211bc4a4c2ef9296c8db1b63c045e83bc'

  // Load Paystack script on mount
  useEffect(() => {
    // Check if already loaded
    if (window.PaystackPop) {
      setPaystackLoaded(true)
      setStatus('form')
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => {
      setPaystackLoaded(true)
      setStatus('form')
    }
    script.onerror = () => {
      setError('Failed to load payment system. Please refresh and try again.')
      setStatus('error')
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup if component unmounts before load
    }
  }, [])

  const handlePayment = () => {
    if (!window.PaystackPop) {
      setError('Payment system not ready. Please refresh and try again.')
      return
    }

    if (!publicKey) {
      setError('Paystack is not configured. Please contact support.')
      return
    }

    const paymentEmail = email || user?.email
    if (!paymentEmail) {
      setError('Please enter your email address')
      return
    }

    setError('')
    setStatus('processing')

    const reference = `invoiceforge_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: paymentEmail,
      amount: product.amount,
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: 'Product',
            variable_name: 'product',
            value: product.name,
          },
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: name || user?.name || '',
          },
        ],
      },
      onClose: () => {
        setStatus('form')
      },
      callback: (response) => {
        // Payment was successful - reference can be used for verification
        void response.reference
        setStatus('success')
        grantPro()
        setTimeout(() => {
          onSuccess()
        }, 2000)
      },
    })

    handler.openIframe()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handlePayment()
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-pro animate-spin mb-4" />
        <p className="text-muted-foreground">Loading payment system...</p>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-pro animate-spin mb-4" />
        <p className="text-muted-foreground">Processing payment...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="w-16 h-16 text-success mb-4" />
        <h3 className="font-serif text-2xl mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground">Welcome to InvoiceForge Pro</p>
      </div>
    )
  }

  if (status === 'error' && !paystackLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red mb-4">{error || 'Payment system failed to load.'}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
      </div>
    )
  }

  const displayAmount = (product.amount / 100).toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
  })

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red/10 border border-red/30 text-red rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-pro" />
            <span className="font-medium">{product.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{product.description}</p>
          <p className="text-2xl font-serif text-pro mt-2">{displayAmount}</p>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="name" className="text-sm font-medium mb-1.5 block">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium mb-1.5 block">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              defaultValue={user?.email}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-pro hover:bg-pro-dk text-white py-3 text-base mt-4"
          disabled={!paystackLoaded}
        >
          Pay {displayAmount} with Paystack
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Secure payment powered by Paystack
        </p>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel and go back
        </button>
      </div>
    </div>
  )
}
