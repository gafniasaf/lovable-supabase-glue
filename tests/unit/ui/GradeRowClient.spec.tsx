/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import './setupTests';
import GradeRowClient from '@/app/dashboard/teacher/[courseId]/assignments/[assignmentId]/submissions/GradeRowClient';

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

test('GradeRowClient saves grade via API and shows success', async () => {
  const user = userEvent.setup();
  const restore = mockFetchOnce(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/submissions') && (init?.method || 'GET') === 'PATCH') {
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      return new (global as any).Response(JSON.stringify({ id: '00000000-0000-0000-0000-000000000001', assignment_id: '00000000-0000-0000-0000-000000000111', student_id: '00000000-0000-0000-0000-000000000222', submitted_at: new Date().toISOString(), score: body.score ?? 90, feedback: body.feedback ?? 'ok' }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new (global as any).Response(JSON.stringify({}), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  render(<GradeRowClient id="s1" initialScore={80} initialFeedback={""} />);
  await user.clear(screen.getByTestId('grade-score'));
  await user.type(screen.getByTestId('grade-score'), '90');
  await user.type(screen.getByTestId('grade-feedback'), 'ok');
  await user.click(screen.getByTestId('grade-save'));
  await waitFor(() => expect(screen.getByText(/saved/i)).toBeInTheDocument());
  restore();
});


