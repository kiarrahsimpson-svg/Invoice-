'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  show: boolean
  onHide: () => void
}

export function Toast({ message, show, onHide }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 3200)
      return () => clearTimeout(timer)
    }
  }, [show, onHide])

  return (
    <div
      className={cn(
        'fixed bottom-5 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-2.5 rounded-md text-sm z-[999] shadow-xl whitespace-nowrap transition-transform duration-300',
        show ? 'translate-y-0' : 'translate-y-20'
      )}
    >
      {message}
    </div>
  )
}

// Toast hook for easier usage
export function useToast() {
  const [toast, setToast] = useState({ message: '', show: false })

  const showToast = (message: string) => {
    setToast({ message, show: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  return { toast, showToast, hideToast }
}
