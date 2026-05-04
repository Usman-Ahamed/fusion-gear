'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, FolderOpen, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success('Category created');
      setNewName('');
      fetchCategories();
    } catch (err) { toast.error(err.message || 'Failed to create'); }
    finally { setAdding(false); }
  };

  const updateCategory = async (id) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success('Category updated');
      setEditId(null);
      fetchCategories();
    } catch { toast.error('Failed to update'); }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category? Products in this category will become uncategorized.')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      toast.success('Category deleted');
      fetchCategories();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Categories</h1>
        <p className="text-text-muted text-sm mt-1">Organize your products into categories</p>
      </div>

      {/* Add Category */}
      <form onSubmit={addCategory} className="flex gap-3 mb-6">
        <input
          type="text" value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="New category name..." 
          className="flex-1 max-w-sm px-4 py-2.5 bg-bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-all"
        />
        <button type="submit" disabled={adding || !newName.trim()}
          className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2 transition-colors">
          <Plus size={16} /> Add
        </button>
      </form>

      {/* Categories List */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl skeleton" />)}</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">No categories yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <motion.div key={cat._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border hover:border-border-light transition-colors">
              <GripVertical size={16} className="text-text-muted shrink-0" />
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <FolderOpen size={14} className="text-accent" />
              </div>
              
              {editId === cat._id ? (
                <div className="flex-1 flex gap-2">
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                    className="flex-1 px-3 py-1.5 bg-bg-primary border border-accent/50 rounded-lg text-sm focus:outline-none"
                    onKeyDown={e => { if (e.key === 'Enter') updateCategory(cat._id); if (e.key === 'Escape') setEditId(null); }}
                  />
                  <button onClick={() => updateCategory(cat._id)} className="px-3 py-1.5 bg-accent text-white text-xs rounded-lg">Save</button>
                  <button onClick={() => setEditId(null)} className="px-3 py-1.5 bg-bg-elevated text-xs rounded-lg">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-text-muted">/{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditId(cat._id); setEditName(cat.name); }}
                      className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-accent transition-colors"><Edit3 size={14} /></button>
                    <button onClick={() => deleteCategory(cat._id)}
                      className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors"><Trash2 size={14} /></button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
