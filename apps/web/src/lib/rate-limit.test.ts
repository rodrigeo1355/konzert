import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { checkRateLimit } from "./rate-limit"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("checkRateLimit", () => {
  it("allows the first request and returns correct remaining", () => {
    const result = checkRateLimit("key-1", 5, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("counts up and reduces remaining with each call", () => {
    for (let i = 4; i >= 1; i--) {
      const result = checkRateLimit("key-2", 5, 60_000)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(i)
    }
  })

  it("blocks once the limit is reached", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("key-3", 3, 60_000)
    const blocked = checkRateLimit("key-3", 3, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it("resets after the window expires", () => {
    checkRateLimit("key-4", 1, 60_000)
    const blocked = checkRateLimit("key-4", 1, 60_000)
    expect(blocked.allowed).toBe(false)

    vi.advanceTimersByTime(60_001)

    const reset = checkRateLimit("key-4", 1, 60_000)
    expect(reset.allowed).toBe(true)
    expect(reset.remaining).toBe(0)
  })

  it("tracks different keys independently", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("key-a", 3, 60_000)
    const blockedA = checkRateLimit("key-a", 3, 60_000)
    const allowedB = checkRateLimit("key-b", 3, 60_000)

    expect(blockedA.allowed).toBe(false)
    expect(allowedB.allowed).toBe(true)
  })

  it("remaining is 0 on the last allowed request", () => {
    const result = checkRateLimit("key-5", 1, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(0)
  })
})
