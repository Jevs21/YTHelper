// const express = require('express');
// const session = require('express-session');

const dotenv = require('dotenv');
dotenv.config();
const { google } = require('googleapis');

// const router = express.Router();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

class YoutubeAPI {
  constructor(UserModel) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
    this.User = UserModel;
    this.authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/youtube.readonly'
      ]
    });
  }

  async authenticate(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async ensureLoggedIn(userId) {
    // Retrieve tokens from the database
    const activeUser = await this.User.findByPk(userId);
    if (!activeUser) {
      throw new Error('User not found');
    }

    // Set the credentials for the oauth2Client using the stored tokens
    this.oauth2Client.setCredentials({
      access_token: activeUser.access_token,
      refresh_token: activeUser.refresh_token,
      scope: activeUser.scope,
      token_type: activeUser.token_type,
      expiry_date: activeUser.expiry_date,
    });

    // Check if the access token is expired
    if (this.oauth2Client.isTokenExpired()) {
      // Refresh the access token
      const refreshedTokens = await this.oauth2Client.refreshAccessToken();
      const newTokens = refreshedTokens.res.data;

      // Update the stored tokens in the database
      activeUser.access_token = newTokens.access_token;
      activeUser.expiry_date = newTokens.expiry_date;
      await activeUser.save();
    }
  }

  async getChannelId() {
    const response = await this.youtube.channels.list({
      part: 'id',
      mine: true
    });
    return response.data.items[0].id;
  }

  async getLatestUploads(count = 20) {
    const channelId = await this.getChannelId();
    const response = await this.youtube.search.list({
      part: 'snippet',
      channelId: channelId,
      maxResults: count,
      order: 'date',
      type: 'video'
    });
    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt
    }));
  }
}

module.exports = YoutubeAPI;