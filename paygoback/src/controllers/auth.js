const User = require('../models/Users')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const { createChipiWallet } = require('../utils/chipi')
const logger = require('../utils/logger')

const register = async (req, res) => {
  const { name, email, password, role, walletPin } = req.body

  // Input validation
  if (!name || !email || !password || !role) {
    throw new BadRequestError('Please provide name, email, password, and role')
  }

  if (!['user', 'vendor', 'admin'].includes(role)) {
    throw new BadRequestError('Invalid role. Must be user, vendor, or admin')
  }

  try {
    // Create user first
    const user = await User.create({
      name,
      email,
      password,
      role
    })

    let walletData = null

    // Create both EVM and Zcash wallets automatically for all users
    try {
      walletData = await createChipiWallet(walletPin || 'defaultPin123', user.id.toString())

      // Update user with both wallet addresses
      user.walletAddress = walletData.evm.address
      user.walletEncryptedPrivateKey = walletData.evm.encryptedPrivateKey
      user.zcashAddress = walletData.zcash.address
      user.zcashEncryptedPrivateKey = walletData.zcash.encryptedPrivateKey
      await user.save()

      logger.info('Wallets created successfully for user:', { userId: user.id })
    } catch (walletError) {
      logger.warn('Wallet creation failed:', { userId: user.id, error: walletError.message })
      // Don't fail registration if wallet creation fails
      // User can create wallet later
    }

    const token = user.createJWT()

    res.status(StatusCodes.CREATED).json({
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
    })
  } catch (error) {
    // Handle duplicate email error (Sequelize unique constraint error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new BadRequestError('Email already exists')
    }
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