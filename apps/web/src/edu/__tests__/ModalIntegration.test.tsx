import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ModalRoot, ModalTrigger, ModalContent, ModalClose } from '@/components/ui/modal';

describe('Modal', () => {
  it('opens and closes via trigger and close button', () => {
    render(
      <ModalRoot>
        <ModalTrigger>
          <button>Open Modal</button>
        </ModalTrigger>
        <ModalContent title="Demo Modal">
          <p>Body</p>
          <ModalClose>
            <button>Close</button>
          </ModalClose>
        </ModalContent>
      </ModalRoot>
    );

    expect(screen.queryByRole('dialog', { name: /demo modal/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/open modal/i));
    expect(screen.getByRole('dialog', { name: /demo modal/i })).toBeInTheDocument();
    fireEvent.click(screen.getByText(/close/i));
    expect(screen.queryByRole('dialog', { name: /demo modal/i })).not.toBeInTheDocument();
  });
});


