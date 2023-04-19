
const express = require('express');
const router = express.Router();

const { ActiveUser, YoutubeVideo } = require('../database/db');
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
    // Add videos to database if they don't exist, and update the user's videos details
    // if they have changed.
    const dbVids = await YoutubeVideo.findAll();
    const videos = await YoutubeAPI.getAllVideos(user.id);
    console.log("Starting to update videos")
    for (let i = 0; i < videos.length; i++) {
      console.log("Updating video " + i)
      const video = videos[i];
      const dbVideo = dbVids.find(dbVideo => dbVideo.videoId === video.videoId);
      if (dbVideo) {
        // Update the video if it has changed
        if (dbVideo.title !== video.title ||
            dbVideo.description !== video.description ||
            dbVideo.publishedAt !== video.publishedAt ||
            dbVideo.thumbnailUrl !== video.thumbnailUrl) {
              // console.log("Video has changed. Updating it.")
              // Console log all the changes
              if (dbVideo.title !== video.title) {
                console.log("Title has changed from " + dbVideo.title + " to " + video.title)
              }
              if (dbVideo.description !== video.description) {
                console.log("Description has changed from " + dbVideo.description + " to " + video.description)
              }
              if (dbVideo.publishedAt !== video.publishedAt) {
                console.log("PublishedAt has changed from " + dbVideo.publishedAt + " to " + video.publishedAt)
              }
              if (dbVideo.thumbnailUrl !== video.thumbnailUrl) {
                console.log("ThumbnailUrl has changed from " + dbVideo.thumbnailUrl + " to " + video.thumbnailUrl)
              }
              
              dbVideo.title = video.title;
              dbVideo.description = video.description;
              dbVideo.publishedAt = video.publishedAt;
              dbVideo.thumbnailUrl = video.thumbnailUrl;
              await dbVideo.save();
        } else {
          // console.log("Video has not changed. Skipping it.")
        }
      } else {
        console.log("Video does not exist in database. Adding it.")
        // Add the video to the database\
        // console.log(video);
        try {
          await YoutubeVideo.create({
            videoId: video.videoId,
            title: video.title,
            description: video.description,
            publishedAt: video.publishedAt,
            thumbnailUrl: video.thumbnailUrl,
          });
        } catch (error) {
          console.log("\nERROR: " + error.name);
          console.log(error);
        }
        
      }
    }

    console.log("Finished updating videos!")
    res.send({id: user.id});
  } catch (error) {
    console.log(error);
    res.send('Error: ' + error.message);
  }
});

module.exports = router;