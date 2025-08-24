/** @jest-environment jsdom */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Uploader } from '../../apps/web/src/components/ef/Uploader';

describe('EF Uploader component', () => {
  beforeEach(() => { jest.resetAllMocks(); });
  it('renders and triggers upload', async () => {
    const onUploaded = jest.fn();
    // Mock fetch and XHR for upload flow
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ url: '/upload', method: 'PUT', headers: {} }) });
    const xhrOpen = jest.fn();
    const xhrSetHeader = jest.fn();
    const xhrSend = jest.fn(function (this: any) { this.status = 200; this.onload?.(); });
    (global as any).XMLHttpRequest = function () { return { open: xhrOpen, setRequestHeader: xhrSetHeader, upload: {}, send: xhrSend } as any; } as any;

    const { getByTestId } = render(<Uploader entity="assessment" id="a1" allowed={["text/plain"]} onUploaded={onUploaded} /> as any);
    const file = new File(['x'], 'x.txt', { type: 'text/plain' });
    fireEvent.change(getByTestId('ef-upload-input') as any, { target: { files: [file] } } as any);
    await waitFor(() => expect(onUploaded).toHaveBeenCalled());
  });
});


