export function validatePasswordStrength(password: string): {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
  isValid: boolean
} {
  const minLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*]/.test(password)
  const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

  return { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecial, isValid }
}
