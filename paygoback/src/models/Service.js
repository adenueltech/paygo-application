const { DataTypes, Model } = require('sequelize');

class Service extends Model {
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Service name is required' }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Description is required' },
          len: {
            args: [1, 1000],
            msg: 'Description must be less than 1000 characters'
          }
        }
      },
      category: {
        type: DataTypes.ENUM(
          'Time-Based', 'Usage-Based', 'Digital Products & Content',
          'E-commerce & Marketplace', 'Data & Analytics', 'Specialized Services'
        ),
        allowNull: false,
        validate: {
          isIn: {
            args: [['Time-Based', 'Usage-Based', 'Digital Products & Content',
                   'E-commerce & Marketplace', 'Data & Analytics', 'Specialized Services']],
            msg: 'Invalid category'
          }
        }
      },
      subcategory: {
        type: DataTypes.ENUM(
          'Pay Per Hour', 'Pay Per Session', 'Pay Per View/Consumption',
          'API Calls & Compute', 'Storage Services', 'Processing Services',
          'Digital Downloads', 'SaaS Features',
          'Transaction-Based', 'Professional Services',
          'Data Services', 'Creative Services', 'Technical Services'
        ),
        allowNull: false,
        validate: {
          isIn: {
            args: [['Pay Per Hour', 'Pay Per Session', 'Pay Per View/Consumption',
                   'API Calls & Compute', 'Storage Services', 'Processing Services',
                   'Digital Downloads', 'SaaS Features',
                   'Transaction-Based', 'Professional Services',
                   'Data Services', 'Creative Services', 'Technical Services']],
            msg: 'Invalid subcategory'
          }
        }
      },
      type: {
        type: DataTypes.ENUM('video', 'audio', 'data', 'other'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['video', 'audio', 'data', 'other']],
            msg: 'Type must be video, audio, data, or other'
          }
        }
      },
      rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: 'Rate must be positive'
          }
        }
      },
      unit: {
        type: DataTypes.ENUM(
          'per_second', 'per_minute', 'per_hour', 'per_session',
          'per_gb', 'per_transaction', 'per_request'
        ),
        allowNull: false,
        validate: {
          isIn: {
            args: [['per_second', 'per_minute', 'per_hour', 'per_session',
                   'per_gb', 'per_transaction', 'per_request']],
            msg: 'Invalid unit'
          }
        }
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
      }
    }, {
      sequelize,
      modelName: 'Service',
      tableName: 'services',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['category'] },
        { fields: ['subcategory'] },
        { fields: ['type'] },
        { fields: ['isActive'] },
        { unique: true, fields: ['userId', 'name'] }
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

module.exports = Service;