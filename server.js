import express from 'express';
import cors from 'cors';
import ytdl from '@distube/ytdl-core';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Get Video Info
app.get('/api/info', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getInfo(url);

        // Filter for 720p or highest available that has both audio and video
        const formats = info.formats
            .filter(f => f.hasVideo && f.hasAudio && f.qualityLabel === '720p');

        // If 720p not found, take the highest available with audio/video
        const bestFormat = formats.length > 0 ? formats[0] :
            info.formats.filter(f => f.hasVideo && f.hasAudio).sort((a, b) => (b.height || 0) - (a.height || 0))[0];

        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            duration: info.videoDetails.lengthSeconds,
            quality: bestFormat?.qualityLabel || 'Unknown'
        });
    } catch (error) {
        console.error('Info Error:', error);
        res.status(500).json({ error: 'Failed to fetch video info' });
    }
});

// Download Video
app.get('/api/download', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL is required');

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        // Target 720p
        const formats = info.formats.filter(f => f.hasVideo && f.hasAudio && f.qualityLabel === '720p');
        const format = formats.length > 0 ? formats[0] :
            info.formats.filter(f => f.hasVideo && f.hasAudio).sort((a, b) => (b.height || 0) - (a.height || 0))[0];

        if (!format) throw new Error('No suitable format found');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(url, { format }).pipe(res);

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).send('Download failed');
    }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
