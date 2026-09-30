const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001/api/v1";

interface IApiEnvelope<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, response.status);
  }

  const envelope = (await response.json()) as IApiEnvelope<T>;
  return envelope.data;
}
