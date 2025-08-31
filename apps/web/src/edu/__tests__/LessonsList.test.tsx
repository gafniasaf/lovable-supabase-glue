import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { LessonsList } from '../../edu/pages/lessons/LessonsList';

describe('LessonsList', () => {
  it('renders header "All Lessons"', () => {
    render(<LessonsList />);
    expect(screen.getByRole('heading', { name: /All Lessons/i })).toBeInTheDocument();
  });
});


