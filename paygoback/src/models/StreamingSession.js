const { DataTypes, Model } = require('sequelize');

class StreamingSession extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
        }
      },
      sessionId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.ENUM('active', 'paused', 'completed', 'stopped'),
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'paused', 'completed', 'stopped']],
            msg: 'Invalid status'
          }
        }
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      totalUsageSeconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      totalCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      clientInfo: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      qualityMetrics: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      linkedTransactionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'id'
        }
      },
      // Agora-specific fields
      agoraChannel: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      agoraToken: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      agoraAppId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '16508d8f8518406287ee4e7f839fb0c3'
      },
      participants: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      }
    }, {
      sequelize,
      modelName: 'StreamingSession',
      tableName: 'streaming_sessions',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['sessionId'] },
        { unique: true, fields: ['agoraChannel'] },
        { fields: ['vendorId'] },
        { fields: ['userId'] },
        { fields: ['serviceId'] },
        { fields: ['status'] },
        { fields: ['startTime'] }
      ]
    });

    return this;
  }

  // Convert to plain object
  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

module.exports = StreamingSession;
