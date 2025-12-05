                              const User = require('../models/Users')
                              const { StatusCodes } = require('http-status-codes')
                              const { BadRequestError, UnauthenticatedError } = require('../errors')
                              const { createChipiWallet } = require('../utils/chipi')
                              const zcashService = require('../utils/zcashService')
                              const logger = require('../utils/logger')
                              const { ethers } = require('ethers')

const register = async (req, res) => {
  console.log('🔍 REGISTRATION START: Received request body:', req.body)

  const { name, email, password, role, walletPin } = req.body

  // Input validation
  if (!name || !email || !password || !role) {
    console.log('❌ REGISTRATION VALIDATION FAILED: Missing required fields')
    throw new BadRequestError('Please provide name, email, password, and role')
  }

  if (!['user', 'vendor', 'admin'].includes(role)) {
    console.log('❌ REGISTRATION VALIDATION FAILED: Invalid role:', role)
    throw new BadRequestError('Invalid role. Must be user, vendor, or admin')
  }

  console.log('✅ REGISTRATION VALIDATION PASSED: Proceeding with user creation')

  try {
    console.log('🔄 REGISTRATION: Attempting to create user in database')

    // Create user first
    const user = await User.create({
      name,
      email,
      password,
      role
    })

    console.log('✅ REGISTRATION: User created successfully with ID:', user.id)

    // Create EVM wallet
    let evmWalletData = null
    try {
      console.log('🔄 REGISTRATION: Creating EVM wallet')
      const evmWallet = ethers.Wallet.createRandom()
      // For now, store private key without encryption (TODO: implement proper encryption)
      user.walletAddress = evmWallet.address
      user.walletEncryptedPrivateKey = evmWallet.privateKey // TODO: encrypt this
      console.log('✅ REGISTRATION: EVM wallet created:', evmWallet.address)
      evmWalletData = { address: evmWallet.address }
    } catch (evmError) {
      console.log('⚠️ REGISTRATION: EVM wallet creation failed:', evmError.message)
      logger.warn('EVM wallet creation failed:', { userId: user.id, error: evmError.message })
      // Don't fail registration if EVM wallet creation fails
    }

    // Create Zcash shielded wallet
    let zcashWalletData = null
    try {
      console.log('🔄 REGISTRATION: Creating Zcash shielded wallet')
      zcashWalletData = await zcashService.createWallet()
      console.log('✅ REGISTRATION: Zcash wallet created:', zcashWalletData.address)

      // Update user with Zcash wallet data
      user.zcashAddress = zcashWalletData.address
      user.viewingKey = zcashWalletData.viewingKey
      user.zcashEncryptedPrivateKey = zcashWalletData.encryptedSeed
      user.zcashAccountIndex = zcashWalletData.accountIndex
      user.isSynced = zcashWalletData.isSynced
      user.lastSyncHeight = zcashWalletData.lastSyncHeight

      console.log('🔄 REGISTRATION: Saving user with wallet data')
      await user.save()
      console.log('✅ REGISTRATION: User saved with wallet data')
    } catch (zcashError) {
      console.log('⚠️ REGISTRATION: Zcash wallet creation failed:', zcashError.message)
      logger.warn('Zcash wallet creation failed:', { userId: user.id, error: zcashError.message })
      // Don't fail registration if Zcash wallet creation fails
    }

    console.log('🔄 REGISTRATION: Generating JWT token')
    const token = user.createJWT()
    console.log('✅ REGISTRATION: JWT token generated')

    const responseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        zcashAddress: user.zcashAddress
      },
      token,
      walletsCreated: !!zcashWalletData
    }

    console.log('✅ REGISTRATION SUCCESS: Sending response')
    res.status(StatusCodes.CREATED).json(responseData)

  } catch (error) {
    console.log('❌ REGISTRATION ERROR:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    })

    // Handle duplicate email error (Sequelize unique constraint error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('❌ REGISTRATION: Duplicate email error')
      throw new BadRequestError('Email already exists')
    }

    console.log('❌ REGISTRATION: Re-throwing error')
    throw error
  }
}

const login = async (req, res) => {
  try {
    console.log('🔍 LOGIN START: Received request body:', req.body)
    const { email, password } = req.body

    if (!email || !password) {
      console.log('❌ LOGIN VALIDATION FAILED: Missing email or password')
      throw new BadRequestError('Please provide email and password')
    }

    console.log('🔄 LOGIN: Looking up user by email:', email.toLowerCase())
    const user = await User.findOne({ where: { email: email.toLowerCase() } })
    if (!user) {
      console.log('❌ LOGIN: User not found for email:', email.toLowerCase())
      throw new UnauthenticatedError('Invalid Credentials')
    }

    console.log('✅ LOGIN: User found, checking password')
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      console.log('❌ LOGIN: Password incorrect for user:', user.id)
      throw new UnauthenticatedError('Invalid Credentials')
    }

    console.log('✅ LOGIN: Password correct, generating token')
    const token = user.createJWT()
    console.log('✅ LOGIN SUCCESS: Token generated')

    res.status(StatusCodes.OK).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        zcashAddress: user.zcashAddress
      },
      token
    })
  } catch (error) {
    console.log('❌ LOGIN ERROR:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    })
    throw error
  }
}

module.exports = {
  register,
  login,
}