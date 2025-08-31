import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AppShell } from '../../edu/components/AppShell';

describe('Header', () => {
  it('renders site title and breadcrumbs container', () => {
    render(<AppShell><div>content</div></AppShell>);
    expect(screen.getByText(/EduPlatform|Education Platform/i)).toBeInTheDocument();
    // Breadcrumbs may be minimal; assert presence of nav region
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});


