'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Sparkles, Printer } from 'lucide-react'

interface HeaderProps {
  onShowLogout: () => void
}

export function Header({ onShowLogout }: HeaderProps) {
  const { currentUser, isPro } = useStore()
  const isProUser = isPro()

  const handlePrint = () => {
    window.print()
  }

  return (
    <header className="bg-ink text-paper py-3.5 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 gap-3 no-print">
      <div className="font-serif text-xl tracking-tight whitespace-nowrap">
        Invoice<span className="text-gold">Forge</span>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {isProUser && (
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-pro to-purple-500 text-white rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide">
            <Sparkles className="w-3 h-3" />
            Pro
          </span>
        )}
        
        <div className="flex items-center gap-2 bg-white/[0.08] border border-white/15 rounded-full py-1 px-3 text-xs text-white/85">
          <div className="w-5 h-5 rounded-full bg-gold text-white text-[0.68rem] font-bold flex items-center justify-center uppercase">
            {currentUser?.name?.[0] || '?'}
          </div>
          <span>{currentUser?.email}</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrint}
          className="border border-white/25 hover:border-gold hover:text-gold text-paper bg-transparent text-xs px-3 py-1.5"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          Print
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowLogout}
          className="border border-white/25 hover:border-gold hover:text-gold text-paper bg-transparent text-xs px-3 py-1.5"
        >
          Sign Out
        </Button>
      </div>
    </header>
  )
}
