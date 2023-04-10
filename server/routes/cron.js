const YouTubeAPI = require('./youtube');
const ActiveUser = require('../database/ActiveUser');

const YoutubeAPI = new YouTubeAPI(ActiveUser);

async function pollAnalytics() {
  console.log('This function will run every minute:', new Date());

  const activeUsers = await ActiveUser.findAll();
  for (let i = 0; i < activeUsers.length; i++) {
    const user = activeUsers[i];
    console.log("Polling analytics for user:", user.id);
    try {
      // Ensure the user is logged in
      await youtubeAPI.ensureLoggedIn(user.id);
  
      // Get the latest uploads
      const latestUploads = await youtubeAPI.getLatestUploads();
      console.log('Latest uploads:', latestUploads.length);
    } catch (error) {
      console.error('Error getting latest uploads:', error.message);
    }
  }

  // return userIds;
  // if (YoutubeAPI.isAuthenticated()) {
  //   console.log('Authenticated. Fetching latest uploads...');
  //   const res = await YoutubeAPI.getLatestUploads();
  //   console.log(res);
  // } else {
  //   console.log('Not authenticated. Authenticate: ');
  //   console.log(YoutubeAPI.authUrl);
  //   // await YoutubeAPI.authenticate();
  // }
}


module.exports = {pollAnalytics};