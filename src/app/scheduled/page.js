'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarClock, Loader } from 'lucide-react';
import PostCard from '@/components/PostCard';

export default function ScheduledPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
      } else {
        showToast('Failed to load scheduled posts', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      showToast('Error loading scheduled posts', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCancel = useCallback((id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const queuedCount = posts.filter((p) => (p.status || 'pending') === 'pending').length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" id="scheduled-title">Scheduled</h1>
        <p className="page-subtitle">
          {queuedCount > 0
            ? `${queuedCount} post${queuedCount !== 1 ? 's' : ''} queued`
            : 'Your queued posts will appear here'}
        </p>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state" id="empty-state">
          <CalendarClock size={48} strokeWidth={1} className="empty-state-icon" />
          <p className="empty-state-title">No scheduled posts</p>
          <p className="empty-state-text">
            Posts you schedule from Compose will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} id="posts-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onCancel={handleCancel} showToast={showToast} />
          ))}
        </div>
      )}

      {/* Toast Overlay */}
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
