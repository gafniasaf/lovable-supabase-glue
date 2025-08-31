import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Header } from '../../edu/components/Header';

describe('Header dropdown and input', () => {
  it('renders search input placeholder and a dropdown trigger', () => {
    render(<Header />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /menu|actions|open/i })).toBeInTheDocument();
  });
});


