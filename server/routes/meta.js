const fs = require('fs');

exports.generateMeta = (meta) => {
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

exports.areStringsSimilar = (a, b) => {
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


