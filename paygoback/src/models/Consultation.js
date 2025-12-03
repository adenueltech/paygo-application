const { DataTypes, Model } = require('sequelize');

class Consultation extends Model {
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
      vendorId: {
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
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'accepted', 'completed', 'cancelled']],
            msg: 'Invalid status'
          }
        }
      },
      messages: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      }
    }, {
      sequelize,
      modelName: 'Consultation',
      tableName: 'consultations',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['vendorId'] },
        { fields: ['serviceId'] },
        { fields: ['status'] }
      ]
    });

    return this;
  }

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

module.exports = Consultation;