const express = require('express');
const path = require('path');
const router = express.Router();
const YoutubeAPI = require('./youtube');
const { YoutubeVideo } = require('../database/db');

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

  if (hourA >= 5 && hourA < 10) {
    return 1;
  } else if (hourA >= 10 && hourA < 17) {
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
      pub = new Date(day.date + "T09:00:00.000Z");
      break;
    } 
    else if (day.schedule[1] === 0) {
      pub = new Date(day.date + "T12:00:00.000Z");
      break;
    }
    else if (day.schedule[2] === 0) {
      pub = new Date(day.date + "T19:00:00.000Z");
      break;
    }
  }
  return pub;
}

router.get('/getUploadSchedule', async (req, res) => {
  const schedule = await getUploadSchedule();
  res.send(schedule);
});

function generateMeta(meta) {
  function generateSubMsg() {
    const subMsgs = [
      "Subscribe for more!",
      "sub 4 more",
      "mAke SuRe tO SuBsCriBe",
      "s u b s c r i b e",
      "sub more more songs",
      "submarine sandwich",
      "subscribe",
      "make sure to subscribe",
      "be sure to subscribe",
      "hit that sub button",
      "subscribe fore slowed and reverb",
      "sub pls",
      "thanks for watching",
      "have a good day",
      "hope ur day is good",
      "hope ur day is nice"
    ];
    return subMsgs[Math.floor(Math.random() * subMsgs.length)];
  }
  function generateTags(amt=10) {
    const tags = [
      "lo-fi", "lo", "fi", "chill", "vibes", "8D", "reverb", "remix", "study", "beats",
      "freestyle", "hip", "hop", "hiphop", "indie", "perfect", "high", "mix", "playlist",
      "party", "trippy", "trip", "visualize", "anime", "gif", "loop", "background", "relax",
      "electronic", "dance", "EDM", "trap", "future", "bass", "house", "deep", "dubstep",
      "ambient", "chillstep", "instrumental", "mashup", "bootleg", "cover", "soundtrack",
      "DJ", "producer", "music", "video", "trending", "upbeat", "groove", "experimental",
      "chillhop", "synthwave", "retrowave", "vaporwave", "R&B", "funk", "soul", "jazz"
    ];
    return tags.sort(() => Math.random() - 0.5).slice(0, amt);
  }
  // Generate title

  const title = `${meta.artist.toLowerCase()} - ${meta.title.toLowerCase()} ( slowed + reverb )`;
  const description = `${title}\n\n${generateTags()}\n\n${generateSubMsg()}\n~zednyt`;
  const tags = generateTags();
  
  return {
    title: title,
    description: description,
    tags: tags
  }
}
function areStringsSimilar(a, b) {
  const ignoreString = "( slowed + reverb )";
  const aLower = a.toLowerCase().replace(ignoreString, '');
  const bLower = b.toLowerCase().replace(ignoreString, '');

  if (aLower === bLower) {
      return true;
  }

  const minLength = Math.min(aLower.length, bLower.length);
  let commonChars = 0;

  for (let i = 0; i < minLength; i++) {
      if (aLower[i] === bLower[i]) {
          commonChars++;
      }
  }

  const similarityThreshold = 0.5;

  if (commonChars / minLength >= similarityThreshold) {
      return true;
  }

  return false;
}

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
  let meta = generateMeta(require(metaPath));
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
  const schedule = await getUploadSchedule();
  const meta = generateMeta(require(metaPath), schedule);
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