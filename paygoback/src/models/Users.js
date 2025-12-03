const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please provide name' },
          len: {
            args: [3, 50],
            msg: 'Name must be between 3 and 50 characters'
          }
        }
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Please provide a valid email' },
          notEmpty: { msg: 'Please provide email' }
        },
        set(value) {
          this.setDataValue('email', value.toLowerCase().trim());
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: {
            args: [6, 255],
            msg: 'Password must be at least 6 characters'
          }
        }
      },
      role: {
        type: DataTypes.ENUM('user', 'vendor', 'admin'),
        allowNull: false,
        defaultValue: 'user',
        validate: {
          isIn: {
            args: [['user', 'vendor', 'admin']],
            msg: 'Role must be user, vendor, or admin'
          }
        }
      },
      walletAddress: {
        type: DataTypes.STRING(42), // Ethereum address length
        unique: true,
        allowNull: true
      },
      walletEncryptedPrivateKey: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      zcashAddress: {
        type: DataTypes.STRING(95), // Zcash shielded address length
        unique: true,
        allowNull: true
      },
      zcashEncryptedPrivateKey: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['email'] },
        { unique: true, fields: ['walletAddress'] }
      ],
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      },
      defaultScope: {
        attributes: { exclude: ['password', 'walletEncryptedPrivateKey', 'zcashEncryptedPrivateKey'] }
      }
    });

    return this;
  }

  // Instance methods
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  createJWT() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    if (!process.env.JWT_LIFETIME) {
      throw new Error('JWT_LIFETIME environment variable is required');
    }

    return jwt.sign(
      {
        userId: this.id,
        name: this.name,
        email: this.email,
        role: this.role,
        walletAddress: this.walletAddress
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME }
    );
  }

  // Convert to plain object without sensitive data
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.walletEncryptedPrivateKey;
    return values;
  }
}

module.exports = User;