/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from '../../apps/web/src/app/dashboard/parent/progress/page';

describe('Parent Progress UI (labs)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  it('renders empty state when no links', async () => {
    const ui = await Page();
    render(ui);
    expect(screen.getByLabelText('Children Progress')).toBeInTheDocument();
  });
});


