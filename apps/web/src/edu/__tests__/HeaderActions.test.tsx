import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Header } from '../../edu/components/Header';

describe('Header actions', () => {
  it('shows notifications button with a badge', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});


