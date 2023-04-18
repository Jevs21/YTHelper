const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

function getDirectoryStructure(folderPath) {
  const result = {
    name: path.basename(folderPath),
    type: 'folder',
    children: [],
  };

  const contents = fs.readdirSync(folderPath, { withFileTypes: true });
  contents.forEach((entry) => {
    const entryPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      result.children.push(getDirectoryStructure(entryPath));
    } else {
      result.children.push({
        name: entry.name,
        type: 'file',
      });
    }
  });

  return result;
}

router.get('/list', async (req, res) => {
  try {
    const raw = getDirectoryStructure(path.join(__dirname, "..", 'output', 'raw'));
    const meta = getDirectoryStructure(path.join(__dirname, "..", 'output', 'meta'));
    const vids = getDirectoryStructure(path.join(__dirname, "..", 'output', 'video'));
    const audi = getDirectoryStructure(path.join(__dirname, "..", 'output', 'audio'));
    return res.status(200).json({ 
      raw: raw.children,
      meta: meta.children,
      audio: audi.children,
      video: vids.children,
     });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;