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

//   async getChannelId() {
//     const response = await this.youtube.channels.list({
//       part: 'id',
//       mine: true
//     });
//     return response.data.items[0].id;
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