'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BulkUploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, successful: 0, failed: 0 });
  const [results, setResults] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).slice(2),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (id) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setResults(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setResults(null);
    setProgress({ current: 0, total: files.length, successful: 0, failed: 0 });

    // Upload one at a time for reliability
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('images', files[i].file);

      try {
        const res = await fetch('/api/reviews/bulk', { method: 'POST', body: formData });
        const data = await res.json();
        console.log(`Upload ${i + 1}/${files.length}:`, res.status, data);
        if (res.ok) {
          successful += data.results?.successful?.length || 0;
          failed += data.results?.failed?.length || 0;
        } else {
          console.error(`Upload failed:`, data.error);
          failed += 1;
        }
      } catch (err) {
        console.error(`Upload error:`, err);
        failed += 1;
      }

      setProgress({ current: i + 1, total: files.length, successful, failed });
    }

    setResults({ successful, failed, total: files.length });
    setUploading(false);
    if (successful > 0) toast.success(`${successful} reviews uploaded!`);
    if (failed > 0) toast.error(`${failed} uploads failed`);
  };

  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Bulk Upload</h1>
        <p className="text-text-muted text-sm mt-1">Upload multiple review screenshots at once. Each image becomes an approved review automatically.</p>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-6 p-4 rounded-xl border ${results.failed === 0 ? 'bg-accent/10 border-accent/20' : 'bg-warning/10 border-warning/20'}`}>
            <div className="flex items-center gap-3">
              {results.failed === 0 ? <CheckCircle className="text-accent" size={20} /> : <AlertCircle className="text-warning" size={20} />}
              <div>
                <p className="font-medium">{results.successful} of {results.total} images uploaded successfully</p>
                {results.failed > 0 && <p className="text-sm text-text-muted mt-0.5">{results.failed} failed — try re-uploading those files</p>}
              </div>
              <button onClick={clearAll} className="ml-auto text-sm text-text-muted hover:text-text-primary">Clear</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop Zone */}
      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-6 ${
          isDragActive ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-border hover:border-accent/50 hover:bg-bg-surface/50'
        }`}>
        <input {...getInputProps()} />
        <Upload size={40} className="mx-auto text-text-muted mb-4" />
        <p className="text-lg font-medium mb-1">
          {isDragActive ? 'Drop images here...' : 'Drag & drop review screenshots'}
        </p>
        <p className="text-sm text-text-muted">or click to browse • JPEG, PNG, WebP, GIF • Max 10MB each</p>
        <p className="text-xs text-accent mt-2">Supports 100+ images at once</p>
      </div>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
            <div className="flex gap-2">
              <button onClick={clearAll} className="text-sm text-text-muted hover:text-error flex items-center gap-1 transition-colors">
                <Trash2 size={14} /> Clear all
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-64 overflow-y-auto p-1">
            {files.map(f => (
              <div key={f.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                <img src={f.preview} alt="" className="w-full h-full object-cover" />
                <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-6 p-4 rounded-xl bg-bg-surface border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Uploading... {progress.current}/{progress.total}</p>
            <p className="text-sm text-accent font-mono">{progressPercent}%</p>
          </div>
          <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-accent to-green-dark rounded-full"
              animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.3 }} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-text-muted">
            <span className="text-accent">✓ {progress.successful} successful</span>
            {progress.failed > 0 && <span className="text-error">✗ {progress.failed} failed</span>}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button onClick={handleUpload} disabled={files.length === 0 || uploading}
        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-accent to-green-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
        {uploading ? (
          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
        ) : (
          <><Upload size={18} /> Upload {files.length} Image{files.length !== 1 ? 's' : ''} as Reviews</>
        )}
      </button>
    </div>
  );
}
