const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');


router.get('/audio', async (req, res) => {
  const scriptPath = path.join(__dirname, '..', 'python', 'audio.py');
  const rawPath = path.join(__dirname, '..', 'output', 'raw');
  const outPath = path.join(__dirname, '..', 'output', 'audio');
  console.log("Running script: " + scriptPath)
  try {
    const pythonProcess = spawn('python3', [scriptPath, rawPath, outPath]);
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python stdout: ${data}`);
    });
  
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });
    pythonProcess.on('exit', (code) => {
      console.log(`Python script exited with code ${code}`);
      if (code === 0) {
        res.status(200).json({ message: 'Python script completed successfully' });
      } else {
        res.status(500).json({ message: 'Python script failed', error: code });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;