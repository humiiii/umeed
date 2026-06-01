'use client';

import { useState } from 'react';
import { X, Clock, Loader } from 'lucide-react';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const PLATFORM_NAMES = {
  twitter: 'X',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
};

export default function PostCard({ post, onCancel, showToast }) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    if (showToast) showToast('Cancelling scheduled post...', 'success');
    
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (res.ok) {
        onCancel(post.id);
        if (showToast) showToast('Post cancelled successfully!', 'success');
      } else {
        if (showToast) showToast(data.error || 'Failed to cancel post', 'error');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      if (showToast) showToast('An error occurred while cancelling the post', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="post-card" id={`post-card-${post.id}`}>
      {/* Thumbnail */}
      {post.imageUrl && (
        <img
          className="post-card-thumb"
          src={post.imageUrl}
          alt=""
        />
      )}

      {/* Body */}
      <div className="post-card-body">
        {post.caption && (
          <p className="post-card-caption">{post.caption}</p>
        )}

        <div className="post-card-meta">
          {/* Platform badges */}
          {post.platforms.map((p) => (
            <span key={p} className="post-card-platform-badge">
              {PLATFORM_NAMES[p] || p}
            </span>
          ))}

          {/* Schedule time */}
          {post.scheduledAt && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {formatDate(post.scheduledAt)}
            </span>
          )}
        </div>
      </div>

      {/* Cancel button */}
      <div className="post-card-actions">
        <button
          className="btn btn-danger btn-sm"
          onClick={handleCancel}
          disabled={isCancelling}
          id={`cancel-post-${post.id}`}
        >
          {isCancelling ? (
            <Loader size={12} className="spinner" />
          ) : (
            <>
              <X size={12} />
              Cancel
            </>
          )}
        </button>
      </div>
    </div>
  );
}
