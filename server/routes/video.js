const express = require('express');
const router = express.Router();
const { YoutubeVideo } = require('../database/db');

router.get('/list', async (req, res) => {
  const videos = await YoutubeVideo.findAll();
  res.send(videos);
});


function getTimePeriod(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);

  if (dateA.toDateString() !== dateB.toDateString()) {
    return 0;
  }

  const hourA = dateA.getHours();

  if (hourA >= 5 && hourA < 10) {
    return 1;
  } else if (hourA >= 10 && hourA < 17) {
    return 2;
  } else {
    return 3;
  }
}

router.get('/getUploadSchedule', async (req, res) => {
  const videos = await YoutubeVideo.findAll();
  const now = new Date();
  const scheduledVideos = videos.filter(video => video.publishedAt > now);
  scheduledVideos.sort((a, b) => a.publishedAt - b.publishedAt);
  
  let schedule = [];
  for (let i=0; i < 30; i++) {
    const dt = new Date();
    dt.setDate(dt.getDate() + i);

    let dateStr = "";
    if (i === 0) {
      dateStr = "Today";
    } else if (i === 1) {
      dateStr = "Tomorrow";
    } else {
      dateStr = dt.toISOString().split('T')[0];
    }

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


  res.send(schedule);
});

module.exports = router;