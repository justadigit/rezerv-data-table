import { describe, expect, it, vi } from "vitest";
import { mockTransport } from "@/core/api";

describe("mockTransport", () => {
  it("returns a value after configured latency", async () => {
    vi.useFakeTimers();
    try {
      const request = mockTransport({ ready: true }, { latencyMs: 25 });
      await vi.advanceTimersByTimeAsync(24);
      await vi.advanceTimersByTimeAsync(1);
      await expect(request).resolves.toEqual({ ready: true });
    } finally {
      vi.useRealTimers();
    }
  });

  it("fails deterministically when requested", async () => {
    vi.useFakeTimers();
    try {
      const request = mockTransport("unused", { fail: true });
      const assertion = expect(request).rejects.toThrow("Mock request failed");
      await vi.runAllTimersAsync();
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects an aborted request without resolving later", async () => {
    vi.useFakeTimers();
    try {
      const controller = new AbortController();
      const request = mockTransport("unused", {
        latencyMs: 100,
        signal: controller.signal,
      });
      const assertion = expect(request).rejects.toMatchObject({
        name: "AbortError",
      });
      controller.abort();
      await assertion;
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
