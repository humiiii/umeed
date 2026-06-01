// In-memory post store
// Data resets on server restart — fine for a personal tool.
// Swap for SQLite/JSON file if persistence is needed later.

let posts = [];
let nextId = 1;

export function addPost({ caption, imageUrl, platforms, scheduledAt, mode }) {
  const post = {
    id: String(nextId++),
    caption: caption || '',
    imageUrl: imageUrl || null,
    platforms: platforms || [],
    scheduledAt: scheduledAt || null,
    mode: mode || 'now', // 'now' | 'scheduled'
    status: mode === 'scheduled' ? 'scheduled' : 'published',
    createdAt: new Date().toISOString(),
  };
  posts.unshift(post); // newest first
  return post;
}

export function getPosts(filter) {
  if (filter?.status) {
    return posts.filter((p) => p.status === filter.status);
  }
  return [...posts];
}

export function getPost(id) {
  return posts.find((p) => p.id === id) || null;
}

export function deletePost(id) {
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const [removed] = posts.splice(index, 1);
  return removed;
}

export function updatePost(id, updates) {
  const post = posts.find((p) => p.id === id);
  if (!post) return null;
  Object.assign(post, updates);
  return post;
}
