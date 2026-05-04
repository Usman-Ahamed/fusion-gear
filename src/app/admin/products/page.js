'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, ShoppingBag, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

function ProductForm({ product, categories, onSave, onCancel }) {
  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(product?.description || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId?._id || product?.categoryId || '');
  const [price, setPrice] = useState(product?.price || '');
  const [websiteUrl, setWebsiteUrl] = useState(product?.websiteUrl || '');
  const [featured, setFeatured] = useState(product?.featured || false);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('price', price);
      formData.append('websiteUrl', websiteUrl);
      formData.append('featured', featured.toString());
      const imgKey = product ? 'newImages' : 'images';
      images.forEach(img => formData.append(imgKey, img));

      const url = product ? `/api/products/${product._id}` : '/api/products';
      const method = product ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error();
      toast.success(product ? 'Product updated' : 'Product created');
      onSave();
    } catch { toast.error('Failed to save product'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-xl font-heading font-bold">{product ? 'Edit Product' : 'New Product'}</h2>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50" placeholder="e.g., Barcelona 24/25 Home Kit" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50">
            <option value="">None</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Price</label>
          <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., LKR 3,500" className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Website Link <span className="text-text-muted font-normal">(optional)</span></label>
        <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yourstore.com/product-page" className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Images <span className="text-text-muted font-normal">(1080×1350 recommended)</span></label>
        <input type="file" accept="image/*" multiple onChange={e => setImages([...e.target.files])} className="w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-bg-elevated file:text-text-secondary file:font-medium hover:file:bg-border" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded" />
        <span className="text-sm text-text-secondary">Featured product</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : product ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-bg-surface border border-border text-sm rounded-xl hover:bg-bg-elevated transition-colors">Cancel</button>
      </div>
    </form>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([fetch('/api/products?limit=100'), fetch('/api/categories')]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      setProducts(pData.products || []);
      setCategories(cData.categories || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Products</h1>
          <p className="text-text-muted text-sm mt-1">{products.length} products</p>
        </div>
        <button onClick={() => { setEditProduct(null); setShowForm(true); }} className="px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover flex items-center gap-2 transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-xl skeleton" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">No products yet</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-accent text-sm font-medium">Add your first product</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <motion.div key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="rounded-xl overflow-hidden bg-bg-surface border border-border hover:border-border-light transition-colors">
              <div className="aspect-square bg-bg-elevated">
                {product.images?.[0] ? (
                  <img src={product.images[0].thumbnailUrl || product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={24} className="text-text-muted" /></div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{product.title}</p>
                <p className="text-xs text-text-muted mt-0.5">{product.categoryId?.name || 'Uncategorized'}</p>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={() => { setEditProduct(product); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-accent transition-colors"><Edit3 size={14} /></button>
                  <button onClick={() => deleteProduct(product._id)} className="p-1.5 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <ProductForm product={editProduct} categories={categories} onSave={() => { setShowForm(false); fetchProducts(); }} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
