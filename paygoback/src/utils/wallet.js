// utils/wallet.js
const { ethers } = require('ethers')
const crypto = require('crypto')

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'my_32_byte_secret_key_1234567890123456' // MUST be 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(text) {
  const [iv, encryptedText] = text.split(':')
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, 'hex')
  )
  let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'))
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

function createWallet() {
  const wallet = ethers.Wallet.createRandom()
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    encryptedPrivateKey: encrypt(wallet.privateKey)
  }
}

module.exports = { createWallet, encrypt, decrypt }
