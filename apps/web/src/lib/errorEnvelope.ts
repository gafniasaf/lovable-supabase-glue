export enum ApiErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  DB_ERROR = 'DB_ERROR',
  INTERNAL = 'INTERNAL',
  HTTP_ERROR = 'HTTP_ERROR',
}

export type ApiErrorEnvelope = { error?: { code?: string; message?: string }; requestId?: string };

export class ApiError extends Error {
  code?: string;
  requestId?: string;
  constructor(message: string, code?: string, requestId?: string) {
    super(message);
    this.code = code;
    this.requestId = requestId;
  }
}

export function throwIfError(json: unknown): void {
  const e = (json as any)?.error as { code?: string; message?: string } | undefined;
  if (e && typeof e === 'object') {
    const code = (e.code as string | undefined) || ApiErrorCode.HTTP_ERROR;
    throw new ApiError(e.message || code, code, (json as any)?.requestId);
  }
}


