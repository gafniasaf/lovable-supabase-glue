/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import './setupTests';
import { setAnalytics, track } from '@/lib/analytics';

function SaveButton() {
  return <button onClick={() => track('ui.click.save_lesson')} aria-label="Save">Save</button>;
}

test('fires telemetry on primary click', async () => {
  const user = userEvent.setup();
  const events: string[] = [];
  setAnalytics({ track: (name) => events.push(name) });
  render(<SaveButton />);
  await user.click(screen.getByRole('button', { name: /save/i }));
  expect(events).toContain('ui.click.save_lesson');
});


