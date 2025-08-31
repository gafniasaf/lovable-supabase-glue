import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CoursesList } from '../../edu/pages/courses/CoursesList';

describe('CoursesList pagination', () => {
  it('navigates with Next and Previous buttons', () => {
    render(<CoursesList />);
    const table = screen.getByRole('table');
    // First page contains initial items
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(1);
    // Go to next page
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Assert a specific unique row on page 2
    expect(within(table).getByText('Math Theory')).toBeInTheDocument();
    // Go back to previous page
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(within(table).getByText('Calculus')).toBeInTheDocument();
  });
});


