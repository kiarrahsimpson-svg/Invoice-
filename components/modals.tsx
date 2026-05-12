'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore, DEMO_KEYS } from '@/lib/store'
import { Check, Trash2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkout } from '@/components/checkout'

interface ModalBackdropProps {
  children: React.ReactNode
  onClose: () => void
}

function ModalBackdrop({ children, onClose }: ModalBackdropProps) {
  return (
    <div
      className="fixed inset-0 bg-ink/55 z-50 flex items-center justify-center animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  )
}

interface ConfirmModalProps {
  icon: React.ReactNode
  title: string
  description: string
  confirmLabel: string
  confirmVariant?: 'danger' | 'default'
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  icon,
  title,
  description,
  confirmLabel,
  confirmVariant = 'default',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-paper rounded-xl w-full max-w-[340px] p-8 mx-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none"
        >
          &times;
        </button>

        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="font-serif text-xl tracking-tight mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="flex gap-2.5 mt-5">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border hover:border-gold hover:text-gold"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={cn(
              'flex-1',
              confirmVariant === 'danger'
                ? 'bg-red hover:bg-red/90 text-white'
                : 'bg-ink hover:bg-ink/90 text-white'
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalBackdrop>
  )
}

interface DeleteModalProps {
  onConfirm: () => void
  onClose: () => void
}

export function DeleteModal({ onConfirm, onClose }: DeleteModalProps) {
  return (
    <ConfirmModal
      icon={<Trash2 className="w-8 h-8 mx-auto text-red" />}
      title="Delete Invoice?"
      description="This action cannot be undone."
      confirmLabel="Delete"
      confirmVariant="danger"
      onConfirm={() => {
        onConfirm()
        onClose()
      }}
      onClose={onClose}
    />
  )
}

interface LogoutModalProps {
  onConfirm: () => void
  onClose: () => void
}

export function LogoutModal({ onConfirm, onClose }: LogoutModalProps) {
  return (
    <ConfirmModal
      icon={<LogOut className="w-8 h-8 mx-auto text-muted-foreground" />}
      title="Sign out?"
      description="Your invoices are saved and will be here when you return."
      confirmLabel="Sign Out"
      onConfirm={() => {
        onConfirm()
        onClose()
      }}
      onClose={onClose}
    />
  )
}

interface PricingModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function PricingModal({ onClose, onSuccess }: PricingModalProps) {
  const [billingYearly, setBillingYearly] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [showCheckout, setShowCheckout] = useState(false)
  const [showProKey, setShowProKey] = useState(false)

  const handleUpgrade = () => {
    // Show Stripe checkout instead of directly granting Pro
    setShowCheckout(true)
  }

  const handlePaymentSuccess = () => {
    onSuccess()
    onClose()
  }

  const handleCancelCheckout = () => {
    setShowCheckout(false)
  }

  // Show Paystack Checkout
  if (showCheckout) {
    const productId = selectedPlan === 'yearly' 
      ? 'invoiceforge-pro-yearly' 
      : 'invoiceforge-pro-monthly'
    
    return (
      <ModalBackdrop onClose={onClose}>
        <div className="bg-paper rounded-xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto p-6 md:p-8 mx-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none z-10"
          >
            &times;
          </button>

          <h2 className="font-serif text-2xl tracking-tight mb-2">Complete Your Purchase</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {selectedPlan === 'yearly' ? 'InvoiceForge Pro - Yearly' : 'InvoiceForge Pro - Monthly'}
          </p>

          <Checkout 
            productId={productId} 
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancelCheckout}
          />
        </div>
      </ModalBackdrop>
    )
  }

  // Show Pro Key activation
  if (showProKey) {
    return (
      <ModalBackdrop onClose={onClose}>
        <div className="bg-paper rounded-xl w-full max-w-[400px] p-8 mx-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            &times;
          </button>

          <h2 className="font-serif text-2xl tracking-tight mb-1">Activate Pro</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the license key you received after purchase.
          </p>

          <ProKeyForm 
            onSuccess={() => { onSuccess(); onClose() }}
            onBack={() => setShowProKey(false)}
          />
        </div>
      </ModalBackdrop>
    )
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-paper rounded-xl w-full max-w-[560px] p-8 md:p-10 mx-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none"
        >
          &times;
        </button>

        <h2 className="font-serif text-3xl tracking-tight mb-1">Upgrade to Pro</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Unlock unlimited invoices, downloads, custom branding, and more.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className={cn('text-sm font-medium', !billingYearly ? 'text-foreground' : 'text-muted-foreground')}>
            Monthly
          </span>
          <button
            onClick={() => {
              setBillingYearly(!billingYearly)
              setSelectedPlan(!billingYearly ? 'yearly' : 'monthly')
            }}
            className={cn(
              'w-11 h-6 rounded-full relative transition-colors',
              billingYearly ? 'bg-pro' : 'bg-border'
            )}
          >
            <div
              className={cn(
                'w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow',
                billingYearly ? 'left-6' : 'left-1'
              )}
            />
          </button>
          <span className={cn('text-sm font-medium flex items-center gap-2', billingYearly ? 'text-foreground' : 'text-muted-foreground')}>
            Yearly
            <span className="bg-green-100 text-success rounded-full px-2 py-0.5 text-[0.68rem] font-bold">
              Save 33%
            </span>
          </span>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Monthly */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={cn(
              'border-2 rounded-xl p-5 cursor-pointer transition-all relative',
              selectedPlan === 'monthly'
                ? 'border-pro bg-pro-lt'
                : 'border-border hover:border-purple-300'
            )}
          >
            <div className="font-bold text-sm mb-2">Monthly</div>
            <div className="font-serif text-4xl text-pro tracking-tight">
              <sup className="text-base">$</sup>9
            </div>
            <div className="text-xs text-muted-foreground mt-1 mb-4">
              per month, cancel anytime
            </div>
            <ul className="space-y-1.5">
              {['Unlimited invoices', 'HTML & PDF download', 'Custom logo upload', 'Accent color picker', 'Saved payment templates', 'Priority email support'].map((feature) => (
                <li key={feature} className="text-xs text-muted-foreground flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-pro flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Yearly */}
          <div
            onClick={() => setSelectedPlan('yearly')}
            className={cn(
              'border-2 rounded-xl p-5 cursor-pointer transition-all relative',
              selectedPlan === 'yearly'
                ? 'border-pro bg-pro-lt'
                : 'border-border hover:border-purple-300'
            )}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pro text-white rounded-full px-3 py-0.5 text-[0.64rem] font-bold tracking-wide uppercase whitespace-nowrap">
              Most Popular
            </div>
            <div className="font-bold text-sm mb-2">Yearly</div>
            <div className="font-serif text-4xl text-pro tracking-tight">
              <sup className="text-base">$</sup>6
            </div>
            <div className="text-xs text-muted-foreground mt-1 mb-4">
              per month, billed $72/yr
            </div>
            <ul className="space-y-1.5">
              {['Everything in Monthly', '33% savings vs monthly', 'Bulk invoice export', 'Revenue reports', 'Client CRM (coming soon)', 'Early access to new features'].map((feature) => (
                <li key={feature} className="text-xs text-muted-foreground flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-pro flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button
          onClick={handleUpgrade}
          className="w-full bg-pro hover:bg-pro-dk text-white py-3 text-base"
        >
          Continue to Payment &mdash; {selectedPlan === 'yearly' ? '$72/yr' : '$9/mo'}
        </Button>

        <p className="text-center mt-3 text-xs text-muted-foreground">
          Secure payment powered by Paystack &middot;{' '}
          <button
            onClick={() => setShowProKey(true)}
            className="text-pro hover:underline"
          >
            Already have a license key?
          </button>
        </p>
      </div>
    </ModalBackdrop>
  )
}

function ProKeyForm({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [proKey, setProKey] = useState('')
  const [error, setError] = useState('')
  const { grantPro } = useStore()

  const handleRedeem = () => {
    const normalizedKey = proKey.trim().toUpperCase()
    const isValid = DEMO_KEYS.some((k) => k.toUpperCase() === normalizedKey)
    
    if (!isValid) {
      setError('Invalid or already used license key.')
      return
    }

    grantPro()
    onSuccess()
  }

  return (
    <div>
      {error && (
        <div className="bg-red/10 border border-red/30 text-red rounded-md px-3 py-2 text-xs mb-3">
          {error}
        </div>
      )}
      <Input
        placeholder="INVOICEFORGE-PRO-XXXX-XXXX"
        value={proKey}
        onChange={(e) => setProKey(e.target.value)}
        className="font-mono text-sm mb-3"
      />
      <div className="flex gap-2">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleRedeem}
          className="flex-1 bg-pro hover:bg-pro-dk text-white"
        >
          Activate
        </Button>
      </div>
    </div>
  )
}
