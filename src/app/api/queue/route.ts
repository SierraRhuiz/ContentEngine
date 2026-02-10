import { NextRequest, NextResponse } from 'next/server';

const STORAGE_KEY = 'content-queue';

function getQueue(): any[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveQueue(queue: any[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function GET() {
  const queue = getQueue();
  return NextResponse.json({
    queue,
    stats: {
      total: queue.length,
      drafts: queue.filter(i => i.status === 'draft').length,
      scheduled: queue.filter(i => i.status === 'scheduled').length,
      posted: queue.filter(i => i.status === 'posted').length,
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { action, id, item } = body;
    
    if (action === 'add') {
      const queue = getQueue();
      const newItem = {
        ...item,
        id: Date.now().toString(),
        generatedAt: new Date().toISOString(),
        status: item.status || 'draft',
      };
      queue.unshift(newItem);
      saveQueue(queue);
      return NextResponse.json({ success: true, item: newItem });
    }
    
    if (action === 'remove') {
      const queue = getQueue();
      const filtered = queue.filter(i => i.id !== id);
      saveQueue(filtered);
      return NextResponse.json({ success: true, removed: id });
    }
    
    if (action === 'update') {
      const queue = getQueue();
      const index = queue.findIndex(i => i.id === id);
      if (index === -1) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      queue[index] = { ...queue[index], ...body.updates };
      saveQueue(queue);
      return NextResponse.json({ success: true, item: queue[index] });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
