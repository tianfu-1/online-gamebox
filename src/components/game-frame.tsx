"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface GameFrameProps {
  src: string;
  title: string;
}

export function GameFrame({ src, title }: GameFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const container = iframe.parentElement;

    if (!document.fullscreenElement && container?.requestFullscreen) {
      await container.requestFullscreen();
      setIsFullscreen(true);
      return;
    }

    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-inner shadow-black/40">
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          className="aspect-[16/9] w-full"
          loading="lazy"
          allowFullScreen
          allow="fullscreen; gamepad; autoplay; encrypted-media; clipboard-read; clipboard-write; screen-wake-lock; xr-spatial-tracking"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-top-navigation-by-user-activation"
        />
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/20"
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
          <a
            href={src}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/20"
          >
            Open in new tab
          </a>
        </div>
      </div>
      <p className="text-sm text-slate-400">
        If the game struggles to load, select the Open in new tab button to launch it directly from Cloudflare R2 or the partner host.
      </p>
    </div>
  );
}
