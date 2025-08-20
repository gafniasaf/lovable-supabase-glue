/** Central MIME allow-list for uploads/signing. Override with ALLOWED_UPLOAD_MIME env (csv). */
export function getAllowedUploadMime(): string[] {
  const env = process.env.ALLOWED_UPLOAD_MIME;
  if (env && env.trim().length > 0) {
    return env.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/octet-stream'
  ];
}


