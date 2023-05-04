const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const { google } = require('googleapis');

// Load dotenv
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

// Load the OAuth2 client and apis
const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);
const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client
});
const analytics = google.youtubeAnalytics({
  version: 'v2',
  auth: oauth2Client
});

// Load auth url
exports.authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/youtube.readonly'
  ]
});

// router.get('/authenticate', async (req, res) => {
//   const { code } = req.query;
//   try {
//     const tokens = await this.oauth2Client.getToken(code);
//     res.send(tokens);
//   } catch (error) {
//     res.send('Error: ' + error.message);
//   }
// });
exports.authenticate = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

exports.ensureLoggedIn = async (userId) => {
  console.log('ensureLoggedIn called (NOT IMPLEMENTED)');
  return true;
}

exports.getChannelId = async () => {
  const response = await youtube.channels.list({
    part: 'id',
    mine: true
  });
  return response.data.items[0].id;
}

exports.refreshAccessToken = async (user) => {
  try {
    // Find the user in the database

    // Set the user's refresh token in the OAuth2 client
    oauth2Client.setCredentials({
      refresh_token: user.refresh_token,
    });

    // Request a new access token
    const accessToken = await oauth2Client.getAccessToken();

    // Check if the access token has changed
    if (accessToken.token !== user.access_token) {
      // Update the user's access token and expiry date in the database
      await user.update({
        access_token: accessToken.token,
        expiry_date: accessToken.expiry_date,
      });
      console.log('Access token refreshed');
    } else {
      console.log('Access token is still valid');
    }

  } catch (error) {
    console.error('Failed to refresh access token:', error);
  }
}

async function getUploadedVideos(uploadsPlaylistId) {
  console.log("Getting uploaded videos...");
  const videoResults = [];
  let nextPageToken = '';

  do {
    const response = await youtube.playlistItems.list({
      part: 'snippet,contentDetails,status',
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken: nextPageToken
    });
    // console.log(response.data.items);
    const vidIdString = response.data.items.map(item => item.contentDetails.videoId).join(',');
    const videoResponse = await youtube.videos.list({
      part: 'snippet,contentDetails,status',
      id: vidIdString
    });

    videoResults.push(...videoResponse.data.items);
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);

  return videoResults.map(item => {
    // console.log("Snippet Published at: " + item.snippet.publishedAt + " ContentDetails Published at: " + item.contentDetails.videoPublishedAt);
    // console.log(item.status);
    // if (item.status.privacyStatus === 'private') {
    //   if ('publishAt' in item.status) {
    //     console.log(item.status.publishAt);
    //   }
    // }
    // console.log(item)
    let video = item.snippet;
    video.id = item.id;
    video.status = item.status.privacyStatus;
    video.publishedAt = (video.status === 'private' && 'publishAt' in item.status) ? item.status.publishAt : item.snippet.publishedAt;
    video.thumbnail = item.snippet.thumbnails.default.url;
    // console.log(video)
    return video;
  });
}

exports.getAllVideos = async (userId) => {
  try {
    await this.ensureLoggedIn(userId);

    const channelId = await this.getChannelId();
    const uploadsPlaylistId = await getUploadsPlaylistId(channelId);
    const uploadedVideoResults = await getUploadedVideos(uploadsPlaylistId);
    // const scheduledVideoResults = await getScheduledVideos(channelId);

    const allVideos = [...uploadedVideoResults];
    // const allVideos = [...uploadedVideoResults, ...scheduledVideoResults];

    return allVideos.map(item => ({
      videoId: item.id,
      title: item.title,
      description: item.description,
      publishedAt: item.publishedAt,
      visibility: item.status,
      thumbnailUrl: item.thumbnail
    }));
  } catch (error) {
    console.error('Error getting all videos:', error.message);
    return [];
  }
};


exports.uploadVideo = async (metadata, videoFilePath) => {
  try {
    await this.ensureLoggedIn();

    const videoFile = fs.createReadStream(videoFilePath);
    const fileSize = fs.statSync(videoFilePath).size;

    // Upload video
    const uploadRequest = await youtube.videos.insert(
      {
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: '10',
          },
          status: {
            privacyStatus: 'private',
            publishAt: metadata.publish,
          },
        },
        media: {
          mimeType: 'video/mp4',
          body: videoFile,
        },
      },
      {
        maxBodyLength: fileSize,
        maxContentLength: fileSize,
      },
    );

    const videoId = uploadRequest.data.id;
    console.log('Video uploaded with ID:', videoId);

    // Set thumbnail
    if (metadata.thumbnailPath) {
      const thumbnail = fs.createReadStream(metadata.thumbnailPath);
      await youtube.thumbnails.set({
        videoId: videoId,
        media: {
          mimeType: 'image/jpeg',
          body: thumbnail,
        },
      });
      console.log('Thumbnail set for video', videoId);
    }

    return videoId;
  } catch (error) {
    console.error('Error uploading video:', error.message);
    return null;
  }
};

exports.updateVideoPublishDate = async (video, publishDate) => {
  try {
    await this.ensureLoggedIn();

    const response = await youtube.videos.update({
      part: 'snippet,status',
      requestBody: {
        id: video.videoId,
        snippet: {
          title: video.title,
          description: video.description,
          categoryId: '10',
          publishedAt: publishDate
        },
        status: {
          privacyStatus: 'private',
          publishAt: publishDate
        }
      }
    });

    console.log('Video publish date updated:', video.videoId);
    return response.data;
  } catch (error) {
    console.error('Error updating video publish date:', error.message);
    return null;
  }
};

exports.getVideoViewCount = async (videoId) => {
  try {
    const response = await youtube.videos.list({
      part: 'statistics',
      id: videoId
    });

    if (response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    return response.data.items[0].statistics.viewCount;
  } catch (error) {
    console.error('Error getting video view count:', error.message);
    return null;
  }
};


// Get the uploads playlist ID for the given channel ID
async function getUploadsPlaylistId(channelId) {
  const response = await youtube.channels.list({
    part: 'contentDetails',
    id: channelId
  });
  return response.data.items[0].contentDetails.relatedPlaylists.uploads;
}
