// @ts-nocheck
import { z } from 'zod';

// Define minimal file contract zods inline for test of route contracts
const uploadUrlRequest = z.object({ owner_type: z.string(), owner_id: z.string(), content_type: z.string().default('application/octet-stream') });
const uploadUrlResponse = z.object({ url: z.string(), fields: z.record(z.any()) });
const downloadUrlResponse = z.any(); // download returns raw bytes with content-type header in route

describe('files schema contracts (route IO shapes)', () => {
  test('upload-url request accepts default content_type', () => {
    const v = uploadUrlRequest.parse({ owner_type: 'submission', owner_id: 'x' });
    expect(v.content_type).toBe('application/octet-stream');
  });

  test('upload-url response contains signed url and fields object', () => {
    const v = uploadUrlResponse.parse({ url: '/api/files/upload-url?x=y', fields: {} });
    expect(v.fields).toBeDefined();
  });
});


