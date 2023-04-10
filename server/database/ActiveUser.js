const { Model, DataTypes } = require('sequelize');

class ActiveUser extends Model {
  static init(sequelize) {
    return super.init(
      {
        access_token: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        refresh_token: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        scope: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        token_type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        expiry_date: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
      },
      { sequelize, modelName: 'ActiveUser' }
    );
  }
}

module.exports = ActiveUser;
