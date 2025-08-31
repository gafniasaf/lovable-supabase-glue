import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ToastProvider, ToastHost, useToast } from '../../edu/components/ToastProvider';

function TestComponent() {
  const toast = useToast();
  return (
    <button onClick={() => toast.show('Saved')}>Trigger Toast</button>
  );
}

describe('Toast provider', () => {
  it('shows a toast when triggered', () => {
    render(
      <ToastProvider>
        <TestComponent />
        <ToastHost />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText(/trigger toast/i));
    expect(screen.getByRole('status')).toHaveTextContent(/saved/i);
  });
});


