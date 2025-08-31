import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Header } from '../../edu/components/Header';

describe('Header dropdown behavior', () => {
  it('opens Actions menu and shows items, then closes on item click', () => {
    render(<Header />);
    const trigger = screen.getByRole('button', { name: /actions/i });
    fireEvent.click(trigger);
    expect(screen.getByText(/new course/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/new course/i));
    expect(screen.queryByText(/new course/i)).not.toBeInTheDocument();
  });
});


