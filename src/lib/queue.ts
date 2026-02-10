/**
 * Content Queue - Save generated content
 * 
 * Stores: tweets, blog posts, LinkedIn posts, threads
 * Backend: localStorage (for now), Supabase (later)
 */

interface QueuedItem {
  id: string;
  type: string;
  content: string;
  source?: string;
  sourceType?: string;
  generatedAt: string;
  scheduledFor?: string;
  status: string;
  platform?: string;
  metadata?: {
    wordCount?: number;
    hashtags?: string[];
    tone?: string;
  };
}

const STORAGE_KEY = 'content-queue';

// Get queue from storage
export function getQueue(): QueuedItem[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save queue to storage
function saveQueue(queue: QueuedItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

// Add item to queue
export function addToQueue(item: Omit<QueuedItem, 'id' | 'generatedAt'>): QueuedItem {
  const queue = getQueue();
  
  const newItem: QueuedItem = {
    ...item,
    id: Date.now().toString(),
    generatedAt: new Date().toISOString(),
  };
  
  queue.unshift(newItem);
  saveQueue(queue);
  
  return newItem;
}

// Remove item from queue
export function removeFromQueue(id: string): boolean {
  const queue = getQueue();
  const filtered = queue.filter(item => item.id !== id);
  
  if (filtered.length === queue.length) return false;
  
  saveQueue(filtered);
  return true;
}

// Update item
export function updateQueueItem(id: string, updates: Partial<QueuedItem>): QueuedItem | null {
  const queue = getQueue();
  const index = queue.findIndex(item => item.id === id);
  
  if (index === -1) return null;
  
  queue[index] = { ...queue[index], ...updates };
  saveQueue(queue);
  
  return queue[index];
}

// Schedule item
export function scheduleItem(id: string, scheduledFor: string): boolean {
  return updateQueueItem(id, { status: 'scheduled', scheduledFor }) !== null;
}

// Mark as posted
export function markAsPosted(id: string, platform: string): boolean {
  return updateQueueItem(id, { status: 'posted', platform }) !== null;
}

// Get stats
export function getQueueStats() {
  const queue = getQueue();
  
  return {
    total: queue.length,
    drafts: queue.filter(i => i.status === 'draft').length,
    scheduled: queue.filter(i => i.status === 'scheduled').length,
    posted: queue.filter(i => i.status === 'posted').length,
    byType: {
      tweet: queue.filter(i => i.type === 'tweet').length,
      blog: queue.filter(i => i.type === 'blog').length,
      linkedin: queue.filter(i => i.type === 'linkedin').length,
      thread: queue.filter(i => i.type === 'thread').length,
      newsletter: queue.filter(i => i.type === 'newsletter').length,
    }
  };
}

// Clear posted items
export function clearPosted(): number {
  const queue = getQueue();
  const filtered = queue.filter(item => item.status !== 'posted');
  const removed = queue.length - filtered.length;
  
  if (removed > 0) {
    saveQueue(filtered);
  }
  
  return removed;
}

// Example usage
if (require.main === module) {
  // Add a tweet
  const tweet = addToQueue({
    type: 'tweet',
    content: 'AI is changing everything. Here is how...',
    source: 'elonmusk',
    sourceType: 'twitter',
    status: 'draft',
    metadata: { wordCount: 50, hashtags: ['#AI', '#Tech'] }
  });
  
  console.log('Added to queue:', tweet.id);
  console.log('Stats:', getQueueStats());
}
