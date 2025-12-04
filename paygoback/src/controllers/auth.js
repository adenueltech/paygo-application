const User = require('../models/Users')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const { createChipiWallet } = require('../utils/chipi')
const logger = require('../utils/logger')

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

    let walletData = null

    // Create both EVM and Zcash wallets automatically for all users
    try {
      console.log('🔄 REGISTRATION: Attempting wallet creation for user:', user.id)

      walletData = await createChipiWallet(walletPin || 'defaultPin123', user.id.toString())
      console.log('✅ REGISTRATION: Wallets created successfully:', {
        evm: !!walletData.evm,
        zcash: !!walletData.zcash
      })

      // Update user with both wallet addresses
      user.walletAddress = walletData.evm.address
      user.walletEncryptedPrivateKey = walletData.evm.encryptedPrivateKey
      user.zcashAddress = walletData.zcash.address
      user.zcashEncryptedPrivateKey = walletData.zcash.encryptedPrivateKey

      console.log('🔄 REGISTRATION: Saving user with wallet addresses')
      await user.save()
      console.log('✅ REGISTRATION: User saved with wallet addresses')

      logger.info('Wallets created successfully for user:', { userId: user.id })
    } catch (walletError) {
      console.log('⚠️ REGISTRATION: Wallet creation failed:', walletError.message)
      logger.warn('Wallet creation failed:', { userId: user.id, error: walletError.message })
      // Don't fail registration if wallet creation fails
      // User can create wallet later
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
      walletsCreated: !!walletData
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
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }

  const user = await User.findOne({ where: { email: email.toLowerCase() } })
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  const token = user.createJWT()
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
}

module.exports = {
  register,
  login,
}