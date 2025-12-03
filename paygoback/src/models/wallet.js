const { DataTypes, Model } = require('sequelize');

class Transaction extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      walletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('deposit', 'withdraw', 'charge'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['deposit', 'withdraw', 'charge']],
            msg: 'Type must be deposit, withdraw, or charge'
          }
        }
      },
      amount: {
        type: DataTypes.DECIMAL(18, 8),
        allowNull: false
      },
      token: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      transactionHash: {
        type: DataTypes.STRING(66),
        allowNull: true
      },
      toAddress: {
        type: DataTypes.STRING(42),
        allowNull: true
      },
      sessionId: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      serviceType: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      rate: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      timestamps: true,
      indexes: [
        { fields: ['walletId'] },
        { fields: ['type'] },
        { fields: ['transactionHash'] },
        { fields: ['sessionId'] }
      ]
    });

    return this;
  }

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

class Wallet extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      paygoUID: {
        type: DataTypes.STRING(32),
        allowNull: true,
        unique: true
      },
      balance: {
        type: DataTypes.DECIMAL(18, 8),
        allowNull: false,
        defaultValue: 0
      },
      zcashAddress: {
        type: DataTypes.STRING(95),
        allowNull: true
      },
      erc20Address: {
        type: DataTypes.STRING(42),
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Wallet',
      tableName: 'wallets',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['userId'] },
        { unique: true, fields: ['paygoUID'] }
      ]
    });

    return this;
  }

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

module.exports = { Wallet, Transaction };
