'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { FileText, BarChart3, Download, Sparkles } from 'lucide-react'

interface AuthGateProps {
  onShowLogin: () => void
  onShowSignup: () => void
}

export function AuthGate({ onShowLogin, onShowSignup }: AuthGateProps) {
  const features = [
    { icon: FileText, title: 'Create Invoices', desc: 'Beautiful PDFs in seconds' },
    { icon: BarChart3, title: 'Full History', desc: 'All invoices in one place' },
    { icon: Download, title: 'PDF Download', desc: 'One-click save & share' },
    { icon: Sparkles, title: 'Pro Features', desc: 'Unlimited & custom branding' },
  ]

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-5 md:p-10">
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-1">
        Invoice<span className="text-gold">Forge</span>
      </h1>
      <p className="text-muted-foreground text-base md:text-lg mb-10 text-center">
        Professional invoices. Free to start. Pro when you grow.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-10 max-w-[700px]">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-card border border-border rounded-xl p-5 max-w-[155px] text-center"
          >
            <feature.icon className="w-8 h-8 mx-auto mb-3 text-gold" />
            <div className="font-semibold text-sm mb-1">{feature.title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onShowSignup}
          className="bg-gold hover:bg-gold-dk text-white px-8 py-3 text-base rounded-md"
        >
          Create Free Account
        </Button>
        <Button
          variant="outline"
          onClick={onShowLogin}
          className="border-border hover:border-gold hover:text-gold px-8 py-3 text-base rounded-md"
        >
          Sign In
        </Button>
      </div>
    </div>
  )
}

interface AuthModalProps {
  type: 'login' | 'signup'
  onClose: () => void
  onSwitch: () => void
  onSuccess: () => void
}

export function AuthModal({ type, onClose, onSwitch, onSuccess }: AuthModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const { signup, login } = useStore()

  const handleSubmit = () => {
    setError('')
    
    if (type === 'signup') {
      const result = signup(name, email, password)
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'An error occurred')
      }
    } else {
      const result = login(email, password)
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'An error occurred')
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div 
      className="fixed inset-0 bg-ink/55 z-50 flex items-center justify-center animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-paper rounded-xl w-full max-w-[400px] p-9 mx-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none"
        >
          &times;
        </button>

        <h2 className="font-serif text-3xl tracking-tight mb-1">
          {type === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {type === 'login' ? 'Sign in to access your invoices' : 'Free to start. Upgrade anytime.'}
        </p>

        {error && (
          <div className="bg-red/10 border border-red/30 text-red rounded-md px-3 py-2 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {type === 'signup' && (
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Your Name</label>
              <Input
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card border-border focus:border-gold"
              />
            </div>
          )}
          
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">Email Address</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-border focus:border-gold"
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-card border-border focus:border-gold"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full mt-6 bg-gold hover:bg-gold-dk text-white py-3"
        >
          {type === 'login' ? 'Sign In' : 'Create Free Account'}
        </Button>

        <p className="text-center mt-5 text-sm text-muted-foreground">
          {type === 'login' ? 'No account? ' : 'Already have an account? '}
          <button
            onClick={onSwitch}
            className="text-gold hover:underline font-medium"
          >
            {type === 'login' ? 'Create one free →' : 'Sign in →'}
          </button>
        </p>
      </div>
    </div>
  )
}
