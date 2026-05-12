'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore, type Invoice, type LineItem, getTodayISO, getDueDateISO, generateInvoiceNumber, currencySymbols } from '@/lib/store'
import { AuthGate, AuthModal } from '@/components/auth-gate'
import { Header } from '@/components/header'
import { NavTabs } from '@/components/nav-tabs'
import { InvoiceForm } from '@/components/invoice-form'
import { InvoicePreview } from '@/components/invoice-preview'
import { HistoryPanel } from '@/components/history-panel'
import { DeleteModal, LogoutModal, PricingModal } from '@/components/modals'
import { Toast, useToast } from '@/components/toast'
import { Button } from '@/components/ui/button'
import { Download, Plus, Printer } from 'lucide-react'

type ModalType = 'login' | 'signup' | 'logout' | 'delete' | 'pricing' | null
type TabType = 'editor' | 'history'

export default function InvoiceForge() {
  const { currentUser, logout, saveInvoice, deleteInvoice, setEditingId, editingId, getInvoices, isPro } = useStore()
  const { toast, showToast, hideToast } = useToast()
  
  // Auth state
  const [mounted, setMounted] = useState(false)
  const [modal, setModal] = useState<ModalType>(null)
  const [activeTab, setActiveTab] = useState<TabType>('editor')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Invoice form state
  const [fromName, setFromName] = useState('')
  const [fromTagline, setFromTagline] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromAddress, setFromAddress] = useState('')
  const [toName, setToName] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [invNumber, setInvNumber] = useState('')
  const [invStatus, setInvStatus] = useState<'draft' | 'sent' | 'paid' | 'overdue'>('draft')
  const [invDate, setInvDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [taxRate, setTaxRate] = useState(0)
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ desc: '', qty: 1, rate: 0 }])

  // Initialize form on mount
  useEffect(() => {
    setMounted(true)
    resetForm()
  }, [])

  const resetForm = useCallback(() => {
    setFromName('')
    setFromTagline('')
    setFromEmail('')
    setFromAddress('')
    setToName('')
    setToEmail('')
    setToAddress('')
    setInvNumber(generateInvoiceNumber())
    setInvStatus('draft')
    setInvDate(getTodayISO())
    setDueDate(getDueDateISO())
    setCurrency('USD')
    setTaxRate(0)
    setNotes('')
    setPayment('')
    setItems([{ desc: '', qty: 1, rate: 0 }])
    setEditingId(null)
  }, [setEditingId])

  const loadInvoice = useCallback((invoice: Invoice) => {
    setFromName(invoice.fromName || '')
    setFromTagline(invoice.fromTagline || '')
    setFromEmail(invoice.fromEmail || '')
    setFromAddress(invoice.fromAddress || '')
    setToName(invoice.toName || '')
    setToEmail(invoice.toEmail || '')
    setToAddress(invoice.toAddress || '')
    setInvNumber(invoice.invNumber || '')
    setInvStatus(invoice.status || 'draft')
    setInvDate(invoice.invDate || '')
    setDueDate(invoice.dueDate || '')
    setCurrency(invoice.currency || 'USD')
    setTaxRate(invoice.taxRate || 0)
    setNotes(invoice.notes || '')
    setPayment(invoice.payment || '')
    setItems(invoice.items?.length ? [...invoice.items] : [{ desc: '', qty: 1, rate: 0 }])
    setEditingId(invoice.id)
    setActiveTab('editor')
    showToast('Invoice loaded for editing.')
  }, [setEditingId, showToast])

  const handleSaveInvoice = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty || 0) * (item.rate || 0), 0)
    const taxAmount = subtotal * (taxRate || 0) / 100
    const total = subtotal + taxAmount

    const result = saveInvoice({
      fromName,
      fromTagline,
      fromEmail,
      fromAddress,
      toName,
      toEmail,
      toAddress,
      invNumber,
      status: invStatus,
      invDate,
      dueDate,
      currency,
      taxRate,
      notes,
      payment,
      items,
      total,
    })

    if (result.success) {
      showToast(editingId ? 'Invoice updated.' : 'Invoice saved.')
    } else if (result.error === 'limit_reached') {
      setModal('pricing')
    } else {
      showToast(result.error || 'Error saving invoice.')
    }
  }

  const handleDeleteInvoice = (id: string) => {
    setDeleteId(id)
    setModal('delete')
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteInvoice(deleteId)
      if (editingId === deleteId) {
        resetForm()
      }
      showToast('Invoice deleted.')
      setDeleteId(null)
    }
  }

  const handleLogout = () => {
    logout()
    resetForm()
    setActiveTab('editor')
  }

  const handleDownload = () => {
    const previewEl = document.getElementById('invoice-preview-content')
    if (!previewEl) return

    const invHtml = previewEl.innerHTML
    const invNum = (invNumber || 'invoice').replace(/[^a-zA-Z0-9\-_]/g, '-')
    const fonts = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap'

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invNumber || ''}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fonts}" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root{--ink:#0f0e0d;--paper:#faf8f4;--cream:#f2ede3;--gold:#c8973a;--muted:#7a7268;--border:#ddd8cc;--success:#2d7d4f;}
    body{background:#e8e4dc;padding:40px 20px;font-family:"DM Sans",sans-serif;}
    .invoice-paper{background:white;max-width:720px;margin:0 auto;padding:56px 60px;position:relative;box-shadow:0 8px 40px rgba(0,0,0,0.15);}
    @media print{body{background:white;padding:0;}.invoice-paper{box-shadow:none;max-width:100%;}}
  </style>
</head>
<body>
  <div class="invoice-paper">
    ${invHtml}
  </div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invNum}.html`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 1000)
    showToast(`Downloaded ${invNum}.html`)
  }

  // Wait for hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="font-serif text-4xl tracking-tight">
          Invoice<span className="text-gold">Forge</span>
        </div>
      </div>
    )
  }

  // Show auth gate if not logged in
  if (!currentUser) {
    return (
      <>
        <AuthGate
          onShowLogin={() => setModal('login')}
          onShowSignup={() => setModal('signup')}
        />
        {modal === 'login' && (
          <AuthModal
            type="login"
            onClose={() => setModal(null)}
            onSwitch={() => setModal('signup')}
            onSuccess={() => {
              setModal(null)
              showToast(`Welcome back!`)
            }}
          />
        )}
        {modal === 'signup' && (
          <AuthModal
            type="signup"
            onClose={() => setModal(null)}
            onSwitch={() => setModal('login')}
            onSuccess={() => {
              setModal(null)
              showToast(`Welcome!`)
            }}
          />
        )}
        <Toast message={toast.message} show={toast.show} onHide={hideToast} />
      </>
    )
  }

  // Main app
  return (
    <>
      <Header onShowLogout={() => setModal('logout')} />
      <NavTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onShowPricing={() => setModal('pricing')}
      />

      {activeTab === 'editor' ? (
        <div className="grid md:grid-cols-[410px_1fr] min-h-[calc(100vh-110px)]">
          <InvoiceForm
            fromName={fromName} setFromName={setFromName}
            fromTagline={fromTagline} setFromTagline={setFromTagline}
            fromEmail={fromEmail} setFromEmail={setFromEmail}
            fromAddress={fromAddress} setFromAddress={setFromAddress}
            toName={toName} setToName={setToName}
            toEmail={toEmail} setToEmail={setToEmail}
            toAddress={toAddress} setToAddress={setToAddress}
            invNumber={invNumber} setInvNumber={setInvNumber}
            invStatus={invStatus} setInvStatus={setInvStatus}
            invDate={invDate} setInvDate={setInvDate}
            dueDate={dueDate} setDueDate={setDueDate}
            currency={currency} setCurrency={setCurrency}
            taxRate={taxRate} setTaxRate={setTaxRate}
            notes={notes} setNotes={setNotes}
            payment={payment} setPayment={setPayment}
            items={items} setItems={setItems}
            onShowPricing={() => setModal('pricing')}
          />

          <div className="bg-[#e8e4dc] p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-110px)] flex flex-col items-center gap-4">
            {/* Actions */}
            <div className="flex gap-2 flex-wrap justify-center w-full max-w-[720px] no-print">
              <Button
                onClick={handleSaveInvoice}
                className="bg-gold hover:bg-gold-dk text-white"
              >
                Save Invoice
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-border hover:border-gold hover:text-gold"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                New
              </Button>
              <Button
                onClick={handleDownload}
                className="bg-pro hover:bg-pro-dk text-white"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="border-border hover:border-gold hover:text-gold"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print / PDF
              </Button>
            </div>

            {/* Invoice Preview */}
            <div id="invoice-preview-content">
              <InvoicePreview
                fromName={fromName}
                fromTagline={fromTagline}
                fromEmail={fromEmail}
                fromAddress={fromAddress}
                toName={toName}
                toEmail={toEmail}
                toAddress={toAddress}
                invNumber={invNumber}
                invStatus={invStatus}
                invDate={invDate}
                dueDate={dueDate}
                currency={currency}
                taxRate={taxRate}
                notes={notes}
                payment={payment}
                items={items}
              />
            </div>
          </div>
        </div>
      ) : (
        <HistoryPanel
          onNewInvoice={() => {
            resetForm()
            setActiveTab('editor')
          }}
          onLoadInvoice={loadInvoice}
          onDeleteInvoice={handleDeleteInvoice}
        />
      )}

      {/* Modals */}
      {modal === 'logout' && (
        <LogoutModal
          onConfirm={handleLogout}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'delete' && (
        <DeleteModal
          onConfirm={confirmDelete}
          onClose={() => {
            setModal(null)
            setDeleteId(null)
          }}
        />
      )}
      {modal === 'pricing' && (
        <PricingModal
          onClose={() => setModal(null)}
          onSuccess={() => showToast('Pro activated! Enjoy unlimited invoices.')}
        />
      )}

      <Toast message={toast.message} show={toast.show} onHide={hideToast} />
    </>
  )
}
