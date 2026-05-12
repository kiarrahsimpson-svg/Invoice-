'use client'

import { useStore, type Invoice, formatDate, formatCurrency } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistoryPanelProps {
  onNewInvoice: () => void
  onLoadInvoice: (invoice: Invoice) => void
  onDeleteInvoice: (id: string) => void
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

export function HistoryPanel({ onNewInvoice, onLoadInvoice, onDeleteInvoice }: HistoryPanelProps) {
  const { getInvoices } = useStore()
  const invoices = getInvoices()

  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0)

  return (
    <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-110px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl md:text-3xl">My Invoices</h2>
        <Button
          onClick={onNewInvoice}
          className="bg-gold hover:bg-gold-dk text-white text-sm"
        >
          + New Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">
            Total Invoices
          </div>
          <div className="text-2xl font-semibold text-gold tracking-tight">
            {invoices.length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">
            Total Billed
          </div>
          <div className="text-2xl font-semibold tracking-tight">
            {formatCurrency(totalBilled)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 col-span-2 md:col-span-1">
          <div className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">
            Total Paid
          </div>
          <div className="text-2xl font-semibold text-success tracking-tight">
            {formatCurrency(totalPaid)}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="text-center py-14">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <div className="font-serif text-xl mb-2">No invoices yet</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Create and save your first invoice to see it here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              onClick={() => onLoadInvoice(invoice)}
              className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-all hover:border-gold hover:shadow-[0_2px_12px_rgba(200,151,58,0.12)]"
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-gold font-medium">
                  {invoice.invNumber || '--'}
                </div>
                <div className="font-semibold text-sm mt-0.5 truncate">
                  {invoice.toName || 'Unknown Client'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Issued {formatDate(invoice.invDate)} &middot; Due {formatDate(invoice.dueDate)}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-mono text-base font-medium">
                  {formatCurrency(invoice.total, invoice.currency)}
                </div>
                <div className="mt-1">
                  <span
                    className={cn(
                      'inline-block px-2 py-0.5 rounded-full font-mono text-[0.6rem] tracking-wide uppercase font-medium',
                      statusStyles[invoice.status]
                    )}
                  >
                    {statusLabels[invoice.status] || 'Draft'}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLoadInvoice(invoice)
                    }}
                    className="text-xs px-2.5 py-1 h-auto"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteInvoice(invoice.id)
                    }}
                    className="text-xs px-2.5 py-1 h-auto bg-red/10 text-red border-none hover:bg-red/20"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
