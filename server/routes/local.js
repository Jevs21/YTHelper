const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const tar = require('tar');
const MetaFuncs = require('./meta');

function deleteFilesInDir(dirPath) {
  const contents = fs.readdirSync(dirPath, { withFileTypes: true });
  contents.forEach((entry) => {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      deleteFilesInDir(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  });
}

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

router.get('/compress', async (req, res) => {
  console.log("Compressing local files.");

  // Generate fullmeta files
  const outputFolderPath = path.join(__dirname, '..', 'output');
  const fullMetaPath = path.join(outputFolderPath, 'fullmeta');
  const metaPath = path.join(outputFolderPath, 'meta');

  // Ensure fullMetaPath exists
  if (!fs.existsSync(fullMetaPath)) {
    fs.mkdirSync(fullMetaPath);
  }

  // For each file in metaPath run MetaFuncs.generateMeta(path)
  // And write to a file of the same name in fullmeta
  const metaFiles = fs.readdirSync(metaPath, { withFileTypes: true });

  metaFiles.forEach((entry) => {
    if (entry.isFile()) {
      const entryPath = path.join(metaPath, entry.name);
      const metaJSON = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
      const fullMeta = MetaFuncs.generateMeta(metaJSON);
      const fullMetaOutputPath = path.join(fullMetaPath, entry.name);
      const fullMetaContent = `${fullMeta.title}\n\n${fullMeta.tags.join(", ")}\n\n${fullMeta.description}`;
      fs.writeFileSync(fullMetaOutputPath, fullMetaContent);
    }
  });

  try {
    const outputPath = path.join(outputFolderPath, 'compressed.tar');
    const videoPath = path.join(outputFolderPath, 'video');
    const fullMetaAbsPath = path.join(outputFolderPath, 'fullmeta');

    await tar.create({
      file: outputPath,
      // cwd: outputFolderPath,
      // gzip: true,
      // portable: true,
      // noMtime: true,
      // noPax: true,
      // follow: true,
      // sync: true,
      // noDirRecurse: true,
      // noImplicitDirs: true,
      // entries: [videoPath, fullMetaAbsPath],
    }, [videoPath, fullMetaAbsPath]);

    return res.status(200).json({ success: true, message: 'Files compressed successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/clear', async (req, res) => {
  console.log("Clearing Local Files")
  try {
    deleteFilesInDir(path.join(__dirname, "..", 'output', 'raw'));
    deleteFilesInDir(path.join(__dirname, "..", 'output', 'meta'));
    deleteFilesInDir(path.join(__dirname, "..", 'output', 'fullmeta'));
    deleteFilesInDir(path.join(__dirname, "..", 'output', 'audio'));
    deleteFilesInDir(path.join(__dirname, "..", 'output', 'video'));


    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;