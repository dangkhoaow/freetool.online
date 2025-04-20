import { createHash } from "crypto"

// Common words database (simplified for demonstration)
const COMMON_WORDS_TO_MD5: Record<string, string> = {
  // This would be a much larger database in a real implementation
  password: "5f4dcc3b5aa765d61d8327deb882cf99",
  admin: "21232f297a57a5a743894a0e4a801fc3",
  "123456": "e10adc3949ba59abbe56e057f20f883e",
  qwerty: "d8578edf8458ce06fbc5bb76a58c5ca4",
  hello: "5d41402abc4b2a76b9719d911017c592",
  test: "098f6bcd4621d373cade4e832627b4f6",
  welcome: "40be4e59b9a2a2b5dffb918c0e86b3d7",
}

// Reverse lookup map for MD5 to text
const MD5_TO_COMMON_WORDS: Record<string, string> = Object.entries(COMMON_WORDS_TO_MD5).reduce(
  (acc, [word, hash]) => {
    acc[hash] = word
    return acc
  },
  {} as Record<string, string>,
)

export interface MD5ConverterService {
  textToMD5(text: string): Promise<string>
  md5ToText(hash: string): Promise<string | null>
}

class MD5ConverterServiceImpl implements MD5ConverterService {
  async textToMD5(text: string): Promise<string> {
    // Simulate network delay for consistency with other services
    await new Promise((resolve) => setTimeout(resolve, 100))

    return createHash("md5").update(text).digest("hex")
  }

  async md5ToText(hash: string): Promise<string | null> {
    // Simulate network delay and lookup process
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Convert hash to lowercase for case-insensitive comparison
    const normalizedHash = hash.toLowerCase()

    // Check if the hash exists in our database
    return MD5_TO_COMMON_WORDS[normalizedHash] || null
  }
}

// Singleton pattern
let instance: MD5ConverterService | null = null

export function getMd5ConverterService(): MD5ConverterService {
  if (!instance) {
    instance = new MD5ConverterServiceImpl()
  }
  return instance
}
