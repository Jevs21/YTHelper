const express = require('express');
const router = express.Router();
const { YoutubeVideo } = require('../database/db');

router.get('/list', async (req, res) => {
  const videos = await YoutubeVideo.findAll();
  res.send(videos);
});

module.exports = router;