const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const YoutubeAPI = require('./youtube');
const { YoutubeVideo } = require('../database/db');
const { MetaFuncs } = require('./meta');

router.get('/list', async (req, res) => {
  const videos = await YoutubeVideo.findAll();
  res.send(videos);
});


router.get('/getNextPublishDate', async (req, res) => {
  const nextDate = await getNextUploadTime();
  res.send({dt: nextDate});
});

router.post('/setPublishDate', async (req, res) => {
  const { videoId, date } = req.body;
  try {
    const video = await YoutubeVideo.findOne({ where: { videoId: videoId } });

    if (video) {
      console.log("Changing publish date to:" + date)
      console.log(video)
      const changeRes = await YoutubeAPI.updateVideoPublishDate(video, date);
      if (changeRes) {
        video.publishedAt = date;
        await video.save();
        res.send({success: true});
        return;
      }
    }
    res.send({success: false});
  } catch (error) {
    console.log(error);
    res.send({success: false});
  }
});

function getTimePeriod(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);

  if (dateA.toDateString() !== dateB.toDateString()) {
    return 0;
  }

  const hourA = dateA.getHours();

  if (hourA >= 5 && hourA < 13) {
    return 1;
  } else if (hourA >= 13 && hourA < 21) {
    return 2;
  } else {
    return 3;
  }
}

async function getUploadSchedule() {
  const videos = await YoutubeVideo.findAll();
  const now = new Date();
  const scheduledVideos = videos.filter(video => video.publishedAt > now);
  scheduledVideos.sort((a, b) => a.publishedAt - b.publishedAt);
  
  let schedule = [];
  for (let i=0; i < 30; i++) {
    const dt = new Date();
    dt.setDate(dt.getDate() + i);

    let dateStr = dt.toISOString().split('T')[0];

    schedule.push({
      date: dateStr,
      schedule: [0, 0, 0]
    });

    for (const vid of scheduledVideos) {
      const timePeriod = getTimePeriod(vid.publishedAt, dt.getTime());
      if (timePeriod > 0) {
        schedule[i].schedule[timePeriod - 1] += 1;
      }
    }
  }
  

  const slot = new Date();
  for (let i=1; i < schedule.length; i++) {
    if (schedule[i].schedule[0] === 0) {
      slot.setDate(slot.getDate() + i);
      slot.setHours(9);
      slot.setMinutes(0);
      slot.setSeconds(0);
      break;
    } else if (schedule[i].schedule[1] === 0) {
      slot.setDate(slot.getDate() + i);
      slot.setHours(12);
      slot.setMinutes(0);
      slot.setSeconds(0);
      break;
    } else if (schedule[i].schedule[2] === 0) {
      slot.setDate(slot.getDate() + i);
      slot.setHours(19);
      slot.setMinutes(0);
      slot.setSeconds(0);
      break;
    }
  }

  return schedule;
}

async function getNextUploadTime() {
  const schedule = await getUploadSchedule();

  let pub = new Date();
  for(let i = 1; i < schedule.length; i++) {
    const day = schedule[i];
    if (day.schedule[0] === 0) {
      pub = new Date(day.date + "T12:00:00.000Z");
      break;
    } 
    else if (day.schedule[1] === 0) {
      pub = new Date(day.date + "T16:00:00.000Z");
      break;
    }
    else if (day.schedule[2] === 0) {
      pub = new Date(day.date + "T23:00:00.000Z");
      break;
    }
  }
  return pub;
}

router.get('/getUploadSchedule', async (req, res) => {
  const schedule = await getUploadSchedule();
  res.send(schedule);
});

async function getMetaSimilarities(meta) {
  let ret = [];
  const videos = await YoutubeVideo.findAll();
  for (const video of videos) {
    if (areStringsSimilar(video.title, meta.title)) {
      ret.push(video.title);
    }
  }
  return ret;
}

router.get('/prepareUpload', async (req, res) => {
  const { file } = req.query;
  const metaPath = path.join(__dirname, '..', 'output', 'meta', file + '.json');
  let meta = MetaFuncs.generateMeta(require(metaPath));
  meta.publish = await getNextUploadTime();
  const similar = await getMetaSimilarities(meta);
  console.log("Preparing upload");
  // console.log(meta);
  // console.log(similar)
  res.send({meta: meta, similar: similar});
});

router.post('/upload', async (req, res) => {
  const { file } = req.body;
  const metaPath = path.join(__dirname, '..', 'output', 'meta', file + '.json');
  const audioPath = path.join(__dirname, '..', 'output', 'audio', file + '.mp3');
  const rawPath = path.join(__dirname, '..', 'output', 'raw', file + '.mp3');
  const vidPath = path.join(__dirname, '..', 'output', 'video', file + '.mp4');
  
  let meta = MetaFuncs.generateMeta(require(metaPath));
  meta.publish = await getNextUploadTime();
  console.log("Uploading");

  try {
    const newVidID = await YoutubeAPI.uploadVideo(meta, vidPath);

    if (newVidID === null) {
      res.status(500).send("Error uploading video");
      return;
    }

    // Remove files
    fs.unlinkSync(rawPath);
    fs.unlinkSync(audioPath);
    fs.unlinkSync(metaPath);
    fs.unlinkSync(vidPath);

    const newVid = await YoutubeVideo.create({
      videoId: newVidID,
      title: meta.title,
      description: meta.description,
      publishedAt: meta.publish,
      thumbnailUrl: ""
    });

    res.send(newVid);
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
});

module.exports = router;