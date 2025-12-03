const { DataTypes, Model } = require('sequelize');

class DashboardStats extends Model {
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
      userType: {
        type: DataTypes.ENUM('user', 'vendor'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['user', 'vendor']],
            msg: 'User type must be user or vendor'
          }
        }
      },
      period: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['daily', 'weekly', 'monthly', 'yearly']],
            msg: 'Invalid period'
          }
        }
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      // User Stats
      totalSessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      totalSpent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      averageSessionLength: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      favoriteCategories: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      // Vendor Stats
      totalEarnings: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      totalSessionsHosted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      activeServices: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      topServices: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      // Analytics
      sessionTrend: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      }
    }, {
      sequelize,
      modelName: 'DashboardStats',
      tableName: 'dashboard_stats',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['userType'] },
        { fields: ['period'] },
        { fields: ['date'] },
        { unique: true, fields: ['userId', 'period', 'date'] }
      ]
    });

    return this;
  }

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

module.exports = DashboardStats;