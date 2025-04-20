// Types
export interface PasswordOptions {
  length: number
  includeLowercase: boolean
  includeUppercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
}

export interface SavedPassword {
  id: string
  password: string
  label?: string
  timestamp: number
}

// Character sets
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz"
const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const NUMBER_CHARS = "0123456789"
const SYMBOL_CHARS = "!@#$%^&*()_+~`|}{[]:;?><,./-="

// Validate password options
export function validateOptions(options: PasswordOptions): boolean {
  // Check if at least one character type is selected
  if (!options.includeLowercase && !options.includeUppercase && !options.includeNumbers && !options.includeSymbols) {
    return false
  }

  // Check if length is within valid range
  if (options.length < 8 || options.length > 128) {
    return false
  }

  return true
}

// Generate a random password based on options
export function generatePassword(options: PasswordOptions): string {
  let charset = ""
  let password = ""

  // Build character set based on selected options
  if (options.includeLowercase) charset += LOWERCASE_CHARS
  if (options.includeUppercase) charset += UPPERCASE_CHARS
  if (options.includeNumbers) charset += NUMBER_CHARS
  if (options.includeSymbols) charset += SYMBOL_CHARS

  // Create a Uint32Array for random values
  const randomValues = new Uint32Array(options.length)

  // Fill with cryptographically secure random values
  crypto.getRandomValues(randomValues)

  // Generate the password
  for (let i = 0; i < options.length; i++) {
    password += charset[randomValues[i] % charset.length]
  }

  // Ensure at least one character from each selected type is included
  let updatedPassword = password

  if (options.includeLowercase && !/[a-z]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * options.length)
    const randomChar = LOWERCASE_CHARS[Math.floor(Math.random() * LOWERCASE_CHARS.length)]
    updatedPassword = replaceCharAt(updatedPassword, randomIndex, randomChar)
  }

  if (options.includeUppercase && !/[A-Z]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * options.length)
    const randomChar = UPPERCASE_CHARS[Math.floor(Math.random() * UPPERCASE_CHARS.length)]
    updatedPassword = replaceCharAt(updatedPassword, randomIndex, randomChar)
  }

  if (options.includeNumbers && !/[0-9]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * options.length)
    const randomChar = NUMBER_CHARS[Math.floor(Math.random() * NUMBER_CHARS.length)]
    updatedPassword = replaceCharAt(updatedPassword, randomIndex, randomChar)
  }

  if (options.includeSymbols && !/[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * options.length)
    const randomChar = SYMBOL_CHARS[Math.floor(Math.random() * SYMBOL_CHARS.length)]
    updatedPassword = replaceCharAt(updatedPassword, randomIndex, randomChar)
  }

  return updatedPassword
}

// Helper function to replace a character at a specific index
function replaceCharAt(str: string, index: number, char: string): string {
  return str.substring(0, index) + char + str.substring(index + 1)
}

// Calculate password strength (0-100)
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0

  let score = 0

  // Length score (up to 30 points)
  score += Math.min(30, password.length * 2)

  // Character variety score (up to 40 points)
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^a-zA-Z0-9]/.test(password)) score += 10

  // Complexity score (up to 30 points)
  const uniqueChars = new Set(password.split("")).size
  score += Math.min(30, uniqueChars * 2)

  // Cap at 100
  return Math.min(100, score)
}

// Get strength label based on score
export function getStrengthLabel(score: number): string {
  if (score < 30) return "Very Weak"
  if (score < 50) return "Weak"
  if (score < 70) return "Moderate"
  if (score < 90) return "Strong"
  return "Very Strong"
}

// Get strength color based on score
export function getStrengthColor(score: number): string {
  if (score < 30) return "bg-red-500"
  if (score < 50) return "bg-orange-500"
  if (score < 70) return "bg-yellow-500"
  if (score < 90) return "bg-green-500"
  return "bg-emerald-500"
}

// Save password to localStorage
export function savePassword(password: string, label?: string): SavedPassword {
  const savedPassword: SavedPassword = {
    id: generateId(),
    password,
    label,
    timestamp: Date.now(),
  }

  try {
    // Get existing passwords
    const existingPasswords = getSavedPasswords()

    // Add new password to the beginning
    const updatedPasswords = [savedPassword, ...existingPasswords]

    // Save to localStorage
    localStorage.setItem("savedPasswords", JSON.stringify(updatedPasswords))

    return savedPassword
  } catch (err) {
    console.error("Error saving password:", err)
    return savedPassword
  }
}

// Get saved passwords from localStorage
export function getSavedPasswords(): SavedPassword[] {
  try {
    const savedPasswordsJson = localStorage.getItem("savedPasswords")
    return savedPasswordsJson ? JSON.parse(savedPasswordsJson) : []
  } catch (err) {
    console.error("Error getting saved passwords:", err)
    return []
  }
}

// Delete a saved password
export function deleteSavedPassword(id: string): void {
  try {
    // Get existing passwords
    const existingPasswords = getSavedPasswords()

    // Filter out the password to delete
    const updatedPasswords = existingPasswords.filter((p) => p.id !== id)

    // Save to localStorage
    localStorage.setItem("savedPasswords", JSON.stringify(updatedPasswords))
  } catch (err) {
    console.error("Error deleting password:", err)
  }
}

// Update password label
export function updatePasswordLabel(id: string, label: string): void {
  try {
    // Get existing passwords
    const existingPasswords = getSavedPasswords()

    // Update the label for the specified password
    const updatedPasswords = existingPasswords.map((p) => (p.id === id ? { ...p, label } : p))

    // Save to localStorage
    localStorage.setItem("savedPasswords", JSON.stringify(updatedPasswords))
  } catch (err) {
    console.error("Error updating password label:", err)
  }
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
