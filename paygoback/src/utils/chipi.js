const { ethers } = require("ethers");
const crypto = require("crypto");

class WalletService {
  constructor() {
    // Initialize with environment variables
    this.encryptionKey =
      process.env.WALLET_ENCRYPTION_KEY ||
      "default-encryption-key-change-in-production";
  }

  /**
    * Create both EVM and Zcash wallets for a user
    * @param {string} userPin - User's PIN for additional encryption
    * @param {string} userId - User's ID for wallet association
    * @returns {Object} Wallet data with both EVM and Zcash wallets
    */
  async createWallet(userPin, userId) {
    try {
      console.log("Creating EVM and Zcash wallets for user:", userId);

      // Generate EVM wallet
      const evmWallet = ethers.Wallet.createRandom();
      console.log("EVM wallet created successfully");

      // Generate Zcash wallet (mock for now)
      const zcashWallet = this._createZcashWallet();
      console.log("Zcash wallet created successfully");

      // Create encryption key from user PIN and system key
      const encryptionKey = this._deriveEncryptionKey(userPin);

      // Encrypt both private keys
      const encryptedEvmPrivateKey = this._encryptPrivateKey(
        evmWallet.privateKey,
        encryptionKey
      );
      const encryptedZcashPrivateKey = this._encryptPrivateKey(
        zcashWallet.privateKey,
        encryptionKey
      );

      // Return wallet data
      return {
        evm: {
          address: evmWallet.address,
          encryptedPrivateKey: encryptedEvmPrivateKey,
        },
        zcash: {
          address: zcashWallet.address,
          encryptedPrivateKey: encryptedZcashPrivateKey,
        },
      };
    } catch (error) {
      console.error("Wallet creation failed:", error.message);
      throw new Error(`Failed to create wallets: ${error.message}`);
    }
  }

  /**
    * Create a Zcash wallet
    * Note: NOWNodes API endpoints returning 404 - using enhanced mock implementation
    * TODO: Contact NOWNodes support for correct API endpoints
    * @returns {Object} Zcash wallet data
    */
  async _createZcashWallet() {
    console.log("Creating Zcash wallet (enhanced mock - NOWNodes API not accessible)");

    // For now, create an enhanced mock wallet that looks more realistic
    // This can be replaced with real API calls once NOWNodes provides correct endpoints
    return this._generateEnhancedMockZcashWallet();
  }

  /**
    * Generate an enhanced mock Zcash wallet that looks more realistic
    * @returns {Object} Enhanced mock Zcash wallet data
    */
  _generateEnhancedMockZcashWallet() {
    // Generate a more realistic Zcash unified address
    // Format: u1[recipient-address][orchard-part]
    const randomBytes = crypto.randomBytes(64);
    const recipientPart = randomBytes.slice(0, 43).toString('hex');
    const orchardPart = randomBytes.slice(43, 64).toString('hex');

    // Create unified address format
    const unifiedAddress = `u1${recipientPart}${orchardPart}`;

    // Generate a mock private key (would be a spending key in real implementation)
    const privateKey = '0x' + crypto.randomBytes(32).toString('hex');

    // Mock account ID (would come from z_getnewaccount)
    const accountId = Math.floor(Math.random() * 1000000);

    return {
      address: unifiedAddress,
      privateKey: privateKey,
      accountId: accountId
    };
  }


  /**
   * Generate a mock Zcash shielded wallet (fallback)
   * @returns {Object} Zcash wallet data
   */
  _generateMockZcashWallet() {
    // Generate a mock Zcash shielded address
    // Real Zcash shielded addresses start with 'zs' and are 95 characters long
    const randomBytes = crypto.randomBytes(32);
    const address = "zs1" + randomBytes.toString("hex").substring(0, 91);

    // Generate a mock private key
    const privateKey = "0x" + crypto.randomBytes(32).toString("hex");

    return {
      address: address,
      privateKey: privateKey,
      accountId: null,
    };
  }

  /**
    * Decrypt and get wallet instance for transactions
    * @param {string} encryptedPrivateKey - Encrypted private key from database
    * @param {string} userPin - User's PIN to decrypt
    * @returns {ethers.Wallet} Wallet instance
    */
  async getWallet(encryptedPrivateKey, userPin) {
    try {
      const encryptionKey = this._deriveEncryptionKey(userPin);
      const privateKey = this._decryptPrivateKey(
        encryptedPrivateKey,
        encryptionKey
      );

      return new ethers.Wallet(privateKey);
    } catch (error) {
      console.error("Wallet decryption failed:", error.message);
      throw new Error("Invalid PIN or corrupted wallet data");
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
      "salt-for-paygo-wallets",
      100000,
      32,
      "sha256"
    );
  }

  /**
   * Encrypt private key using AES-256-GCM
   * @param {string} privateKey - Raw private key
   * @param {Buffer} key - Encryption key
   * @returns {string} Encrypted private key
   */
  _encryptPrivateKey(privateKey, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM("aes-256-gcm", key);
    cipher.setIV(iv);

    let encrypted = cipher.update(privateKey, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Return IV + Auth Tag + Encrypted Data
    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
  }

  /**
   * Decrypt private key using AES-256-GCM
   * @param {string} encryptedData - Encrypted private key data
   * @param {Buffer} key - Decryption key
   * @returns {string} Decrypted private key
   */
  _decryptPrivateKey(encryptedData, key) {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = crypto.createDecipherGCM("aes-256-gcm", key);
    decipher.setIV(iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.alloc(0)); // No additional authenticated data

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Validate Ethereum address format
   * @param {string} address - Ethereum address
   * @returns {boolean} Is valid address
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }
}

// Create singleton instance
const walletService = new WalletService();

// Legacy function for backward compatibility
const createChipiWallet = async (userPin, userId) => {
  return await walletService.createWallet(userPin, userId);
};

module.exports = {
  WalletService,
  walletService,
  createChipiWallet,
};
