type ResponseLike = {
  clone?: () => ResponseLike;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
  status?: number;
  statusText?: string;
};

type FunctionErrorLike = {
  message?: string;
  context?: ResponseLike;
};

function hasContext(error: unknown): error is FunctionErrorLike {
  return typeof error === "object" && error !== null && "context" in error;
}

export async function getFunctionErrorMessage(error: unknown): Promise<string> {
  const base =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "Function request failed")
      : "Function request failed";

  if (!hasContext(error) || !error.context) return base;

  const ctx = error.context;
  const readable = typeof ctx.clone === "function" ? ctx.clone() : ctx;

  if (typeof readable.json === "function") {
    try {
      const payload = await readable.json();
      if (payload && typeof payload === "object") {
        const p = payload as { message?: unknown; error?: unknown; detail?: unknown };
        if (typeof p.message === "string" && p.message.length > 0) {
          if (typeof p.detail === "string" && p.detail.length > 0) {
            return `${base}: ${p.message} (${p.detail})`;
          }
          return `${base}: ${p.message}`;
        }
        if (typeof p.error === "string" && p.error.length > 0) {
          if (typeof p.detail === "string" && p.detail.length > 0) {
            return `${base}: ${p.error} (${p.detail})`;
          }
          return `${base}: ${p.error}`;
        }
      }
      return `${base}: ${JSON.stringify(payload)}`;
    } catch {
      // no-op: fallback to text/status
    }
  }

  if (typeof readable.text === "function") {
    try {
      const text = await readable.text();
      if (text) return `${base}: ${text}`;
    } catch {
      // no-op: fallback to status
    }
  }

  if (typeof readable.status === "number") {
    return `${base} (status ${readable.status}${readable.statusText ? ` ${readable.statusText}` : ""})`;
  }

  return base;
}
