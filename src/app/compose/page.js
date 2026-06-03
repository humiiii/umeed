'use client';

import { useState, useCallback } from 'react';
import { Send, Sparkles, Loader } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import PlatformToggles from '@/components/PlatformToggles';
import ScheduleControl from '@/components/ScheduleControl';

export default function ComposePage() {
  const [imageUrl, setImageUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [mode, setMode] = useState('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [captionError, setCaptionError] = useState('');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleGenerateCaption = async () => {
    if (!imageUrl) {
      setCaptionError('Upload an image first to generate a caption');
      showToast('Upload an image first', 'error');
      return;
    }

    setIsGenerating(true);
    setCaptionError('');
    showToast('Generating trendy caption with Gemini...', 'success');

    try {
      const res = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, context: caption }),
      });

      const data = await res.json();

      if (res.ok) {
        setCaption(data.caption);
        showToast('Caption generated successfully!', 'success');
      } else {
        setCaptionError(data.error || 'Failed to generate caption');
        showToast('Failed to generate caption', 'error');
      }
    } catch (err) {
      setCaptionError('An error occurred during generation');
      showToast('Failed to generate caption', 'error');
      console.error('Caption generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    // Validation
    if (!caption && !imageUrl) {
      showToast('Add a caption or image', 'error');
      return;
    }
    if (platforms.length === 0) {
      showToast('Select at least one platform', 'error');
      return;
    }
    if (mode === 'scheduled' && !scheduledAt) {
      showToast('Pick a schedule time', 'error');
      return;
    }

    setIsPublishing(true);
    showToast(
      mode === 'scheduled' ? 'Scheduling post...' : 'Publishing post...',
      'success'
    );
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          imageUrl,
          platforms,
          scheduledAt: mode === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
          mode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Reset form
        setCaption('');
        setImageUrl(null);
        setPlatforms([]);
        setMode('now');
        setScheduledAt('');
        showToast(
          mode === 'scheduled' ? 'Post scheduled!' : 'Post published!',
          'success'
        );
      } else {
        showToast(data.error || 'Something went wrong', 'error');
      }
    } catch (err) {
      showToast('Failed to publish', 'error');
      console.error('Publish error:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const isValid =
    (caption || imageUrl) && platforms.length > 0 && (mode !== 'scheduled' || scheduledAt);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" id="compose-title">Compose</h1>
        <p className="page-subtitle">Create and publish to your platforms</p>
      </div>

      {/* Image Upload */}
      <div className="compose-section">
        <label className="compose-label">Media</label>
        <ImageUploader imageUrl={imageUrl} onImageChange={setImageUrl} showToast={showToast} />
      </div>

      {/* Caption */}
      <div className="compose-section">
        <label className="compose-label" htmlFor="caption-input">Caption</label>
        <div className="caption-field">
          <textarea
            className="caption-textarea"
            id="caption-input"
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
          />
          <div className="caption-footer">
            <span className="char-count" id="char-count">
              {caption.length} characters
            </span>
            <button
              className="ai-generate-btn"
              id="ai-generate-btn"
              onClick={handleGenerateCaption}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader size={14} className="spinner" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate
                </>
              )}
            </button>
          </div>
          {captionError && (
            <p className="caption-error-text" id="caption-error" style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '6px' }}>
              {captionError}
            </p>
          )}
        </div>
      </div>

      {/* Platforms */}
      <div className="compose-section">
        <label className="compose-label">Platforms</label>
        <PlatformToggles selected={platforms} onChange={setPlatforms} />
      </div>

      {/* Schedule Control */}
      <div className="compose-section">
        <label className="compose-label">When to post</label>
        <ScheduleControl
          mode={mode}
          onModeChange={setMode}
          scheduledAt={scheduledAt}
          onScheduledAtChange={setScheduledAt}
        />
      </div>

      {/* Publish Button */}
      <div className="compose-section" style={{ paddingTop: '8px' }}>
        <button
          className="btn btn-primary btn-full"
          onClick={handlePublish}
          disabled={isPublishing || !isValid}
          id="publish-btn"
        >
          {isPublishing ? (
            <>
              <Loader size={16} className="spinner" />
              Publishing...
            </>
          ) : (
            <>
              <Send size={16} />
              {mode === 'scheduled' ? 'Schedule Post' : 'Publish Now'}
            </>
          )}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`} id="toast">
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
