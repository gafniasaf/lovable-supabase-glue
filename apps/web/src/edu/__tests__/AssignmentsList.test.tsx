import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssignmentsList } from '../../edu/pages/assignments/AssignmentsList';

describe('AssignmentsList', () => {
  it('renders header "All Assignments"', () => {
    render(<AssignmentsList />);
    expect(screen.getByRole('heading', { name: /All Assignments/i })).toBeInTheDocument();
  });
});


