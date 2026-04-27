import { describe, it, expect } from "vitest"
import { validatePasswordStrength } from "./password"

describe("validatePasswordStrength", () => {
  it("marks a fully valid password as valid", () => {
    const result = validatePasswordStrength("Secure1!")
    expect(result.isValid).toBe(true)
    expect(result).toEqual({
      minLength: true,
      hasUppercase: true,
      hasLowercase: true,
      hasNumber: true,
      hasSpecial: true,
      isValid: true,
    })
  })

  it("fails when password is too short", () => {
    const result = validatePasswordStrength("Ab1!")
    expect(result.minLength).toBe(false)
    expect(result.isValid).toBe(false)
  })

  it("fails when no uppercase letter", () => {
    const result = validatePasswordStrength("secure1!")
    expect(result.hasUppercase).toBe(false)
    expect(result.isValid).toBe(false)
  })

  it("fails when no lowercase letter", () => {
    const result = validatePasswordStrength("SECURE1!")
    expect(result.hasLowercase).toBe(false)
    expect(result.isValid).toBe(false)
  })

  it("fails when no number", () => {
    const result = validatePasswordStrength("SecurePass!")
    expect(result.hasNumber).toBe(false)
    expect(result.isValid).toBe(false)
  })

  it("fails when no special character", () => {
    const result = validatePasswordStrength("Secure123")
    expect(result.hasSpecial).toBe(false)
    expect(result.isValid).toBe(false)
  })

  it("accepts all allowed special characters", () => {
    for (const char of ["!", "@", "#", "$", "%", "^", "&", "*"]) {
      const result = validatePasswordStrength(`Secure1${char}`)
      expect(result.hasSpecial).toBe(true)
    }
  })

  it("fails for empty string", () => {
    const result = validatePasswordStrength("")
    expect(result.isValid).toBe(false)
    expect(result.minLength).toBe(false)
  })

  it("passes exactly at 8 characters", () => {
    const result = validatePasswordStrength("Secure1!")
    expect(result.minLength).toBe(true)
  })

  it("passes with long passwords", () => {
    const result = validatePasswordStrength("MyVerySecurePassword123!")
    expect(result.isValid).toBe(true)
  })
})
