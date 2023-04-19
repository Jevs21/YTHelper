const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
// const { YoutubeVideo } = require('../database/db');
const SpottyDL = require('spottydl');

function removePunctuationAndWhitespace(str) {
  return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g, '');
}

function renameFilesInDirectory(directoryPath, tracks) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }

    files.forEach((file) => {
      const oldPath = path.join(directoryPath, file);
      const t = tracks.find((track) => track.title === file.split(".")[0]);
      if (t === undefined) {
        console.log("Could not find track for file: " + file);
        return;
      }

      const newFilename = t.id + '.mp3';
      if (newFilename === undefined) {
        console.log("Could not find track for file: " + file);
        return;
      }
      const newPath = path.join(directoryPath, newFilename);

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error(`Error renaming file: ${err}`);
        } else {
          console.log(`Renamed '${oldPath}' to '${newPath}'`);
        }
      });
    });
  });
}

function saveMeta(meta, directoryPath, filename) {
  const filePath = path.join(directoryPath, filename);
  const data = JSON.stringify(meta, null, 2); // Convert the object to a JSON string with proper formatting

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error(`Error saving object to text file: ${err}`);
    } else {
      console.log(`Object saved to text file: ${filePath}`);
    }
  });
}

router.get('/getPlaylist', async (req, res) => {
  const { url } = req.query;
  const metaPath = path.join(__dirname, "..", 'output', 'meta');
  const outDir = path.join(__dirname, "..", 'output', 'raw');
  try {
    console.log("Getting playlist: " + url);
    const results  = await SpottyDL.getPlaylist(url);
    
    if ('tracks' in results) {
      for (const track of results.tracks) {
        const filename = `${track.id}.json`;
        saveMeta(track, metaPath, filename);
      }

      console.log("Got playlist. Downloading...");
      const playlist = await SpottyDL.downloadPlaylist(results, outDir)
      console.log(playlist)
      console.log("Downloaded playlist. Renaming files...");
      renameFilesInDirectory(outDir, results.tracks);
      res.send(playlist);
      return;
    }
  } catch (err) {
    console.log(err);
  }
  res.send("Failed")
});


module.exports = router;