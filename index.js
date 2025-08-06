import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import downloadRoute from './backend/routes/download.js';
import youtubeRoute from './backend/routes/youtube.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const API_KEY = process.env.API_KEY || 'ELITE123';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'frontend')));

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

// API routes
app.use('/api/download', downloadRoute);
app.use('/api/youtube', youtubeRoute);

// صفحة رئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
