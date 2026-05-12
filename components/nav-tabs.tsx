'use client'

import { useStore } from '@/lib/store'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavTabsProps {
  activeTab: 'editor' | 'history'
  onTabChange: (tab: 'editor' | 'history') => void
  onShowPricing: () => void
}

export function NavTabs({ activeTab, onTabChange, onShowPricing }: NavTabsProps) {
  const { getInvoices, isPro } = useStore()
  const invoiceCount = getInvoices().length
  const isProUser = isPro()

  return (
    <div className="bg-cream border-b-[1.5px] border-border px-4 md:px-8 flex items-center no-print">
      <button
        onClick={() => onTabChange('editor')}
        className={cn(
          'py-3 px-4 md:px-5 text-sm font-medium border-b-[2.5px] -mb-[1.5px] transition-all',
          activeTab === 'editor'
            ? 'text-foreground border-gold'
            : 'text-muted-foreground border-transparent hover:text-foreground'
        )}
      >
        New Invoice
      </button>
      
      <button
        onClick={() => onTabChange('history')}
        className={cn(
          'py-3 px-4 md:px-5 text-sm font-medium border-b-[2.5px] -mb-[1.5px] transition-all flex items-center gap-2',
          activeTab === 'history'
            ? 'text-foreground border-gold'
            : 'text-muted-foreground border-transparent hover:text-foreground'
        )}
      >
        My Invoices
        <span className="bg-gold text-white rounded-full px-1.5 py-0.5 text-[0.66rem] font-mono">
          {invoiceCount}
        </span>
      </button>
      
      <div className="flex-1" />
      
      {!isProUser && (
        <button
          onClick={onShowPricing}
          className="flex items-center gap-1.5 bg-pro-lt border-[1.5px] border-purple-300 rounded-full px-3 py-1 text-xs font-semibold text-pro hover:bg-purple-100 hover:border-pro transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          Upgrade to Pro
        </button>
      )}
    </div>
  )
}
