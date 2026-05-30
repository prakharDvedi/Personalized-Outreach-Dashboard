type ApiErrorEnvelope = {
  error?: {
    message?: string;
  };
};

export async function readErrorMessage(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as ApiErrorEnvelope;
      return data.error?.message ?? fallback;
    } catch {
      return fallback;
    }
  }

  try {
    const text = await response.text();
    return text.trim() || fallback;
  } catch {
    return fallback;
  }
}
