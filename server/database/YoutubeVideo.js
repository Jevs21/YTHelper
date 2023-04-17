const { Model, DataTypes } = require('sequelize');

class YoutubeVideo extends Model {
  static init(sequelize) {
    return super.init(
      {
        videoId: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        publishedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        thumbnailUrl: {
          type: DataTypes.STRING,
          allowNull: false,
        }
      },
      { sequelize, modelName: 'YoutubeVideo' }
    );
  }
}

module.exports = YoutubeVideo;
