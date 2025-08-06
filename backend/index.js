import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import downloadRoute from './routes/download.js';
import youtubeRoute from './routes/youtube.js';

const app = express();
const PORT = process.env.PORT || 5000;

const API_KEY = process.env.API_KEY || 'ELITE123';

app.use(cors());
app.use(bodyParser.json());

// تحقق من API Key
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const key = req.headers['x-api-key'];
    if (key !== API_KEY) {
      return res.status(401).json({ error: 'Invalid API Key' });
    }
  }
  next();
});

app.get('/', (req, res) => {
  res.json({ message: '🔥 Elite Downloader API Running' });
});

app.use('/api/download', downloadRoute);
app.use('/api/youtube', youtubeRoute);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
