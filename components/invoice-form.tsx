'use client'

import { useStore, type LineItem } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lock, X } from 'lucide-react'

const FREE_LIMIT = 3

interface InvoiceFormProps {
  fromName: string
  setFromName: (v: string) => void
  fromTagline: string
  setFromTagline: (v: string) => void
  fromEmail: string
  setFromEmail: (v: string) => void
  fromAddress: string
  setFromAddress: (v: string) => void
  toName: string
  setToName: (v: string) => void
  toEmail: string
  setToEmail: (v: string) => void
  toAddress: string
  setToAddress: (v: string) => void
  invNumber: string
  setInvNumber: (v: string) => void
  invStatus: 'draft' | 'sent' | 'paid' | 'overdue'
  setInvStatus: (v: 'draft' | 'sent' | 'paid' | 'overdue') => void
  invDate: string
  setInvDate: (v: string) => void
  dueDate: string
  setDueDate: (v: string) => void
  currency: string
  setCurrency: (v: string) => void
  taxRate: number
  setTaxRate: (v: number) => void
  notes: string
  setNotes: (v: string) => void
  payment: string
  setPayment: (v: string) => void
  items: LineItem[]
  setItems: (items: LineItem[]) => void
  onShowPricing: () => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[0.63rem] tracking-[0.15em] uppercase text-muted-foreground mb-2.5 mt-5 pb-1 border-b border-border first:mt-0">
      {children}
    </div>
  )
}

function FieldLabel({ children, pro }: { children: React.ReactNode; pro?: boolean }) {
  return (
    <label className="text-xs text-muted-foreground font-medium block mb-1">
      {children}
      {pro && <span className="text-pro text-[0.7rem] font-semibold ml-1">[Pro]</span>}
    </label>
  )
}

function ProFieldLock({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-md hover:bg-pro/5"
    >
      <span className="bg-pro text-white rounded px-2 py-0.5 text-[0.65rem] font-semibold flex items-center gap-1">
        <Lock className="w-3 h-3" /> Pro Only
      </span>
    </div>
  )
}

export function InvoiceForm({
  fromName, setFromName,
  fromTagline, setFromTagline,
  fromEmail, setFromEmail,
  fromAddress, setFromAddress,
  toName, setToName,
  toEmail, setToEmail,
  toAddress, setToAddress,
  invNumber, setInvNumber,
  invStatus, setInvStatus,
  invDate, setInvDate,
  dueDate, setDueDate,
  currency, setCurrency,
  taxRate, setTaxRate,
  notes, setNotes,
  payment, setPayment,
  items, setItems,
  onShowPricing,
}: InvoiceFormProps) {
  const { getInvoices, isPro } = useStore()
  const isProUser = isPro()
  const invoiceCount = getInvoices().length

  const addItem = () => {
    setItems([...items, { desc: '', qty: 1, rate: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items]
    if (field === 'desc') {
      newItems[index].desc = value as string
    } else if (field === 'qty') {
      newItems[index].qty = parseFloat(value as string) || 0
    } else if (field === 'rate') {
      newItems[index].rate = parseFloat(value as string) || 0
    }
    setItems(newItems)
  }

  return (
    <div className="bg-cream border-r-[1.5px] border-border p-6 overflow-y-auto max-h-[calc(100vh-110px)] md:max-h-[calc(100vh-110px)]">
      {/* Limit Banner */}
      {!isProUser && (
        <div className="bg-pro-lt border-[1.5px] border-purple-300 rounded-lg p-3 flex items-center gap-2.5 mb-4">
          <span className="text-xs text-pro font-medium whitespace-nowrap">
            {invoiceCount} / {FREE_LIMIT} free invoices used
          </span>
          <div className="flex-1 bg-purple-200 rounded h-1.5">
            <div
              className="bg-pro rounded h-1.5 transition-all duration-300"
              style={{ width: `${Math.min(100, (invoiceCount / FREE_LIMIT) * 100)}%` }}
            />
          </div>
          <Button
            size="sm"
            onClick={onShowPricing}
            className="bg-pro hover:bg-pro-dk text-white text-xs px-2.5 py-1 h-auto"
          >
            Upgrade
          </Button>
        </div>
      )}

      {/* Your Business */}
      <SectionLabel>Your Business</SectionLabel>
      <div className="space-y-2.5">
        <div>
          <FieldLabel>Business / Your Name</FieldLabel>
          <Input
            placeholder="Acme Design Studio"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            className="bg-paper border-border focus:border-gold"
          />
        </div>
        <div>
          <FieldLabel>Tagline (optional)</FieldLabel>
          <Input
            placeholder="Brand & Digital Design"
            value={fromTagline}
            onChange={(e) => setFromTagline(e.target.value)}
            className="bg-paper border-border focus:border-gold"
          />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            placeholder="hello@yourname.com"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            className="bg-paper border-border focus:border-gold"
          />
        </div>
        <div>
          <FieldLabel>Address / Details</FieldLabel>
          <textarea
            rows={2}
            placeholder="123 Main St, City, State ZIP"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            className="w-full px-3 py-2 border-[1.5px] border-border rounded-md bg-paper text-sm resize-y min-h-[52px] focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <FieldLabel pro>Business Logo</FieldLabel>
          <div className="relative">
            <Input
              placeholder="Logo URL (Pro feature)"
              disabled
              className="bg-paper border-border opacity-50 pointer-events-none"
            />
            <ProFieldLock onClick={onShowPricing} />
          </div>
        </div>
      </div>

      {/* Bill To */}
      <SectionLabel>Bill To</SectionLabel>
      <div className="space-y-2.5">
        <div>
          <FieldLabel>Client Name / Company</FieldLabel>
          <Input
            placeholder="Client Co. LLC"
            value={toName}
            onChange={(e) => setToName(e.target.value)}
            className="bg-paper border-border focus:border-gold"
          />
        </div>
        <div>
          <FieldLabel>Client Email</FieldLabel>
          <Input
            type="email"
            placeholder="billing@client.com"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="bg-paper border-border focus:border-gold"
          />
        </div>
        <div>
          <FieldLabel>Client Address (optional)</FieldLabel>
          <textarea
            rows={2}
            placeholder="456 Client Ave, City, State"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="w-full px-3 py-2 border-[1.5px] border-border rounded-md bg-paper text-sm resize-y min-h-[52px] focus:border-gold focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Invoice Details */}
      <SectionLabel>Invoice Details</SectionLabel>
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <FieldLabel>Invoice #</FieldLabel>
            <Input
              placeholder="INV-001"
              value={invNumber}
              onChange={(e) => setInvNumber(e.target.value)}
              className="bg-paper border-border focus:border-gold"
            />
          </div>
          <div>
            <FieldLabel>Status</FieldLabel>
            <select
              value={invStatus}
              onChange={(e) => setInvStatus(e.target.value as typeof invStatus)}
              className="w-full px-3 py-2 border-[1.5px] border-border rounded-md bg-paper text-sm focus:border-gold focus:outline-none transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <FieldLabel>Issue Date</FieldLabel>
            <Input
              type="date"
              value={invDate}
              onChange={(e) => setInvDate(e.target.value)}
              className="bg-paper border-border focus:border-gold"
            />
          </div>
          <div>
            <FieldLabel>Due Date</FieldLabel>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-paper border-border focus:border-gold"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <FieldLabel>Currency</FieldLabel>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-border rounded-md bg-paper text-sm focus:border-gold focus:outline-none transition-colors"
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div>
            <FieldLabel>Tax Rate (%)</FieldLabel>
            <Input
              type="number"
              placeholder="0"
              min={0}
              max={100}
              step={0.1}
              value={taxRate || ''}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="bg-paper border-border focus:border-gold"
            />
          </div>
        </div>
        <div>
          <FieldLabel pro>Custom Accent Color</FieldLabel>
          <div className="relative">
            <Input
              placeholder="#c8973a"
              disabled
              className="bg-paper border-border opacity-50 pointer-events-none"
            />
            <ProFieldLock onClick={onShowPricing} />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <SectionLabel>Line Items</SectionLabel>
      <div className="grid grid-cols-[1fr_62px_78px_24px] gap-1.5 text-[0.66rem] font-semibold text-muted-foreground uppercase tracking-wide pb-1.5">
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Rate</span>
        <span></span>
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-[1fr_62px_78px_24px] gap-1.5 mb-1.5 items-center">
          <Input
            placeholder="Service description"
            value={item.desc}
            onChange={(e) => updateItem(index, 'desc', e.target.value)}
            className="bg-paper border-border focus:border-gold py-1.5 px-2"
          />
          <Input
            type="number"
            placeholder="1"
            min={0}
            step="any"
            value={item.qty || ''}
            onChange={(e) => updateItem(index, 'qty', e.target.value)}
            className="bg-paper border-border focus:border-gold py-1.5 px-2 text-right"
          />
          <Input
            type="number"
            placeholder="0.00"
            min={0}
            step="any"
            value={item.rate || ''}
            onChange={(e) => updateItem(index, 'rate', e.target.value)}
            className="bg-paper border-border focus:border-gold py-1.5 px-2 text-right"
          />
          <button
            onClick={() => removeItem(index)}
            className="text-muted-foreground hover:text-red transition-colors text-lg p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full mt-1 py-2 border-[1.5px] border-dashed border-border text-muted-foreground text-sm font-medium rounded-md hover:border-gold hover:text-gold transition-colors"
      >
        + Add Line Item
      </button>

      {/* Notes & Terms */}
      <SectionLabel>Notes & Terms</SectionLabel>
      <div className="space-y-2.5">
        <div>
          <FieldLabel>Notes to Client</FieldLabel>
          <textarea
            rows={3}
            placeholder="Payment due within 30 days. Thank you for your business!"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border-[1.5px] border-border rounded-md bg-paper text-sm resize-y min-h-[52px] focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <FieldLabel>Payment Details (PayPal, bank, Venmo, etc.)</FieldLabel>
          <textarea
            rows={2}
            placeholder="PayPal: you@email.com"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="w-full px-3 py-2 border-[1.5px] border-border rounded-md bg-paper text-sm resize-y min-h-[52px] focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <FieldLabel pro>Saved Payment Templates</FieldLabel>
          <div className="relative">
            <select
              disabled
              className="w-full px-3 py-2 border-[1.5px] border-border rounded-md bg-paper text-sm opacity-50 pointer-events-none"
            >
              <option>-- Select template --</option>
            </select>
            <ProFieldLock onClick={onShowPricing} />
          </div>
        </div>
      </div>
    </div>
  )
}
