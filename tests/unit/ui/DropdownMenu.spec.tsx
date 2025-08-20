/** @jest-environment jsdom */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import './setupTests';
import DropdownMenu from '@/components/ui/DropdownMenu';

test('DropdownMenu opens, item click calls handler and closes', async () => {
  const user = userEvent.setup();
  const onSelect = jest.fn();
  render(<DropdownMenu label={<>Menu</>} items={[{ key: 'a', label: 'Action', onSelect }]} />);
  const trigger = screen.getByRole('button', { name: /menu/i });
  await user.click(trigger);
  const menu = await screen.findByRole('menu');
  const item = within(menu).getByRole('menuitem', { name: 'Action' });
  await user.click(item);
  expect(onSelect).toHaveBeenCalled();
  expect(screen.queryByRole('menu')).toBeNull();
});


