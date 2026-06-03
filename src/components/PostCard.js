'use client';

import { useState } from 'react';
import { X, Clock, Loader, CheckCircle2, AlertCircle } from 'lucide-react';

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

const STATUS_CONFIG = {
  pending: {
    label: 'Scheduled',
    color: 'var(--text-secondary)',
    bg: 'var(--bg-secondary)',
    icon: Clock,
  },
  published: {
    label: 'Published',
    color: 'var(--accent)',
    bg: 'var(--accent-subtle)',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    color: 'var(--danger)',
    bg: 'var(--danger-subtle)',
    icon: AlertCircle,
  },
};

export default function PostCard({ post, onCancel, showToast }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const actionLabel = post.status === 'pending' ? 'Cancelling' : 'Clearing';
    const successLabel = post.status === 'pending' ? 'Post cancelled' : 'Post cleared';
    
    if (showToast) showToast(`${actionLabel} post...`, 'success');
    
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        onCancel(post.id);
        if (showToast) showToast(`${successLabel} successfully!`, 'success');
      } else {
        const data = await res.json();
        if (showToast) showToast(data.error || 'Failed to complete action', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      if (showToast) showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const status = post.status || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

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
          {/* Status Badge */}
          <span
            className="post-card-platform-badge"
            style={{
              color: config.color,
              backgroundColor: config.bg,
              border: `1px solid ${config.color}15`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <StatusIcon size={11} />
            {config.label}
          </span>

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

      {/* Action Button */}
      <div className="post-card-actions">
        {status === 'published' ? (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDelete}
            disabled={isDeleting}
            id={`delete-post-${post.id}`}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            {isDeleting ? (
              <Loader size={12} className="spinner" />
            ) : (
              'Clear'
            )}
          </button>
        ) : (
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={isDeleting}
            id={`cancel-post-${post.id}`}
          >
            {isDeleting ? (
              <Loader size={12} className="spinner" />
            ) : (
              <>
                <X size={12} />
                {status === 'failed' ? 'Clear' : 'Cancel'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
