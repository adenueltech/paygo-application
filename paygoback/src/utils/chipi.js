const { ethers } = require('ethers')
const crypto = require('crypto')
const logger = require('./logger')

class WalletService {
  constructor() {
    // Initialize with environment variables if needed
    this.encryptionKey = process.env.WALLET_ENCRYPTION_KEY || 'default-encryption-key-change-in-production'
  }

  /**
   * Create both EVM and Zcash wallets for a user
   * @param {string} userPin - User's PIN for additional encryption
   * @param {string} userId - User's ID for wallet association
   * @returns {Object} Wallet data with both EVM and Zcash wallets
   */
  async createWallet(userPin, userId) {
    try {
      logger.info('Creating EVM and Zcash wallets for user:', { userId })

      // Generate EVM wallet
      const evmWallet = ethers.Wallet.createRandom()

      // Generate Zcash shielded address (mock implementation)
      const zcashWallet = this._generateZcashWallet()

      // Create encryption key from user PIN and system key
      const encryptionKey = this._deriveEncryptionKey(userPin)

      // Encrypt both private keys
      const encryptedEvmPrivateKey = this._encryptPrivateKey(evmWallet.privateKey, encryptionKey)
      const encryptedZcashPrivateKey = this._encryptPrivateKey(zcashWallet.privateKey, encryptionKey)

      // Return wallet data
      return {
        evm: {
          address: evmWallet.address,
          encryptedPrivateKey: encryptedEvmPrivateKey
        },
        zcash: {
          address: zcashWallet.address,
          encryptedPrivateKey: encryptedZcashPrivateKey
        }
      }

    } catch (error) {
      logger.error('Wallet creation failed:', { error: error.message, userId })
      throw new Error('Failed to create wallets')
    }
  }

  /**
   * Generate a mock Zcash shielded wallet
   * @returns {Object} Zcash wallet data
   */
  _generateZcashWallet() {
    // Generate a mock Zcash shielded address
    // Real Zcash shielded addresses start with 'zs' and are 95 characters long
    const randomBytes = crypto.randomBytes(32)
    const address = 'zs1' + randomBytes.toString('hex').substring(0, 91)

    // Generate a mock private key (in reality, this would be a spending key)
    const privateKey = '0x' + crypto.randomBytes(32).toString('hex')

    return {
      address: address,
      privateKey: privateKey
    }
  }

  /**
   * Decrypt and get wallet instance for transactions
   * @param {string} encryptedPrivateKey - Encrypted private key from database
   * @param {string} userPin - User's PIN to decrypt
   * @returns {ethers.Wallet} Wallet instance
   */
  async getWallet(encryptedPrivateKey, userPin) {
    try {
      const encryptionKey = this._deriveEncryptionKey(userPin)
      const privateKey = this._decryptPrivateKey(encryptedPrivateKey, encryptionKey)

      return new ethers.Wallet(privateKey)
    } catch (error) {
      logger.error('Wallet decryption failed:', { error: error.message })
      throw new Error('Invalid PIN or corrupted wallet data')
    }
  }

  /**
   * Derive encryption key from user PIN
   * @param {string} userPin - User's PIN
   * @returns {Buffer} Derived key
   */
  _deriveEncryptionKey(userPin) {
    return crypto.pbkdf2Sync(
      userPin + this.encryptionKey,
      'salt-for-paygo-wallets',
      100000,
      32,
      'sha256'
    )
  }

  /**
   * Encrypt private key using AES-256-GCM
   * @param {string} privateKey - Raw private key
   * @param {Buffer} key - Encryption key
   * @returns {string} Encrypted private key
   */
  _encryptPrivateKey(privateKey, key) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher('aes-256-gcm', key)

    let encrypted = cipher.update(privateKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Return IV + Auth Tag + Encrypted Data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  }

  /**
   * Decrypt private key using AES-256-GCM
   * @param {string} encryptedData - Encrypted private key data
   * @param {Buffer} key - Decryption key
   * @returns {string} Decrypted private key
   */
  _decryptPrivateKey(encryptedData, key) {
    const parts = encryptedData.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]

    const decipher = crypto.createDecipher('aes-256-gcm', key)
    decipher.setAuthTag(authTag)
    decipher.setAAD(Buffer.alloc(0)) // No additional authenticated data

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  /**
   * Validate Ethereum address format
   * @param {string} address - Ethereum address
   * @returns {boolean} Is valid address
   */
  isValidAddress(address) {
    return ethers.isAddress(address)
  }
}

// Create singleton instance
const walletService = new WalletService()

// Legacy function for backward compatibility
const createChipiWallet = async (userPin, userId) => {
  return await walletService.createWallet(userPin, userId)
}

module.exports = {
  WalletService,
  walletService,
  createChipiWallet
}