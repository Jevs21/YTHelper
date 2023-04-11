
const express = require('express');
const router = express.Router();

const { ActiveUser, db } = require('../database/db');
const YoutubeAPI = require('./youtube');

router.get('/login', (req, res) => {
  res.send({ url: YoutubeAPI.authUrl });
});

router.get('/is_logged', async (req, res) => {
  // console.log(YoutubeAPI)
  const { uuid } = req.query;
  try {
    const user = await ActiveUser.findOne({ where: { id: uuid } });
    if (user) {
      res.send({authenticated: true});
    } else {
      res.send({authenticated: false});
    }
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

router.post('/oauth2callback', async (req, res) => {
  const { code } = req.body;
  // await db.sync();

  try {
    // console.log(code)
    const tokens = await YoutubeAPI.authenticate(code);
    // console.log(tokens);
    const user = await ActiveUser.create({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });
    // console.log(user)
    res.send({id: user.id});
  } catch (error) {
    res.send('Error: ' + error.message);
  }
});

module.exports = router;