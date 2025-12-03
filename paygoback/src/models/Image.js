const { DataTypes, Model } = require('sequelize');

class Image extends Model {
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
      filename: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      originalName: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      path: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      mimetype: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      isProfileImage: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      sequelize,
      modelName: 'Image',
      tableName: 'images',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['isProfileImage'] }
      ]
    });

    return this;
  }

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

module.exports = Image;