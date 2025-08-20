/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import './setupTests';
import DarkModeToggle from '@/app/components/DarkModeToggle';

test('DarkModeToggle toggles aria-pressed and document class', async () => {
  const user = userEvent.setup();
  document.documentElement.classList.remove('dark');
  render(<DarkModeToggle />);
  const btn = screen.getByRole('button', { name: /dark|light/i });
  expect(btn).toHaveAttribute('aria-pressed', 'false');
  await user.click(btn);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(btn).toHaveAttribute('aria-pressed', 'true');
});


