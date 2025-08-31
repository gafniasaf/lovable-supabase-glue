import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Header } from '../../edu/components/Header';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

describe('Header nav', () => {
  it('renders links to Assignments, Courses, Lessons', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /assignments/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /courses/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lessons/i })).toBeInTheDocument();
  });
});


