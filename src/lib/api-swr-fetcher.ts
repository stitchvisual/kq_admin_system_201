/**
 * Standard fetcher for SWR against JSON API routes that return `{ success, data, error? }`.
 */
export async function apiDataFetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  const result = await res.json().catch(() => ({}));
  if (!res.ok || !result.success) {
    const msg =
      typeof result.error === 'string'
        ? result.error
        : result.error?.message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return result.data as T;
}
