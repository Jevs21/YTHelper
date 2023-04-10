const express = require('express');
const router = express.Router();
const { YoutubeVideo } = require('../database/db');

router.get('/list', (req, res) => {
  const videos = YoutubeVideo.findAll();
  res.send(videos);
});

module.exports = router;