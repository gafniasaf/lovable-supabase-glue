import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CoursesList } from '../../edu/pages/courses/CoursesList';

describe('CoursesList sorting', () => {
  it('sorts by Course title ascending then descending', () => {
    render(<CoursesList />);
    const table = screen.getByRole('table');
    const header = within(table).getByRole('columnheader', { name: /course/i });
    // First click asc
    fireEvent.click(header);
    const rowsAsc = within(table).getAllByRole('row').slice(1);
    expect(rowsAsc[0]).toHaveTextContent(/algebra/i);
    // Second click desc
    fireEvent.click(header);
    const rowsDesc = within(table).getAllByRole('row').slice(1);
    expect(rowsDesc[0]).toHaveTextContent(/zoology|calculus|math/i);
  });
});


