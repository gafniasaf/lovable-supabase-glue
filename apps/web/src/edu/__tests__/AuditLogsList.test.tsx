import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Supabase client module before importing component
let mockRows: any[] = [];
const mockLimit = jest.fn(() => Promise.resolve({ data: mockRows, error: null }));
const mockSelect = jest.fn(() => ({ limit: mockLimit }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));
jest.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

// Import after mocks
import { AuditLogsList } from '@/edu/pages/audit/AuditLogsList';

describe('AuditLogsList', () => {
  beforeEach(() => {
    mockRows = [];
    mockLimit.mockClear();
    mockSelect.mockClear();
    mockFrom.mockClear();
  });
  it('renders logs from Supabase', async () => {
    const logs = [
      { id: '1', event: 'User login', created_at: '2025-08-30T10:00:00Z' },
      { id: '2', event: 'Viewed course', created_at: '2025-08-30T11:00:00Z' },
    ];
    mockRows = logs;

    render(<AuditLogsList />);

    expect(screen.getByRole('heading', { name: /Audit Logs/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/User login/i)).toBeInTheDocument();
      expect(screen.getByText(/Viewed course/i)).toBeInTheDocument();
    });
  });
});


