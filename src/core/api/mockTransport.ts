export type MockTransportOptions = {
  latencyMs?: number;
  fail?: boolean;
  signal?: AbortSignal;
};

export function mockTransport<T>(
  value: T,
  options: MockTransportOptions = {},
): Promise<T> {
  const { latencyMs = 0, fail = false, signal } = options;

  if (!Number.isFinite(latencyMs) || latencyMs < 0) {
    return Promise.reject(
      new RangeError("latencyMs must be a nonnegative finite number"),
    );
  }

  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The request was aborted", "AbortError"));
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("The request was aborted", "AbortError"));
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      if (fail) {
        reject(new Error("Mock request failed"));
      } else {
        resolve(value);
      }
    }, latencyMs);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
