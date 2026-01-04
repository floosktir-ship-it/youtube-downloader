import { useState } from 'react';
import axios from 'axios';
import { Download, Youtube, Play, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import './App.css';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  quality: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetInfo = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      const response = await axios.get(`${baseUrl}/api/info?url=${encodeURIComponent(url)}`);
      setVideoInfo(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch video info. Try another link.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: string) => {
    const s = parseInt(seconds);
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const downloadUrl = (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '') +
    `/api/download?url=${encodeURIComponent(url)}`;

  return (
    <div className="app-container">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="glass-card">
        <div className="logo-section">
          <div className="logo-icon">
            <Youtube size={40} color="white" fill="white" />
          </div>
          <h1>StreamCraft 720</h1>
          <p className="subtitle">High-fidelity YouTube Downloader</p>
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder="Paste YouTube Link Here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGetInfo()}
          />
        </div>

        {error && <div className="error-msg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <AlertCircle size={16} /> {error}
        </div>}

        {!videoInfo ? (
          <button
            className="main-button"
            onClick={handleGetInfo}
            disabled={loading || !url}
          >
            {loading ? <div className="loading-spinner"></div> : (
              <>
                <Play size={20} fill="white" /> Get Download Link
              </>
            )}
          </button>
        ) : (
          <div className="video-info">
            <div className="thumbnail-container">
              <img src={videoInfo.thumbnail} alt="Thumbnail" />
            </div>
            <h2 className="video-title">{videoInfo.title}</h2>

            <div className="meta-info">
              <div className="meta-item">
                <Clock size={16} /> {formatDuration(videoInfo.duration)}
              </div>
              <div className="meta-item">
                <ShieldCheck size={16} /> {videoInfo.quality} HD
              </div>
            </div>

            <a href={downloadUrl} className="download-link">
              <button className="main-button">
                <Download size={20} /> Download Now
              </button>
            </a>

            <button
              style={{ marginTop: '1rem', background: 'transparent', boxShadow: 'none', border: '1px solid var(--glass-border)', display: 'flex' }}
              className="main-button"
              onClick={() => { setVideoInfo(null); setUrl(''); }}
            >
              Convert Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
