const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const cron = require('node-cron');
const { json, urlencoded } = require('express');

const { init } = require('./database/db');

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// const youtubeRoutes = require('./routes/youtube');
// app.use('/youtube', youtubeRoutes);
const userRoutes = require('./routes/user');
const videoRoutes = require('./routes/video');
const spotifyRoutes = require('./routes/spotify');
const localRoutes = require('./routes/local');
const generatorRoutes = require('./routes/generator');
app.use('/user', userRoutes);
app.use('/video', videoRoutes);
app.use('/spotify', spotifyRoutes);
app.use('/local', localRoutes);
app.use('/generator', generatorRoutes);

// const { pollAnalytics } = require('./routes/cron');
// cron.schedule('* * * * *', pollAnalytics);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
