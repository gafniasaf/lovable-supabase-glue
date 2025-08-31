import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Header } from '../../edu/components/Header';

jest.mock('next/navigation', () => ({
  usePathname: () => '/edu/assignments',
}));

describe('Breadcrumbs', () => {
  it('renders breadcrumb trail including Assignments', () => {
    render(<Header />);
    const crumbNav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(crumbNav).toBeInTheDocument();
    expect(within(crumbNav).getByText(/assignments/i)).toBeInTheDocument();
  });
});


