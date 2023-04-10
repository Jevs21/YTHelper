const { Model, DataTypes } = require('sequelize');

class YoutubeVideoViewLog extends Model {
  static init(sequelize) {
    return super.init(
      {
        viewCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      { sequelize, modelName: 'YoutubeVideoViewLog' }
    );
  }

  static associate(models) {
    this.belongsTo(models.YoutubeVideo, {
      foreignKey: 'videoId',
      as: 'youtubeVideo',
    });
  }
}

module.exports = YoutubeVideoViewLog;