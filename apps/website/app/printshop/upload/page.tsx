'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';

const ALLOWED_EXTENSIONS = ['stl', '3mf', 'obj', 'step', 'stp', 'scad', 'zip', 'pdf', 'png', 'jpg', 'jpeg', 'svg', 'dxf'];
const MAX_FILE_SIZE = 100 * 1024 * 1024;

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [orderType, setOrderType] = useState<'3d' | 'dtf'>('3d');
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectTitle: '',
    description: '',
    quantity: '1',
    material: 'PLA',
    rushOrder: false,
    designAssistance: false,
    isLocalPickup: false,
  });

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_EXTENSIONS.includes(ext)) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      newFiles.push({
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: ext,
        status: 'uploaded',
        progress: 100,
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const updateForm = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#030504] text-white">
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/printshop" className="text-[#8D98A5] hover:text-white text-sm mb-4 inline-block">&larr; Back to Print Shop</Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Upload & Get Quote</h1>
            <p className="text-[#BFC4C9] mb-8">Upload your files and provide order details. We will send you a quote within 24 hours.</p>
          </motion.div>

          {/* Order Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setOrderType('3d')}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-colors ${orderType === '3d' ? 'bg-[#27C7FF]/15 text-[#27C7FF] border border-[#27C7FF]/30' : 'bg-[#111815] text-[#8D98A5] border border-[#BFC4C9]/10'}`}
            >
              3D Printing
            </button>
            <button
              onClick={() => setOrderType('dtf')}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-colors ${orderType === 'dtf' ? 'bg-[#72FF3B]/15 text-[#72FF3B] border border-[#72FF3B]/30' : 'bg-[#111815] text-[#8D98A5] border border-[#BFC4C9]/10'}`}
            >
              DTF Transfer
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Upload Files</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? 'border-[#72FF3B] bg-[#72FF3B]/5' : 'border-[#BFC4C9]/20 hover:border-[#BFC4C9]/40'}`}
            >
              <Upload className="w-8 h-8 mx-auto mb-3 text-[#8D98A5]" />
              <p className="text-sm text-[#BFC4C9] mb-1">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-[#8D98A5]">
                {orderType === '3d' ? 'STL, 3MF, OBJ, STEP, SCAD, ZIP' : 'PNG, SVG, PDF, JPG'} — Max 100MB per file
              </p>
              <input
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.map(e => `.${e}`).join(',')}
                onChange={e => handleFiles(e.target.files)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>
          </div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="mb-6 space-y-2">
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#111815] border border-[#BFC4C9]/10">
                  <FileText className="w-5 h-5 text-[#27C7FF] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-[#8D98A5]">{formatFileSize(file.size)} · .{file.type}</p>
                  </div>
                  {file.status === 'uploaded' && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                  {file.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <button onClick={() => removeFile(file.id)} className="text-[#8D98A5] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8D98A5] mb-1">Full Name *</label>
                <input type="text" value={formData.name} onChange={e => updateForm('name', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#111815] border border-[#BFC4C9]/15 text-white text-sm focus:outline-none focus:border-[#72FF3B]/50" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs text-[#8D98A5] mb-1">Email *</label>
                <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#111815] border border-[#BFC4C9]/15 text-white text-sm focus:outline-none focus:border-[#72FF3B]/50" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#8D98A5] mb-1">Phone (optional)</label>
              <input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#111815] border border-[#BFC4C9]/15 text-white text-sm focus:outline-none focus:border-[#72FF3B]/50" placeholder="(555) 123-4567" />
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Order Details</h3>
            <div>
              <label className="block text-xs text-[#8D98A5] mb-1">Project Title</label>
              <input type="text" value={formData.projectTitle} onChange={e => updateForm('projectTitle', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#111815] border border-[#BFC4C9]/15 text-white text-sm focus:outline-none focus:border-[#72FF3B]/50" placeholder="e.g., Packout Monitor Mount v2" />
            </div>
            <div>
              <label className="block text-xs text-[#8D98A5] mb-1">Description / Notes</label>
              <textarea value={formData.description} onChange={e => updateForm('description', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-[#111815] border border-[#BFC4C9]/15 text-white text-sm focus:outline-none focus:border-[#72FF3B]/50 resize-none" placeholder="Describe what you need, dimensions, use case, etc." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8D98A5] mb-1">Quantity</label>
                <input type="number" min="1" value={formData.quantity} onChange={e => updateForm('quantity', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#111815] border border-[#BFC4C9]/15 text-white text-sm focus:outline-none focus:border-[#72FF3B]/50" />
              </div>
              {orderType === '3d' && (
                <div>
                  <label className="block text-xs text-[#8D98A5] mb-1">Material Preference</label>
                  <select value={formData.material} onChange={e => updateForm('material', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#111815] border border-[#BFC4C9]/15 text-white text-sm focus:outline-none focus:border-[#72FF3B]/50">
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                    <option value="TPU">TPU</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={formData.rushOrder} onChange={e => updateForm('rushOrder', e.target.checked)} className="rounded border-[#BFC4C9]/30 bg-[#111815]" />
                <span className="text-[#BFC4C9]">Rush Order (+50%)</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={formData.designAssistance} onChange={e => updateForm('designAssistance', e.target.checked)} className="rounded border-[#BFC4C9]/30 bg-[#111815]" />
                <span className="text-[#BFC4C9]">Design Assistance Needed</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={formData.isLocalPickup} onChange={e => updateForm('isLocalPickup', e.target.checked)} className="rounded border-[#BFC4C9]/30 bg-[#111815]" />
                <span className="text-[#BFC4C9]">Local Pickup</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            className="w-full py-3 bg-[#72FF3B] text-black font-semibold rounded-lg hover:bg-[#8AFF52] transition-colors disabled:opacity-50"
            disabled={!formData.name || !formData.email || files.length === 0}
          >
            Submit Quote Request
          </button>
          <p className="text-xs text-[#8D98A5] text-center mt-3">
            We will review your files and send a detailed quote to your email within 24 hours.
          </p>
        </div>
      </section>
    </div>
  );
}
