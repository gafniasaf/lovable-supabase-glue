import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CoursesList } from '../../edu/pages/courses/CoursesList';

describe('CoursesList', () => {
  it('renders header "All Courses"', () => {
    render(<CoursesList />);
    expect(screen.getByRole('heading', { name: /All Courses/i })).toBeInTheDocument();
  });
});


