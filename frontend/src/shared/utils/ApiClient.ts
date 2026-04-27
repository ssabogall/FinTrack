interface ApiErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Centralized HTTP client for the FinTrack backend.
 *
 * Conventions:
 * - Reads the base URL from `VITE_API_URL`.
 * - Throws an Error whose message comes from the backend's `message` field
 *   when available, otherwise a generic status-based message.
 *
 * NOTE: This client does not yet attach an Authorization header. The auth
 * token integration is owned by the auth module being implemented in a
 * separate branch; once that lands, this client will read the token from
 * the auth store and inject it on every request.
 */
export class ApiClient {
  private static readonly BASE_URL: string = import.meta.env.VITE_API_URL;

  public static get<T>(path: string): Promise<T> {
    return ApiClient.request<T>('GET', path);
  }

  public static post<T>(path: string, body: unknown): Promise<T> {
    return ApiClient.request<T>('POST', path, body);
  }

  public static put<T>(path: string, body: unknown): Promise<T> {
    return ApiClient.request<T>('PUT', path, body);
  }

  public static delete<T>(path: string): Promise<T> {
    return ApiClient.request<T>('DELETE', path);
  }

  private static async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = ApiClient.buildUrl(path);

    const init: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      const message = await ApiClient.extractErrorMessage(response);
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private static buildUrl(path: string): string {
    const base = ApiClient.BASE_URL.replace(/\/$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
  }

  private static async extractErrorMessage(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (Array.isArray(body.message)) {
        return body.message.join(', ');
      }
      if (typeof body.message === 'string') {
        return body.message;
      }
      if (typeof body.error === 'string') {
        return body.error;
      }
    } catch {
      // Body was not JSON or was empty. Fall through to status-based message.
    }
    return `Request failed with status ${response.status}`;
  }
}
