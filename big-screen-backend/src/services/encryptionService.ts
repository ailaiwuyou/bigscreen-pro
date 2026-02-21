import crypto from 'crypto'

// 从环境变量获取加密密钥
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'big-screen-pro-default-key-32bytes!'
const ALGORITHM = 'aes-256-gcm'

// 确保密钥长度正确（32字节）
const getKey = () => {
  const key = Buffer.from(ENCRYPTION_KEY)
  if (key.length !== 32) {
    // 使用 SHA256 哈希来获取正确的密钥长度
    return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
  }
  return key
}

export const encryptionService = {
  // 加密文本
  encrypt(text: string): string {
    const key = getKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // 返回 iv + authTag + encrypted 的组合
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  },

  // 解密文本
  decrypt(encryptedData: string): string {
    const key = getKey()
    const parts = encryptedData.split(':')

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  },

  // 加密配置对象（只加密敏感字段）
  encryptConfig(config: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ['password', 'secret', 'token', 'apiKey', 'privateKey']
    const encrypted = { ...config }

    for (const field of sensitiveFields) {
      if (typeof encrypted[field] === 'string' && encrypted[field]) {
        encrypted[field] = this.encrypt(encrypted[field] as string)
      }
    }

    return encrypted
  },

  // 解密配置对象
  decryptConfig(config: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ['password', 'secret', 'token', 'apiKey', 'privateKey']
    const decrypted = { ...config }

    for (const field of sensitiveFields) {
      if (typeof decrypted[field] === 'string' && decrypted[field]) {
        try {
          decrypted[field] = this.decrypt(decrypted[field] as string)
        } catch (error) {
          // 如果解密失败，可能是明文存储的，保持原样
          console.warn(`Failed to decrypt field ${field}, using as-is`)
        }
      }
    }

    return decrypted
  }
}