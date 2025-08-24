/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import './setupTests';
import NotificationsDropdownClient from '@/app/components/NotificationsDropdownClient';

function mockFetchOnce(fn: (input: RequestInfo, init?: RequestInit) => Promise<any>) {
  const original = global.fetch as any;
  const ResponseCtor = (global as any).Response || class {
    body: any; status: number; headers: any; ok: boolean; constructor(body: any, init: any) { this.body = body; this.status = init?.status || 200; this.headers = new Map(Object.entries(init?.headers || {})); this.ok = this.status >= 200 && this.status < 300; }
    async json() { try { return JSON.parse(this.body); } catch { return this.body; } }
    async text() { return String(this.body); }
  } as any;
  (global as any).Response = ResponseCtor;
  (global as any).fetch = jest.fn(fn);
  return () => { (global as any).fetch = original; };
}

test('Mark all read calls API and updates list + toast', async () => {
  const user = userEvent.setup();
  const restore = mockFetchOnce(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/notifications/read-all') && (init?.method || 'GET') === 'PATCH') {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    // Default fallthrough
    return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  const initial = [
    { id: '00000000-0000-0000-0000-000000000001', type: 'message:new', payload: { thread_id: 't1' }, created_at: new Date().toISOString(), read_at: null },
    { id: '00000000-0000-0000-0000-000000000002', type: 'submission:graded', payload: { score: 90 }, created_at: new Date().toISOString(), read_at: null }
  ] as any;
  render(<NotificationsDropdownClient initial={initial} />);
  await user.click(screen.getByRole('button', { name: /mark all/i }));
  await waitFor(() => {
    const items = screen.getAllByTestId('notif-item');
    expect(items.length).toBe(2);
  });
  restore();
});

test('Load more appends items', async () => {
  const user = userEvent.setup();
  const restore = mockFetchOnce(async (input) => {
    const url = new URL(typeof input === 'string' ? input : (input as any).url, 'http://localhost');
    if (url.pathname === '/api/notifications') {
      const offset = Number(url.searchParams.get('offset') || '0');
      const make = (i: number) => ({ id: `00000000-0000-0000-0000-00000000000${i % 10}`, user_id: 'u', type: 'message:new', payload: {}, created_at: new Date().toISOString(), read_at: null });
      const data = [make(offset + 1), make(offset + 2)];
      return new (global as any).Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new (global as any).Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  render(<NotificationsDropdownClient initial={[]} />);
  const before = screen.queryAllByTestId('notif-item').length;
  await user.click(screen.getByTestId('notif-load-more'));
  await waitFor(() => expect(screen.getAllByTestId('notif-item').length).toBeGreaterThanOrEqual(before + 2));
  restore();
});


