'use client'

import { type LineItem, formatCurrency, formatDate, currencySymbols } from '@/lib/store'
import { cn } from '@/lib/utils'

interface InvoicePreviewProps {
  fromName: string
  fromTagline: string
  fromEmail: string
  fromAddress: string
  toName: string
  toEmail: string
  toAddress: string
  invNumber: string
  invStatus: 'draft' | 'sent' | 'paid' | 'overdue'
  invDate: string
  dueDate: string
  currency: string
  taxRate: number
  notes: string
  payment: string
  items: LineItem[]
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
}

const statusStyles: Record<string, string> = {
  draft: 'bg-cream text-muted-foreground',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-success',
  overdue: 'bg-red-100 text-red',
}

export function InvoicePreview({
  fromName,
  fromTagline,
  fromEmail,
  fromAddress,
  toName,
  toEmail,
  toAddress,
  invNumber,
  invStatus,
  invDate,
  dueDate,
  currency,
  taxRate,
  notes,
  payment,
  items,
}: InvoicePreviewProps) {
  const symbol = currencySymbols[currency] || '$'
  
  const fmt = (n: number) => `${symbol}${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  
  const subtotal = items.reduce((sum, item) => sum + (item.qty || 0) * (item.rate || 0), 0)
  const taxAmount = subtotal * (taxRate || 0) / 100
  const total = subtotal + taxAmount

  const fromDetails = [fromEmail, fromAddress].filter(Boolean).join('\n')
  const toDetails = [toEmail, toAddress].filter(Boolean).join('\n')

  return (
    <div className="invoice-paper bg-white w-full max-w-[720px] shadow-[0_8px_40px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.08)] p-8 md:p-14 relative overflow-hidden">
      {/* Gold gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-gold via-amber-300 to-gold" />

      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="font-serif text-3xl leading-none tracking-tight">
            {fromName || 'Your Business'}
          </div>
          {fromTagline && (
            <div className="text-xs text-muted-foreground mt-1">{fromTagline}</div>
          )}
          {fromDetails && (
            <div className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">
              {fromDetails}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="font-serif text-4xl text-gold tracking-tight leading-none">
            INVOICE
          </div>
          <div className="font-mono text-xs text-muted-foreground mt-1.5">
            {invNumber || 'INV-001'}
          </div>
          <div className="mt-2">
            <span
              className={cn(
                'inline-block px-2.5 py-0.5 rounded-full font-mono text-[0.6rem] tracking-wide uppercase font-medium',
                statusStyles[invStatus]
              )}
            >
              {statusLabels[invStatus] || 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Bill To & Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="font-mono text-[0.61rem] tracking-[0.12em] uppercase text-muted-foreground mb-1.5">
            Bill To
          </div>
          <div className="font-semibold text-sm mb-0.5">{toName || 'Client Name'}</div>
          {toDetails && (
            <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {toDetails}
            </div>
          )}
        </div>
        <div className="bg-cream rounded-md p-4 flex flex-wrap gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[0.59rem] tracking-[0.1em] uppercase text-muted-foreground">
              Issued
            </span>
            <span className="font-semibold text-sm">{formatDate(invDate)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[0.59rem] tracking-[0.1em] uppercase text-muted-foreground">
              Due
            </span>
            <span className="font-semibold text-sm">{formatDate(dueDate)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[0.59rem] tracking-[0.1em] uppercase text-muted-foreground">
              Currency
            </span>
            <span className="font-semibold text-sm">{currency}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full border-collapse mb-5">
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground py-2 text-left font-medium">
              Description
            </th>
            <th className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground py-2 text-right font-medium">
              Qty
            </th>
            <th className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground py-2 text-right font-medium">
              Rate
            </th>
            <th className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground py-2 text-right font-medium">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const qty = item.qty || 0
            const rate = item.rate || 0
            const amount = qty * rate
            return (
              <tr key={index} className={cn(index < items.length - 1 && 'border-b border-border')}>
                <td className="py-2.5 text-sm align-top">
                  {item.desc || <span className="text-gray-300">--</span>}
                </td>
                <td className="py-2.5 text-sm text-right align-top">
                  {qty || ''}
                </td>
                <td className="py-2.5 text-sm text-right align-top">
                  {rate ? fmt(rate) : ''}
                </td>
                <td className="py-2.5 text-sm text-right align-top">
                  {qty && rate ? fmt(amount) : ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex flex-col items-end gap-1 mb-8">
        <div className="flex gap-12 justify-end items-baseline">
          <span className="text-xs text-muted-foreground min-w-[76px] text-right">Subtotal</span>
          <span className="font-mono text-sm min-w-[88px] text-right">{fmt(subtotal)}</span>
        </div>
        {taxRate > 0 && (
          <div className="flex gap-12 justify-end items-baseline">
            <span className="text-xs text-muted-foreground min-w-[76px] text-right">
              Tax ({taxRate}%)
            </span>
            <span className="font-mono text-sm min-w-[88px] text-right">{fmt(taxAmount)}</span>
          </div>
        )}
        <div className="w-[230px] h-[1.5px] bg-border my-1" />
        <div className="bg-ink text-white rounded-md p-3 flex justify-between items-center w-[230px] mt-1">
          <span className="text-xs tracking-wide uppercase">Total Due</span>
          <span className="font-mono text-lg font-medium">{fmt(total)}</span>
        </div>
      </div>

      {/* Notes & Payment */}
      {(notes || payment) && (
        <div className="border-t border-border pt-5 mt-3">
          {payment && (
            <>
              <div className="font-mono text-[0.58rem] tracking-[0.1em] uppercase text-muted-foreground mb-1.5">
                Payment Details
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap mb-3">
                {payment}
              </div>
            </>
          )}
          {notes && (
            <>
              <div className="font-mono text-[0.58rem] tracking-[0.1em] uppercase text-muted-foreground mb-1.5">
                Notes
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {notes}
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 flex justify-between text-[0.71rem] text-gray-400">
        <span>Generated with InvoiceForge</span>
        <span>{fromEmail}</span>
      </div>
    </div>
  )
}
