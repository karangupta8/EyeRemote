import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StatusIndicator } from "./StatusIndicator";

interface VideoPlayerProps {
  url: string;
  isWatching: boolean;
  isDetectionEnabled: boolean;
}

export interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
}

const getEmbedUrl = (url: string): { type: 'youtube' | 'vimeo' | 'video'; embedUrl: string } => {
  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?enablejsapi=1`
    };
  }

  // Vimeo patterns
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }

  // Assume it's a direct video URL
  return {
    type: 'video',
    embedUrl: url
  };
};

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ url, isWatching, isDetectionEnabled }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [embedInfo, setEmbedInfo] = useState<ReturnType<typeof getEmbedUrl> | null>(null);

    useEffect(() => {
      if (url) {
        setEmbedInfo(getEmbedUrl(url));
      }
    }, [url]);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (embedInfo?.type === 'video' && videoRef.current) {
          videoRef.current.play();
        } else if (embedInfo?.type === 'youtube' && iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } else if (embedInfo?.type === 'vimeo' && iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage('{"method":"play"}', '*');
        }
      },
      pause: () => {
        if (embedInfo?.type === 'video' && videoRef.current) {
          videoRef.current.pause();
        } else if (embedInfo?.type === 'youtube' && iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } else if (embedInfo?.type === 'vimeo' && iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', '*');
        }
      },
    }));

    if (!embedInfo) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-5xl mx-auto"
      >
        <div className="absolute -top-12 right-0 z-10">
          <StatusIndicator isWatching={isWatching} isDetectionEnabled={isDetectionEnabled} />
        </div>
        
        <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border shadow-glow">
          {embedInfo.type === 'video' ? (
            <video
              ref={videoRef}
              src={embedInfo.embedUrl}
              controls
              className="w-full h-full"
            />
          ) : (
            <iframe
              ref={iframeRef}
              src={embedInfo.embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </motion.div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
