import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AssignmentsList } from '../../edu/pages/assignments/AssignmentsList';

describe('AssignmentsList filtering', () => {
  it('filters rows by search input', () => {
    render(<AssignmentsList />);
    const table = screen.getByRole('table');
    expect(within(table).getByText(/algebra basics/i)).toBeInTheDocument();
    const search = screen.getByPlaceholderText(/search assignments/i);
    fireEvent.change(search, { target: { value: 'calculus' } });
    expect(within(table).getByText(/calculus intro/i)).toBeInTheDocument();
  });
});


