import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  ArrowCounterClockwise,
  ArrowClockwise,
  SpeakerHigh,
  SpeakerLow,
  SpeakerX,
  DownloadSimple,
  ShareNetwork,
  Check,
  MusicNotes,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import type { MediaItem } from "../types";
import { formatDate } from "../utils/formatters";

export interface AudioPlayerProps {
  item: MediaItem;
}

export function AudioPlayer({ item }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isDirectAudio =
    !!item.externalUrl &&
    (item.type === "AUDIO" ||
      /\.(mp3|m4a|wav|aac|ogg)(\?.*)?$/i.test(item.externalUrl) ||
      item.externalUrl.includes("/uploads/") ||
      item.externalUrl.startsWith("/"));

  const isSoundCloud = !!item.externalUrl && item.externalUrl.includes("soundcloud.com");

  // Reset state when item changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [item.slug, playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("Audio play error:", err);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration || 9999, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextRate = speeds[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume === 0) {
        audioRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = Math.floor(secs % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-sermon-player-card">
      {/* Background artwork blur effect */}
      <div
        className="audio-player-bg-art"
        style={{ backgroundImage: `url(${item.image || "/images/0.jpg"})` }}
        aria-hidden="true"
      />

      {/* Hidden audio element */}
      {item.externalUrl && isDirectAudio && (
        <audio
          ref={audioRef}
          src={item.externalUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          preload="metadata"
        />
      )}

      <div className="audio-player-content">
        {/* Top Track Info Row */}
        <div className="audio-track-header">
          <div className="audio-artwork-wrapper">
            <img
              src={item.image || "/images/0.jpg"}
              alt={item.title}
              className={`audio-artwork-img ${isPlaying ? "playing" : ""}`}
            />
            {isPlaying && (
              <div className="audio-equalizer-bars" aria-label="Audio playing">
                <span className="bar bar-1" />
                <span className="bar bar-2" />
                <span className="bar bar-3" />
                <span className="bar bar-4" />
              </div>
            )}
          </div>

          <div className="audio-meta-info">
            <div className="audio-meta-pills">
              <span className="audio-tag-badge">
                <MusicNotes size={12} weight="bold" /> {item.category || "Audio Sermon"}
              </span>
              {item.publishedAt && (
                <span className="audio-date-badge">{formatDate(item.publishedAt)}</span>
              )}
            </div>
            <h2 className="audio-track-title">{item.title}</h2>
            <p className="audio-speaker-name">{item.speaker || "PCFS Apostolic Ministry"}</p>
          </div>
        </div>

        {/* SoundCloud fallback or external stream notice */}
        {isSoundCloud ? (
          <div className="soundcloud-embed-container">
            <iframe
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                item.externalUrl!
              )}&color=%230b31d8&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
              title={item.title}
            />
          </div>
        ) : item.externalUrl && isDirectAudio ? (
          /* Custom Church Audio Scrubber & Controls */
          <div className="audio-playback-controls">
            {/* Scrubber Progress Bar */}
            <div className="audio-progress-section">
              <div
                ref={progressBarRef}
                className="audio-scrubber-track"
                onClick={handleSeek}
                role="progressbar"
                aria-valuenow={currentTime}
                aria-valuemin={0}
                aria-valuemax={duration || 100}
                tabIndex={0}
              >
                <div
                  className="audio-scrubber-fill"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="audio-scrubber-thumb"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>
              <div className="audio-time-row">
                <span className="audio-time-current">{formatTime(currentTime)}</span>
                <span className="audio-time-total">
                  {duration > 0 ? formatTime(duration) : isPlaying ? "Streaming..." : "--:--"}
                </span>
              </div>
            </div>

            {/* Central Controls: Skip, Play/Pause, Volume, Speed */}
            <div className="audio-buttons-row">
              {/* Skip Back 15s */}
              <button
                type="button"
                className="audio-action-btn secondary"
                onClick={() => skipSeconds(-15)}
                title="Rewind 15 seconds"
                aria-label="Rewind 15 seconds"
              >
                <ArrowCounterClockwise size={20} weight="bold" />
                <span className="sub-seconds">15</span>
              </button>

              {/* Main Play / Pause Button */}
              <button
                type="button"
                className={`audio-play-master-btn ${isPlaying ? "playing" : ""}`}
                onClick={togglePlay}
                title={isPlaying ? "Pause Sermon" : "Play Sermon"}
                aria-label={isPlaying ? "Pause Sermon" : "Play Sermon"}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="audio-spinner" />
                ) : isPlaying ? (
                  <Pause size={28} weight="fill" />
                ) : (
                  <Play size={28} weight="fill" style={{ marginLeft: "3px" }} />
                )}
              </button>

              {/* Skip Forward 15s */}
              <button
                type="button"
                className="audio-action-btn secondary"
                onClick={() => skipSeconds(15)}
                title="Forward 15 seconds"
                aria-label="Forward 15 seconds"
              >
                <ArrowClockwise size={20} weight="bold" />
                <span className="sub-seconds">15</span>
              </button>

              {/* Playback Speed Cycling */}
              <button
                type="button"
                className="audio-speed-btn"
                onClick={cycleSpeed}
                title="Change playback speed"
                aria-label="Change playback speed"
              >
                {playbackRate}x
              </button>

              {/* Volume Slider */}
              <div className="audio-volume-cluster">
                <button
                  type="button"
                  className="audio-volume-icon-btn"
                  onClick={toggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerX size={20} />
                  ) : volume < 0.5 ? (
                    <SpeakerLow size={20} />
                  ) : (
                    <SpeakerHigh size={20} />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="audio-volume-slider"
                  aria-label="Volume level"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="audio-link-fallback-box">
            <p className="fallback-note">
              This audio teaching is hosted externally. You can listen or download directly:
            </p>
            {item.externalUrl ? (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="button primary audio-external-open-btn"
              >
                <ArrowSquareOut size={18} /> Open Audio on Streaming Platform
              </a>
            ) : (
              <p className="notice">Audio stream pending upload by media ministry.</p>
            )}
          </div>
        )}

        {/* Bottom Utility Bar: Direct Download, Share, External Link */}
        <div className="audio-player-footer-tools">
          <div className="footer-tools-left">
            {item.externalUrl && (
              <a
                href={item.externalUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="audio-tool-link download"
                title="Download audio recording (MP3)"
              >
                <DownloadSimple size={18} weight="bold" />
                <span>Download Audio</span>
              </a>
            )}
            {item.externalUrl && !isDirectAudio && (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="audio-tool-link external"
                title="Open source audio link"
              >
                <ArrowSquareOut size={18} />
                <span>Source Link</span>
              </a>
            )}
          </div>

          <button
            type="button"
            className="audio-tool-link share"
            onClick={handleShare}
            title="Share this teaching"
          >
            {copied ? (
              <>
                <Check size={18} weight="bold" style={{ color: "#10b981" }} />
                <span style={{ color: "#10b981" }}>Link Copied!</span>
              </>
            ) : (
              <>
                <ShareNetwork size={18} />
                <span>Share Sermon</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
