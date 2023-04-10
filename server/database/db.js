const { Sequelize } = require('sequelize');
const YoutubeVideo = require('./YoutubeVideo');
const YoutubeVideoViewLog = require('./YoutubeVideoViewLog');
const ActiveUser = require('./ActiveUser');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

const initModels = async () => {
  YoutubeVideo.init(sequelize);
  YoutubeVideoViewLog.init(sequelize);
  ActiveUser.init(sequelize);

  YoutubeVideoViewLog.associate({ YoutubeVideo });

  await sequelize.sync();
};

const init = async () => {
  try {
    await initModels();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error initializing models:', error);
  }
};

module.exports = {
  init,
  YoutubeVideo,
  YoutubeVideoViewLog,
  ActiveUser,
};
