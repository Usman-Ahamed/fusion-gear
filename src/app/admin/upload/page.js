'use client';

import { useState } from 'react';
import { compressImage } from '@/lib/compressImage';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BulkUploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, successful: 0, failed: 0 });
  const [results, setResults] = useState(null);

  const addFiles = (list) => {
    const newFiles = Array.from(list || [])
      .filter((file) => /^image\/(jpeg|png|webp)$/.test(file.type))
      .map((file) => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString(36).slice(2) }));
    setFiles((prev) => [...prev, ...newFiles]);
  };
  const [isDragActive, setDragActive] = useState(false);

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
      formData.append('images', await compressImage(files[i].file));

      try {
        const res = await fetch('/api/reviews/bulk', { method: 'POST', body: formData });
        const data = await res.json();
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
        <h1 className="text-2xl font-bold">Bulk Upload</h1>
        <p className="text-text-muted text-sm mt-1">Upload multiple review screenshots at once. Each image becomes an approved review straight away (no star rating).</p>
      </div>

      {/* Results */}
              {results && (
          <div
            className={`mb-6 p-4 rounded-xl border ${results.failed === 0 ? 'bg-accent/10 border-accent/20' : 'bg-warning/10 border-warning/20'}`}>
            <div className="flex items-center gap-3">
              {results.failed === 0 ? <CheckCircle className="text-accent" size={20} /> : <AlertCircle className="text-warning" size={20} />}
              <div>
                <p className="font-medium">{results.successful} of {results.total} images uploaded successfully</p>
                {results.failed > 0 && <p className="text-sm text-text-muted mt-0.5">{results.failed} failed — try re-uploading those files</p>}
              </div>
              <button onClick={clearAll} className="ml-auto text-sm text-text-muted hover:text-text-primary">Clear</button>
            </div>
          </div>
        )}
      
      {/* Drop Zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }}
        className={`block border-2 border-dashed p-10 text-center cursor-pointer mb-6 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent ${isDragActive ? 'border-ink bg-mist' : 'border-line hover:border-ink'}`}>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
        <Upload size={40} className="mx-auto text-text-muted mb-4" />
        <p className="text-lg font-medium mb-1">{isDragActive ? 'Drop images here' : 'Drag and drop review screenshots'}</p>
        <p className="text-sm text-text-muted">or click to browse · JPG, PNG, WebP · compressed automatically before upload</p>
      </label>

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
                <img src={f.preview} alt={f.file.name} className="w-full h-full object-cover" />
                <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                  aria-label={`Remove ${f.file.name}`} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white">
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
            <div className="h-full bg-ink rounded-full transition-[width]" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-text-muted">
            <span className="text-accent">✓ {progress.successful} successful</span>
            {progress.failed > 0 && <span className="text-error">✗ {progress.failed} failed</span>}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button onClick={handleUpload} disabled={files.length === 0 || uploading}
        className="w-full sm:w-auto px-8 py-3.5 bg-ink text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
        {uploading ? (
          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
        ) : (
          <><Upload size={18} /> Upload {files.length} Image{files.length !== 1 ? 's' : ''} as Reviews</>
        )}
      </button>
    </div>
  );
}
