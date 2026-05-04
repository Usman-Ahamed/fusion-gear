'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, Camera } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import toast from 'react-hot-toast';

export default function SubmitReviewPage() {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] }, maxFiles: 1, maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { toast.error('Please upload an image'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name || 'Happy Customer');
      formData.append('text', text);
      formData.append('rating', rating.toString());
      formData.append('image', image);
      const res = await fetch('/api/reviews', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
      toast.success('Review submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center"><CheckCircle size={40} className="text-accent" /></div>
          <h2 className="text-2xl font-heading font-bold mb-3">Thank You!</h2>
          <p className="text-text-secondary mb-6">Your review has been submitted and will appear on our page after admin approval.</p>
          <button onClick={() => { setSubmitted(false); setName(''); setText(''); setRating(5); setImage(null); setPreview(null); }} className="px-6 py-3 bg-bg-surface border border-border rounded-xl text-sm font-medium hover:bg-bg-elevated transition-colors">Submit Another Review</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <section className="relative py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-deeper/30 to-bg-primary" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Share Your Experience</h1>
            <p className="text-text-secondary max-w-lg mx-auto">Got your jersey? Let us know how you liked it! Your review helps others shop with confidence.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="max-w-xl mx-auto px-4">
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Photo <span className="text-error">*</span></label>
              {preview ? (
                <div className="relative w-full aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden border border-border">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"><X size={16} /></button>
                </div>
              ) : (
                <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-bg-surface'}`}>
                  <input {...getInputProps()} />
                  <Camera size={32} className="mx-auto text-text-muted mb-3" />
                  <p className="text-sm text-text-secondary">Drag & drop your photo here</p>
                  <p className="text-xs text-text-muted mt-1">or click to browse (max 10MB)</p>
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Kamal" maxLength={100} className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-all" />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Rating</label>
              <StarRating rating={rating} size={28} interactive onChange={setRating} />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Your Review</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Tell us about your experience..." rows={4} maxLength={500} className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 resize-none transition-all" />
              <p className="text-xs text-text-muted mt-1 text-right">{text.length}/500</p>
            </div>

            <button type="submit" disabled={submitting || !image} className="w-full py-3.5 bg-gradient-to-r from-accent to-green-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              {submitting ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>) : (<><Upload size={18} />Submit Review</>)}
            </button>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
