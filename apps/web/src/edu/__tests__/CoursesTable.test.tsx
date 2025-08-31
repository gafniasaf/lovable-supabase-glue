import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CoursesList } from '../../edu/pages/courses/CoursesList';

describe('CoursesList table', () => {
  it('renders a table with a demo row', () => {
    render(<CoursesList />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent(/calculus/i);
  });
});


