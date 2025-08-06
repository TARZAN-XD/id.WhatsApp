import ytdl from 'ytdl-core';
import fetch from 'node-fetch';

// YouTube
export const downloadYouTube = async (url, format = 'video') => {
  const info = await ytdl.getInfo(url);
  const formats = format === 'audio'
    ? ytdl.filterFormats(info.formats, 'audioonly')
    : ytdl.filterFormats(info.formats, 'videoandaudio');

  return {
    title: info.videoDetails.title,
    thumbnail: info.videoDetails.thumbnails.pop().url,
    downloadLinks: formats.map(f => ({ quality: f.qualityLabel, url: f.url }))
  };
};

// TikTok
export const downloadTikTok = async (url) => {
  const api = `https://www.tikwm.com/api/?url=${url}`;
  const res = await fetch(api);
  const data = await res.json();
  return { title: data.data.title, video: data.data.play, cover: data.data.cover };
};

// Instagram
export const downloadInstagram = async (url) => {
  const api = `https://api.izobility.com/instagram?url=${url}`;
  const res = await fetch(api);
  return await res.json();
};

// Facebook
export const downloadFacebook = async (url) => {
  const api = `https://api.izobility.com/facebook?url=${url}`;
  const res = await fetch(api);
  return await res.json();
};
