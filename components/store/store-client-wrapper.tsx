"use client"

import { useState } from "react"
import { Package, ShieldCheck, MessageSquare, ArrowRight, Tag, Info, Gavel, Sparkles } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { InquiryModal } from "@/components/messaging/inquiry-modal"
import Link from "next/link"

interface StoreClientWrapperProps {
  store: any
  products: any[]
}

export function StoreClientWrapper({ store, products }: StoreClientWrapperProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)

  const brandColor = store.brand_color || "#2563eb"
  const theme = store.theme_id || "modern"
  const font = store.font_preset || "sans"

  // Theme-specific glassmorphism and coloring
  const themeStyles = {
    modern: "rounded-[2.5rem] border-white dark:border-gray-800 bg-white/80 backdrop-blur-3xl",
    luxury: "rounded-none border-gold-500/20 bg-black/90 text-gold-500 font-serif",
    minimal: "rounded-lg border-gray-100 bg-white shadow-none font-sans tracking-tight",
  }[theme as 'modern' | 'luxury' | 'minimal'] || "rounded-[2.5rem] bg-white"

  const fontStyles = {
    sans: "font-sans",
    serif: "font-serif tracking-tight",
    mono: "font-mono tracking-tighter",
  }[font as 'sans' | 'serif' | 'mono'] || "font-sans"

  return (
    <div className={`min-h-screen ${fontStyles} selection:bg-blue-500 selection:text-white ${theme === 'luxury' ? 'bg-black text-white' : 'bg-[#fdfaff] dark:bg-black'}`}>
      
      {/* ── STORE HERO ── */}
      <section className={`relative pt-32 pb-24 px-6 md:px-12 overflow-hidden border-b ${theme === 'luxury' ? 'border-gold-500/10' : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800'}`}>
        
        {/* Abstract Background Splashes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 right-20 w-[600px] h-[600px] rounded-full blur-[140px] animate-pulse" style={{ background: brandColor }} />
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] rounded-full blur-[140px] opacity-40 animate-pulse delay-700" style={{ background: brandColor }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center gap-12">
          
          {/* Logo & ID */}
          <div className="flex flex-col items-center gap-6">
            <div className={`h-32 w-32 ${theme === 'luxury' ? 'rounded-full border-gold-500/50' : 'rounded-[2.5rem]'} bg-gray-50 dark:bg-gray-900 border-2 border-white dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-700`}>
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-5xl font-black text-white" style={{ background: brandColor }}>
                  {store.name[0]}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <h1 className={`text-5xl md:text-8xl font-black tracking-tighter leading-none capitalize ${theme === 'luxury' ? 'text-gold-500' : 'text-gray-900 dark:text-white'}`}>
                  {store.name}
                </h1>
                <ShieldCheck className={`h-8 w-8 ${theme === 'luxury' ? 'text-gold-500' : 'text-blue-500'}`} />
              </div>
              <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium italic max-w-2xl mx-auto">
                &quot;{store.tagline || "Your trusted boutique for premium items and electronics."}&quot;
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className={`flex flex-wrap items-center justify-center gap-8 pt-4 border-t w-full max-w-2xl ${theme === 'luxury' ? 'border-gold-500/10' : 'border-gray-100 dark:border-gray-800'}`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-800 shadow-inner">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Verified By</p>
                <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'luxury' ? 'text-gold-500' : 'text-gray-700 dark:text-gray-200'}`}>Eagle Choice Admin</p>
              </div>
            </div>
            {store.successful_deals > 10 && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white border border-yellow-300 shadow-xl shadow-yellow-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">Top Seller</p>
                  <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'luxury' ? 'text-gold-500' : 'text-gray-700 dark:text-gray-200'}`}>Gold Tier Partner</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-800">
                <Gavel className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Compliance</p>
                <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'luxury' ? 'text-gold-500' : 'text-gray-700 dark:text-gray-200'}`}>5% Fee Protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT SHOWCASE ── */}
      <main className="max-w-7xl mx-auto py-24 px-6 lg:px-8">
        <div className="flex items-center justify-between mb-16 px-4">
          <div className="space-y-1">
            <h2 className={`text-3xl font-black tracking-tighter uppercase ${theme === 'luxury' ? 'text-gold-500 italic' : 'text-gray-900 dark:text-white'}`}>Our Inventory</h2>
            <div className="h-1 w-20 rounded-full" style={{ background: theme === 'luxury' ? '#d4af37' : brandColor }} />
          </div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 opacity-60">
            <Info className="h-4 w-4" /> {products.length} Items Live
          </div>
        </div>

        {!products || products.length === 0 ? (
          <div className={`text-center py-32 ${themeStyles} border-2 border-dashed flex flex-col items-center justify-center space-y-6`}>
            <div className="h-24 w-24 rounded-3xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-200 dark:text-gray-800 border border-gray-100 dark:border-gray-800">
              <Package className="h-12 w-12" strokeWidth={1} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Store is empty.</h3>
              <p className="text-gray-400 font-medium italic">This boutique hasn&apos;t added any products to its virtual shelves yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className={`group relative ${themeStyles} shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] transition-all duration-700 overflow-hidden flex flex-col`}
              >
                {/* Brand Accent Top Bar */}
                <div className="h-2 w-full transition-all duration-500 opacity-20 group-hover:opacity-100" style={{ background: theme === 'luxury' ? '#d4af37' : brandColor }} />
                
                {/* Image Container */}
                <Link href={`/catalog/product/${product.id}`}>
                  <div className={`aspect-[4/3] bg-gray-100 dark:bg-gray-900 overflow-hidden relative ${theme === 'luxury' ? 'grayscale group-hover:grayscale-0 transition-all duration-1000' : ''}`}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-200">
                        <Package className="h-16 w-16" strokeWidth={1} />
                      </div>
                    )}
                    {/* Floating Price Tag */}
                    <div className={`absolute top-6 right-6 px-4 py-2 rounded-2xl shadow-xl border ${theme === 'luxury' ? 'bg-black/90 border-gold-500/50' : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800'}`}>
                      <p className={`text-lg font-black tracking-tighter ${theme === 'luxury' ? 'text-gold-500' : 'text-gray-900 dark:text-white'}`}>
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="p-8 space-y-6 flex-1 flex flex-col">
                  {/* Info Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <Tag className="h-3 w-3" /> {product.category || "General"}
                    </div>
                    <Link href={`/catalog/product/${product.id}`}>
                      <h3 className={`text-xl font-black tracking-tight leading-none hover:text-blue-600 transition-colors line-clamp-1 ${theme === 'luxury' ? 'text-gold-500 font-serif' : 'text-gray-900 dark:text-white'}`}>
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Agent Profile & Inquiry Section */}
                  <div className={`pt-6 border-t flex items-center justify-between ${theme === 'luxury' ? 'border-gold-500/20' : 'border-gray-100 dark:border-gray-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-sm font-black ring-2 ${theme === 'luxury' ? 'ring-gold-500/20 bg-black text-gold-500' : 'dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-blue-500/10'}`}>
                        {(product.agent?.full_name || store.owner?.full_name || "A")[0]}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Agent</p>
                        <p className={`text-xs font-bold leading-none mt-1 ${theme === 'luxury' ? 'text-gold-500' : 'text-gray-700 dark:text-gray-200'}`}>
                          {product.agent?.full_name?.split(' ')[0] || store.owner?.full_name?.split(' ')[0] || "Agent"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setSelectedProduct(product)
                        setIsInquiryOpen(true)
                      }}
                      className={`h-10 w-10 rounded-xl transition-all shadow-sm border ${theme === 'luxury' ? 'bg-black border-gold-500/50 text-gold-500 hover:bg-gold-500 hover:text-black' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:text-white hover:bg-black dark:hover:bg-blue-600'}`}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Add to Cart */}
                  <div className="pt-2">
                    <AddToCartButton
                      productId={product.id}
                      productName={product.name}
                      productPrice={product.price}
                      productImage={product.images?.[0]}
                      className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${theme === 'luxury' ? 'bg-gold-500 text-black hover:bg-white' : 'bg-gray-900 dark:bg-blue-950 text-white hover:bg-blue-600 shadow-xl'}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Inquiry Modal */}
      {selectedProduct && (
        <InquiryModal 
          isOpen={isInquiryOpen} 
          onClose={() => setIsInquiryOpen(false)} 
          product={selectedProduct}
          agent={{
            id: selectedProduct.agent?.id || store.owner_id,
            name: selectedProduct.agent?.full_name || store.owner?.full_name || "Specialized Agent",
            is_verified: true
          }}
          allowNegotiation={selectedProduct.is_negotiation_enabled}
        />
      )}

      {/* ── FOOTER ── */}
      <footer className={`max-w-7xl mx-auto py-12 px-6 border-t flex flex-col md:flex-row items-center justify-between gap-6 ${theme === 'luxury' ? 'border-gold-500/10 opacity-60' : 'border-gray-100 dark:border-gray-800'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Powered by Eagle Choice Infrastructure</p>
        <div className="flex gap-10">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic">24/7 Agent Monitoring</span>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic">Fraud Protection Active</span>
        </div>
      </footer>

    </div>
  )
}
