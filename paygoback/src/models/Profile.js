const { DataTypes, Model } = require('sequelize');

class Profile extends Model {
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
      uid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please provide a phone number' }
        }
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        validate: {
          len: {
            args: [0, 500],
            msg: 'Bio cannot exceed 500 characters'
          }
        }
      },
      socialLinks: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
          twitter: '',
          linkedin: '',
          github: '',
          website: ''
        }
      }
    }, {
      sequelize,
      modelName: 'Profile',
      tableName: 'profiles',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['userId'] },
        { unique: true, fields: ['uid'] }
      ]
    });

    return this;
  }

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

module.exports = Profile;