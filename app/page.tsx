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

  const [isDownloading, setIsDownloading] = useState(false)

  const loadScript = (src: string, globalVar: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any)[globalVar]) {
        resolve()
        return
      }
      
      const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any)[globalVar]) {
          resolve()
        }
        return
      }
      
      const script = document.createElement('script')
      script.src = src
      script.crossOrigin = 'anonymous'
      script.onload = () => setTimeout(resolve, 50)
      script.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(script)
    })
  }

  const generateInvoiceHTML = () => {
    const symbol = currencySymbols[currentInvoice.currency] || '$'
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Helvetica Neue', Arial, sans-serif; 
              background: #ffffff; 
              color: #0f0e0d;
              padding: 40px;
              line-height: 1.5;
            }
            .invoice { max-width: 700px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #f2ede3; }
            .company h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #0f0e0d; }
            .company p { font-size: 13px; color: #7a7268; margin-bottom: 2px; }
            .badge { background: linear-gradient(135deg, #c8973a, #daa520); color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 1px; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .detail-block { flex: 1; }
            .detail-block h3 { font-size: 10px; color: #7a7268; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
            .detail-block p { font-size: 13px; color: #0f0e0d; margin-bottom: 2px; }
            .detail-block strong { font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; padding: 12px 8px; background: #f2ede3; font-size: 10px; color: #7a7268; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
            th:last-child { text-align: right; }
            td { padding: 14px 8px; border-bottom: 1px solid #f2ede3; font-size: 13px; color: #0f0e0d; }
            td:last-child { text-align: right; font-weight: 500; }
            .totals { margin-left: auto; width: 220px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #7a7268; }
            .total-row span:last-child { color: #0f0e0d; font-weight: 500; }
            .total-final { border-top: 2px solid #0f0e0d; margin-top: 8px; padding-top: 12px; }
            .total-final span { font-size: 16px; font-weight: 700; color: #0f0e0d; }
            .notes { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f2ede3; }
            .notes h3 { font-size: 10px; color: #7a7268; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
            .notes p { font-size: 13px; color: #7a7268; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div class="company">
                <h1>${currentInvoice.businessName || 'Your Business'}</h1>
                <p>${currentInvoice.businessEmail || ''}</p>
                <p>${currentInvoice.businessAddress || ''}</p>
              </div>
              <div class="badge">INVOICE</div>
            </div>
            
            <div class="details">
              <div class="detail-block">
                <h3>Bill To</h3>
                <p><strong>${currentInvoice.clientName || 'Client Name'}</strong></p>
                <p>${currentInvoice.clientEmail || ''}</p>
                <p>${currentInvoice.clientAddress || ''}</p>
              </div>
              <div class="detail-block" style="text-align: right;">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> ${currentInvoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${currentInvoice.invoiceDate}</p>
                <p><strong>Due:</strong> ${currentInvoice.dueDate}</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${currentInvoice.items.map(item => `
                  <tr>
                    <td>${item.description || 'Item'}</td>
                    <td>${item.quantity}</td>
                    <td>${symbol}${item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>${symbol}${(item.quantity * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${symbol}${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row">
                <span>Tax (${currentInvoice.taxRate}%)</span>
                <span>${symbol}${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row total-final">
                <span>Total</span>
                <span>${symbol}${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            ${currentInvoice.notes ? `
              <div class="notes">
                <h3>Notes</h3>
                <p>${currentInvoice.notes}</p>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `
  }

  const handleDownload = async (format: 'pdf' | 'jpeg' = 'pdf') => {
    if (isDownloading) return
    setIsDownloading(true)
    const invNum = (invNumber || 'invoice').replace(/[^a-zA-Z0-9\-_]/g, '-')

    try {
      // Load html2canvas from jsdelivr CDN
      await loadScript(
        'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
        'html2canvas'
      )
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvas = (window as any).html2canvas
      if (!html2canvas) {
        throw new Error('html2canvas failed to initialize')
      }

      // Create iframe with pure HTML/CSS invoice (no Tailwind, no CSS variables)
      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.left = '-9999px'
      iframe.style.top = '0'
      iframe.style.width = '800px'
      iframe.style.height = '1200px'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      const invoiceHTML = generateInvoiceHTML()
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error('Could not access iframe document')
      }
      
      iframeDoc.open()
      iframeDoc.write(invoiceHTML)
      iframeDoc.close()

      // Wait for iframe to render
      await new Promise(resolve => setTimeout(resolve, 300))

      const invoiceEl = iframeDoc.querySelector('.invoice') as HTMLElement
      if (!invoiceEl) {
        throw new Error('Invoice element not found')
      }

      // Create canvas from the iframe content
      const canvas = await html2canvas(invoiceEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      document.body.removeChild(iframe)

      if (format === 'jpeg') {
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const link = document.createElement('a')
        link.href = imgData
        link.download = `${invNum}.jpg`
        link.click()
        showToast(`Downloaded ${invNum}.jpg`)
      } else {
        // Load jsPDF from jsdelivr CDN
        await loadScript(
          'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
          'jspdf'
        )
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jspdfLib = (window as any).jspdf
        if (!jspdfLib?.jsPDF) {
          throw new Error('jsPDF failed to initialize')
        }
        const { jsPDF } = jspdfLib

        const imgData = canvas.toDataURL('image/png')
        const pdfWidth = 210
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        
        const pdf = new jsPDF({
          orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
          unit: 'mm',
          format: [pdfWidth, pdfHeight],
        })
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`${invNum}.pdf`)
        showToast(`Downloaded ${invNum}.pdf`)
      }
    } catch (error) {
      showToast(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    const previewEl = document.getElementById('invoice-preview-content')
    if (!previewEl) return

    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      showToast('Please allow popups to print the invoice.')
      return
    }

    const invHtml = previewEl.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invNumber || ''}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
          <script src="https://cdn.tailwindcss.com"><\/script>
          <style>
            :root {
              --ink: #0f0e0d;
              --paper: #faf8f4;
              --cream: #f2ede3;
              --gold: #c8973a;
              --muted: #7a7268;
              --border: #ddd8cc;
              --success: #2d7d4f;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: "DM Sans", system-ui, sans-serif; 
              background: white;
              padding: 0;
            }
            .invoice-container {
              max-width: 720px;
              margin: 0 auto;
              padding: 40px;
              background: white;
            }
            @media print {
              body { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .invoice-container {
                padding: 20px;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${invHtml}
          </div>
          <script>
            // Wait for fonts and styles to load
            setTimeout(function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }, 500);
          <\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
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
                onClick={() => handleDownload('pdf')}
                className="bg-pro hover:bg-pro-dk text-white"
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 mr-1.5" />
                {isDownloading ? 'Loading...' : 'PDF'}
              </Button>
              <Button
                onClick={() => handleDownload('jpeg')}
                variant="outline"
                className="border-border hover:border-gold hover:text-gold"
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 mr-1.5" />
                {isDownloading ? 'Loading...' : 'JPEG'}
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="border-border hover:border-gold hover:text-gold"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print
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
