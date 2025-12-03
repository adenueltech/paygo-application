const { DataTypes, Model } = require('sequelize');

class Notification extends Model {
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
        references: {
          model: 'users',
          key: 'id'
        }
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('session', 'payment', 'alert'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['session', 'payment', 'alert']],
            msg: 'Type must be session, payment, or alert'
          }
        }
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['read'] },
        { fields: ['type'] }
      ]
    });

    return this;
  }

  // Convert to plain object without sensitive data
  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

module.exports = Notification;

