import { AuthResponse } from '../types';

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = 30_000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function parseResponse(response: Response): Promise<AuthResponse> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || 'The request could not be completed.');
  }
  return body as AuthResponse;
}
