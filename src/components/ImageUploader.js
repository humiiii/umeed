'use client';

import { useState, useRef, useCallback } from 'react';
import { ImagePlus, X, Loader } from 'lucide-react';

export default function ImageUploader({ imageUrl, onImageChange, showToast }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      if (showToast) showToast('Please select a valid image file', 'error');
      return;
    }

    setIsUploading(true);
    if (showToast) showToast('Uploading image...', 'success');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onImageChange(data.url);
        if (showToast) showToast('Image uploaded successfully!', 'success');
      } else {
        console.error('Upload failed:', data.error);
        if (showToast) showToast(data.error || 'Failed to upload image', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (showToast) showToast('An error occurred during upload', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [onImageChange, showToast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleRemove = useCallback(() => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (showToast) showToast('Image removed', 'success');
  }, [onImageChange, showToast]);

  if (isUploading) {
    return (
      <div className="upload-loading" id="upload-loading">
        <div className="spinner" />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Uploading...
        </span>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="upload-preview" id="upload-preview">
        <img src={imageUrl} alt="Upload preview" />
        <button
          className="upload-preview-remove"
          onClick={handleRemove}
          aria-label="Remove image"
          id="remove-image-btn"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        id="upload-zone"
      >
        <ImagePlus size={32} strokeWidth={1.5} className="upload-zone-icon" />
        <div className="upload-zone-text">
          <strong>Click to upload</strong> or drag and drop
          <br />
          PNG, JPG, GIF up to 10MB
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-input"
      />
    </>
  );
}
