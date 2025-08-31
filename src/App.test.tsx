import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';

jest.mock('./integrations/supabase/client', () => {
  return {
    supabase: {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    }
  };
});

test('renders title', () => {
  render(<App />);
  expect(screen.getByText(/Expertfolio Console/i)).toBeInTheDocument();
});


