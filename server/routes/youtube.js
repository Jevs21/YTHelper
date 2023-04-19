const express = require('express');
const router = express.Router();

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

async function getScheduledVideos(channelId) {
  console.log("Getting scheduled videos...");
  const videoResults = [];
  let nextPageToken = '';

  do {
    const response = await youtube.search.list({
      part: 'snippet',
      channelId: channelId,
      maxResults: 50,
      pageToken: nextPageToken,
      eventType: 'upcoming',
      type: 'video'
    });

    videoResults.push(...response.data.items);
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);

  const videoIds = videoResults.map(item => item.id.videoId).join(',');
  const videosResponse = await youtube.videos.list({
    part: 'snippet,status',
    id: videoIds
  });

  return videosResponse.data.items;
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

// exports.getAllVideos = async (userId) => {
//   try {
//     await this.ensureLoggedIn(userId);
    
//     const channelId = await this.getChannelId();
//     const uploadsPlaylistId = await getUploadsPlaylistId(channelId);
//     const videoResults = [];
//     let nextPageToken = '';

//     do {
//       const response = await youtube.playlistItems.list({
//         part: 'snippet,contentDetails,status',
//         playlistId: uploadsPlaylistId,
//         maxResults: 50,
//         pageToken: nextPageToken
//       });
//       // if (response.data.items.length > 0) {
//       //   console.log(response.data.items[0])  
//       // }
      

//       videoResults.push(...response.data.items);
//       nextPageToken = response.data.nextPageToken;
//     } while (nextPageToken);

//     // Get scheduled videos
//     let nextPageTokenScheduled = '';
//     const scheduledVideoResults = [];
//     do {
//       const responseScheduled = await youtube.videos.list({
//         part: 'snippet,contentDetails,status',
//         channelId: channelId,
//         maxResults: 50,
//         pageToken: nextPageTokenScheduled
//       });
//       console.log(responseScheduled.data.items)

//       scheduledVideoResults.push(...responseScheduled.data.items.filter(item => {
//         const status = item.snippet.liveBroadcastContent;
//         const scheduledDate = new Date(item.snippet.publishedAt);
//         return status === 'upcoming' && scheduledDate > new Date();
//       }));
//       nextPageTokenScheduled = responseScheduled.data.nextPageToken;
//     } while (nextPageTokenScheduled);

//     // Combine uploaded and scheduled videos
//     // const combinedResults = videoResults.concat(scheduledVideoResults);

//     return combinedResults.map(item => ({
//       videoId: item.id.videoId || item.contentDetails.videoId,
//       title: item.snippet.title,
//       description: item.snippet.description,
//       publishedAt: item.status.publishAt,
//       visibility: item.snippet.resourceId?.kind === 'youtube#video' || item.id.kind === 'youtube#video' ? 'public' : 'private',
//       thumbnailUrl: item.snippet.thumbnails.default.url
//     }));
//   } catch (error) {
//     console.error('Error getting all videos:', error.message);
//     return [];
//   }
// };



// Get the uploads playlist ID for the given channel ID
async function getUploadsPlaylistId(channelId) {
  const response = await youtube.channels.list({
    part: 'contentDetails',
    id: channelId
  });
  return response.data.items[0].contentDetails.relatedPlaylists.uploads;
}

// class YoutubeAPI {
//   constructor() {
    
//   }

  

//   async ensureLoggedIn(userId) {
//     // Set the credentials for the oauth2Client using the stored tokens
//     this.oauth2Client.setCredentials({
//       access_token: activeUser.access_token,
//       refresh_token: activeUser.refresh_token,
//       scope: activeUser.scope,
//       token_type: activeUser.token_type,
//       expiry_date: activeUser.expiry_date,
//     });

//     // Check if the access token is expired
//     if (this.oauth2Client.isTokenExpired()) {
//       // Refresh the access token
//       const refreshedTokens = await this.oauth2Client.refreshAccessToken();
//       const newTokens = refreshedTokens.res.data;

//       // Update the stored tokens in the database
//       activeUser.access_token = newTokens.access_token;
//       activeUser.expiry_date = newTokens.expiry_date;
//       await activeUser.save();
//     }
//   }

  

//   async getLatestUploads(count = 20) {
//     const channelId = await this.getChannelId();
//     const response = await this.youtube.search.list({
//       part: 'snippet',
//       channelId: channelId,
//       maxResults: count,
//       order: 'date',
//       type: 'video'
//     });
//     return response.data.items.map(item => ({
//       videoId: item.id.videoId,
//       title: item.snippet.title,
//       description: item.snippet.description,
//       publishedAt: item.snippet.publishedAt
//     }));
//   }
// }

// router.get('/')

// module.exports = YoutubeAPI;