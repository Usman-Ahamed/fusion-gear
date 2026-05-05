'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, ExternalLink, MessageCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94XXXXXXXXX';

function ProductCard({ product, onClick, index }) {
  const mainImage = product.images?.[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
      onClick={() => onClick(product)}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-bg-surface border border-border hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {mainImage ? (
          <Image src={mainImage.thumbnailUrl || mainImage.url} alt={product.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-bg-elevated flex items-center justify-center"><ShoppingBag size={40} className="text-text-muted" /></div>
        )}
        {product.featured && (
          <div className="absolute top-3 left-3"><span className="px-2.5 py-1 bg-accent/90 text-white text-[10px] font-bold rounded-full uppercase">Featured</span></div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-text-primary truncate group-hover:text-accent transition-colors">{product.title}</h3>
        {product.categoryId?.name && <p className="text-xs text-text-muted mt-1">{product.categoryId.name}</p>}
        {product.price && <p className="text-accent font-semibold mt-2">{product.price}</p>}
      </div>
    </motion.div>
  );
}

function ProductModal({ product, onClose }) {
  const [selectedImage, setSelectedImage] = useState(0);
  if (!product) return null;

  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in ordering the "${product.title}"${product.price ? ` (${product.price})` : ''}. Is it available?`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <Modal isOpen={!!product} onClose={onClose}>
      <div className="sm:flex">
        <div className="sm:w-1/2">
          <div className="aspect-[3/4] relative">
            {product.images?.[selectedImage]?.url ? (
              <Image src={product.images[selectedImage].url} alt={product.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="w-full h-full bg-bg-elevated flex items-center justify-center">
                <ShoppingBag size={64} className="text-text-muted" />
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors relative ${i === selectedImage ? 'border-accent' : 'border-transparent'}`}>
                  <Image src={img.thumbnailUrl || img.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="sm:w-1/2 p-6 flex flex-col">
          <h2 className="text-2xl font-heading font-bold mb-2">{product.title}</h2>
          {product.categoryId?.name && <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full mb-4 w-fit">{product.categoryId.name}</span>}
          {product.price && <p className="text-2xl font-bold text-accent mb-4">{product.price}</p>}
          {product.description && <p className="text-text-secondary leading-relaxed mb-6">{product.description}</p>}

          <div className="mt-auto space-y-3">
            {/* WhatsApp Order Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#25D366]/25 transition-all"
            >
              <MessageCircle size={20} />
              Order via WhatsApp
            </a>

            {/* Website Order Button — only shows when websiteUrl is set */}
            {product.websiteUrl && (
              <a
                href={product.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 bg-gradient-to-r from-accent to-green-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all"
              >
                <ExternalLink size={18} />
                Order via Website
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (search) params.set('search', search);
    params.set('limit', '50');
    fetch(`/api/products?${params}`).then(r => r.json()).then(data => { setProducts(data.products || []); setLoading(false); }).catch(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div className="min-h-screen pt-20">
      <section className="relative py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-deeper/30 to-bg-primary" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-5xl font-heading font-bold mb-4">Our Products</h1>
            <p className="text-text-secondary max-w-xl mx-auto">Browse our collection of premium football jerseys, retro kits, and lifestyle fits.</p>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-16 sm:top-20 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-bg-surface border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-all" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button onClick={() => setSelectedCategory('all')} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-accent text-white' : 'bg-bg-surface text-text-secondary hover:text-text-primary border border-border'}`}>All</button>
              {categories.map(cat => (
                <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat._id ? 'bg-accent text-white' : 'bg-bg-surface text-text-secondary hover:text-text-primary border border-border'}`}>{cat.name}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (<div key={i}><div className="aspect-[3/4] rounded-2xl skeleton mb-3" /><div className="h-4 w-3/4 rounded skeleton mb-2" /><div className="h-3 w-1/2 rounded skeleton" /></div>))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20"><ShoppingBag size={48} className="mx-auto text-text-muted mb-4" /><p className="text-text-muted text-lg">No products found</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product, i) => (<ProductCard key={product._id} product={product} onClick={setSelectedProduct} index={i} />))}
            </div>
          )}
        </div>
      </section>
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
