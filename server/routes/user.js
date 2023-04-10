
const express = require('express');
const router = express.Router();

const YTAPI = require('./youtube');
const { ActiveUser, db } = require('../database/db');
const YoutubeAPI = new YTAPI(ActiveUser);

router.get('/login', (req, res) => {
  res.send({url: YoutubeAPI.authUrl});
});

router.get('/is_logged', async (req, res) => {
  const { userId } = req.query;
  try {
    await YoutubeAPI.ensureLoggedIn(userId);
    res.send({authenticated: true});
  } catch (error) {
    console.log(error);
    res.send({authenticated: false});
  }
});

router.get('/logout', async (req, res) => {
  const { userId } = req.query;
  try {
    await ActiveUser.destroy({ where: { id: userId } });
    res.send(true);
  } catch (error) {
    console.log(error);
    res.send(false);
  }
});

router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  // await db.sync();

  try {
    console.log(code)
    const tokens = YoutubeAPI.authenticate(code);
    const user = await ActiveUser.create(tokens);

    res.send("Authenticated successfully!");
    console.log(user)
  } catch (error) {
    res.send('Error: ' + error.message);
  }
});

module.exports = router;