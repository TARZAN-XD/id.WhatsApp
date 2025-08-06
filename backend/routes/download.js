import express from 'express';
import { downloadYouTube, downloadTikTok, downloadInstagram, downloadFacebook } from '../utils/index.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { url, format } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const data = await downloadYouTube(url, format);
      return res.json(data);
    }
    if (url.includes('tiktok.com')) {
      const data = await downloadTikTok(url);
      return res.json(data);
    }
    if (url.includes('instagram.com')) {
      const data = await downloadInstagram(url);
      return res.json(data);
    }
    if (url.includes('facebook.com')) {
      const data = await downloadFacebook(url);
      return res.json(data);
    }
    return res.status(400).json({ error: 'Unsupported platform' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to download video' });
  }
});

export default router;
