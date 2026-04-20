"use client";

import { useState, useEffect, useRef, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlayIcon, ChevronRightIcon } from "@/components/icons";
import { SubtitleWord, Subtitle } from "@/types/subtitles";
import { Video } from "@/types/catalog";
import { exportSubtitles, exportVocabulary } from "@/lib/export";
import { useSavedWords, useSettings } from "@/hooks/useStore";
import { saveWord, unsaveWord, logActivity, savePhrase } from "@/lib/storage";

// YouTube IFrame API types
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
}

interface YTPlayerConfig {
  videoId: string;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { target: YTPlayer; data: number }) => void;
  };
  playerVars?: {
    enablejsapi?: number;
    rel?: number;
    modestbranding?: number;
  };
}

interface YT {
  Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

function ShortRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/70">{label}</span>
      <div className="flex gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="rounded bg-white/10 px-2 py-1 text-sm text-white"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

export default function PlayerPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = use(params);
  const router = useRouter();
  const [settings] = useSettings();
  const [activeTab, setActiveTab] = useState<"text" | "words">("text");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoPause, setAutoPause] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [fuzzyMode, setFuzzyMode] = useState(false);
  const [blurTranslation, setBlurTranslation] = useState(false);
  const [loopCurrent, setLoopCurrent] = useState(false);
  const [overlayCaption, setOverlayCaption] = useState(false);
  const [subtitleFontScale, setSubtitleFontScale] = useState(1);
  const [subtitleSearch, setSubtitleSearch] = useState("");
  const [phraseToast, setPhraseToast] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<SubtitleWord | null>(null);
  const savedWordsFull = useSavedWords();
  const savedWords = useMemo(
    () => new Set(savedWordsFull.map((w) => w.word.toLowerCase())),
    [savedWordsFull]
  );
  const stageByWord = useMemo(() => {
    const m = new Map<string, "known" | "learning" | "uncommon" | "ignore">();
    savedWordsFull.forEach((w) => m.set(w.word.toLowerCase(), w.stage || "learning"));
    return m;
  }, [savedWordsFull]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showVideoInfo, setShowVideoInfo] = useState(false);
  const [studyStartTime] = useState(Date.now());
  const [studyTime, setStudyTime] = useState(0);
  const [viewedSubtitles, setViewedSubtitles] = useState<Set<number>>(new Set());
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState<SubtitleWord | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [subtitlesLoading, setSubtitlesLoading] = useState(true);
  const [subtitlesError, setSubtitlesError] = useState<string | null>(null);

  const playerRef = useRef<YTPlayer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const subtitleListRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const helpPanelRef = useRef<HTMLDivElement>(null);
  const videoInfoPanelRef = useRef<HTMLDivElement>(null);
  const dictionaryModalRef = useRef<HTMLDivElement>(null);

  // Fetch video info from catalog API
  const [videoInfo, setVideoInfo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (!videoInfo) return;
    logActivity({
      type: "video",
      title: videoInfo.title,
      description: `观看 ${videoInfo.channelName}`,
      link: `/player/${videoInfo.id}`,
      thumbnail: videoInfo.thumbnail,
      metadata: { duration: videoInfo.duration },
    });
  }, [videoInfo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog/videos");
        if (!res.ok) return;
        const { videos = [] }: { videos: Video[] } = await res.json();
        if (cancelled) return;
        const current = videos.find((v) => v.id === videoId) ?? null;
        setVideoInfo(current);
        setRelatedVideos(current ? videos.filter((v) => v.channelId === current.channelId) : []);
      } catch {
        // Silent fail — player still works without catalog metadata
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const videoTitle = videoInfo?.title || "视频播放器";
  const channelName = videoInfo?.channelName || "";

  // Find current video index in related videos
  const currentVideoIndex = relatedVideos.findIndex((v) => v.id === videoId);
  const previousVideo = currentVideoIndex > 0 ? relatedVideos[currentVideoIndex - 1] : null;
  const nextVideo = currentVideoIndex < relatedVideos.length - 1 ? relatedVideos[currentVideoIndex + 1] : null;

  // Find current subtitle
  const currentSubtitle = subtitles.find(
    (sub) => currentTime >= sub.startTime && currentTime < sub.endTime
  );

  // Fetch subtitles from API
  useEffect(() => {
    const fetchSubtitles = async () => {
      try {
        setSubtitlesLoading(true);
        setSubtitlesError(null);
        const response = await fetch(`/api/subtitles/${videoId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch subtitles: ${response.statusText}`);
        }

        const data = await response.json();
        setSubtitles(data.subtitles);

        // 后台翻译字幕
        translateSubtitlesInBackground(data.subtitles);
      } catch (error) {
        console.error("Error fetching subtitles:", error);
        setSubtitlesError(error instanceof Error ? error.message : "Failed to load subtitles");
      } finally {
        setSubtitlesLoading(false);
      }
    };

    fetchSubtitles();
  }, [videoId]);

  // 后台批量翻译字幕
  const translateSubtitlesInBackground = async (subs: Subtitle[]) => {
    const batchSize = 10;

    for (let i = 0; i < subs.length; i += batchSize) {
      const batch = subs.slice(i, i + batchSize);

      try {
        const translations = await Promise.all(
          batch.map(sub =>
            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: sub.originalText, targetLang: "zh-CN" }),
            }).then(res => res.json()).then(data => data.translation).catch(() => "")
          )
        );

        setSubtitles(prev => {
          const updated = [...prev];
          batch.forEach((sub, idx) => {
            const index = updated.findIndex(s => s.id === sub.id);
            if (index !== -1) {
              updated[index] = { ...updated[index], translatedText: translations[idx] || "" };
            }
          });
          return updated;
        });

        // 延迟避免 API 限流
        if (i + batchSize < subs.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error("Translation batch error:", error);
      }
    }
  };

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Load the API script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player("youtube-player", {
      videoId: videoId,
      playerVars: {
        enablejsapi: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: (event) => {
          setPlayerReady(true);
          event.target.setPlaybackRate(playbackSpeed);
          // Get video duration
          const duration = event.target.getDuration();
          setVideoDuration(duration);
        },
        onStateChange: (event) => {
          const isPlayerPlaying = event.data === window.YT.PlayerState.PLAYING;
          setIsPlaying(isPlayerPlaying);
        },
      },
    });
  };

  // Sync current time with YouTube player
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    const syncInterval = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 100);

    return () => clearInterval(syncInterval);
  }, [playerReady]);

  // Update playback speed when changed
  useEffect(() => {
    if (playerReady && playerRef.current) {
      playerRef.current.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed, playerReady]);

  // Sync initial values from settings once on mount
  const settingsSyncedRef = useRef(false);
  useEffect(() => {
    if (settingsSyncedRef.current) return;
    settingsSyncedRef.current = true;
    setAutoPause(settings.autoPause);
    setFuzzyMode(settings.hideSubtitles);
    setShowTranslation(
      settings.showMachineTranslation || settings.showHumanTranslation
    );
  }, [settings]);

  // Auto-pause or loop at subtitle end
  useEffect(() => {
    if (!currentSubtitle || !isPlaying || !playerReady || !playerRef.current) return;
    if (currentTime >= currentSubtitle.endTime - 0.1) {
      if (loopCurrent) {
        playerRef.current.seekTo(currentSubtitle.startTime, true);
      } else if (autoPause) {
        playerRef.current.pauseVideo();
      }
    }
  }, [currentTime, currentSubtitle, autoPause, loopCurrent, isPlaying, playerReady]);

  // Auto-scroll subtitle list to current subtitle
  useEffect(() => {
    if (currentSubtitle && subtitleListRef.current) {
      const activeElement = subtitleListRef.current.querySelector(
        `[data-subtitle-id="${currentSubtitle.id}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
      // Track viewed subtitles
      setViewedSubtitles((prev) => new Set(prev).add(currentSubtitle.id));
    }
  }, [currentSubtitle]);

  // Track study time
  useEffect(() => {
    const interval = setInterval(() => {
      setStudyTime(Math.floor((Date.now() - studyStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [studyStartTime]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (helpPanelRef.current && !helpPanelRef.current.contains(event.target as Node)) {
        setShowKeyboardHelp(false);
      }
      if (videoInfoPanelRef.current && !videoInfoPanelRef.current.contains(event.target as Node)) {
        setShowVideoInfo(false);
      }
      if (dictionaryModalRef.current && !dictionaryModalRef.current.contains(event.target as Node)) {
        setShowDictionaryModal(false);
      }
    };

    if (showExportMenu || showKeyboardHelp || showVideoInfo || showDictionaryModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportMenu, showKeyboardHelp, showVideoInfo, showDictionaryModal]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Ctrl/Cmd + C: copy current subtitle
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
        if (currentSubtitle && typeof navigator.clipboard !== "undefined") {
          e.preventDefault();
          navigator.clipboard.writeText(currentSubtitle.originalText).catch(() => {});
        }
        return;
      }

      // Prevent default for certain keys
      if ([" ", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        // Play/Pause
        case " ":
        case "k":
        case "K":
        case "w":
        case "W":
          handlePlayPause();
          break;

        // Skip backward/forward
        case "ArrowLeft":
          handleSkipBackward();
          break;
        case "ArrowRight":
          handleSkipForward();
          break;
        case "j":
        case "J":
          if (playerReady && playerRef.current) {
            playerRef.current.seekTo(Math.max(0, currentTime - 10), true);
          }
          break;
        case "l":
        case "L":
          if (playerReady && playerRef.current) {
            playerRef.current.seekTo(currentTime + 10, true);
          }
          break;

        // Previous subtitle (A or P)
        case "a":
        case "A":
        case "p":
        case "P":
          handlePreviousSubtitle();
          break;

        // Replay current subtitle (S)
        case "s":
        case "S":
          if (currentSubtitle) handleSkipToSubtitle(currentSubtitle);
          break;

        // Next subtitle (D or N)
        case "d":
        case "D":
        case "n":
        case "N":
          handleNextSubtitle();
          break;

        // Toggle auto-pause (Q)
        case "q":
        case "Q":
          setAutoPause((prev) => !prev);
          break;

        // Toggle fuzzy subtitle (E)
        case "e":
        case "E":
          setFuzzyMode((prev) => !prev);
          break;

        // Save current subtitle as phrase (R)
        case "r":
        case "R":
          if (currentSubtitle && videoId) {
            savePhrase({
              text: currentSubtitle.originalText,
              translation: currentSubtitle.translatedText || "",
              source: videoTitle,
              videoId,
              subtitleId: currentSubtitle.id,
              startTime: currentSubtitle.startTime,
            });
            setPhraseToast(`已保存: ${currentSubtitle.originalText.slice(0, 32)}...`);
            setTimeout(() => setPhraseToast(null), 2000);
          }
          break;

        // Speed control
        case ",":
        case "<":
          setPlaybackSpeed((prev) => Math.max(0.25, prev - 0.25));
          break;
        case ".":
        case ">":
          setPlaybackSpeed((prev) => Math.min(2, prev + 0.25));
          break;

        // Toggle translation
        case "t":
        case "T":
          setShowTranslation((prev) => !prev);
          break;

        // Switch tabs
        case "Tab":
          setActiveTab((prev) => (prev === "text" ? "words" : "text"));
          break;

        // Close/Escape
        case "Escape":
          setSelectedWord(null);
          setShowExportMenu(false);
          setShowKeyboardHelp(false);
          setShowDictionaryModal(false);
          break;

        // Show keyboard help
        case "?":
          setShowKeyboardHelp(true);
          break;

        // Jump to percentage (1-9)
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          if (playerReady && playerRef.current && videoDuration > 0) {
            const percentage = parseInt(e.key) / 10;
            const seekTime = videoDuration * percentage;
            playerRef.current.seekTo(seekTime, true);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [playerReady, currentTime, currentSubtitle, videoDuration, isPlaying, activeTab]);

  const handlePlayPause = () => {
    if (!playerReady || !playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const speakWord = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const handleWordClick = async (word: SubtitleWord) => {
    setDictionaryWord({ ...word, translation: "加载中...", definition: "加载中..." });
    setShowDictionaryModal(true);
    if (settings.speakOnClick) speakWord(word.text);

    try {
      const [translationRes, definitionRes] = await Promise.all([
        fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: word.text, targetLang: "zh-CN" }),
        }),
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.text.toLowerCase()}`),
      ]);

      let translation = word.translation || "";
      let definition = word.definition || "";

      if (translationRes.ok) {
        const translationData = await translationRes.json();
        translation = translationData.translation || "";
      }

      if (definitionRes.ok) {
        const definitionData = await definitionRes.json();
        if (definitionData && definitionData[0]?.meanings?.[0]?.definitions?.[0]) {
          definition = definitionData[0].meanings[0].definitions[0].definition;
        }
      }

      setDictionaryWord({
        ...word,
        translation: translation || "暂无翻译",
        definition: definition || "暂无释义",
      });
    } catch (error) {
      console.error("Error fetching word data:", error);
      setDictionaryWord({
        ...word,
        translation: "获取失败",
        definition: "获取失败",
      });
    }
  };

  const getWordDifficultyStyle = (word: SubtitleWord) => {
    const key = word.text.toLowerCase();
    const isSaved = word.saved || savedWords.has(key);
    const stage = stageByWord.get(key);
    const base = "cursor-pointer rounded px-1 transition-all";

    // Stage-based colored underline (takes precedence when enabled and saved)
    if (isSaved && settings.colorUnderlines && stage) {
      const stageStyles: Record<string, string> = {
        known: "underline decoration-white decoration-2 underline-offset-4 hover:bg-white/10",
        learning:
          "underline decoration-orange-400 decoration-2 underline-offset-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-200",
        uncommon:
          "underline decoration-white/40 decoration-dotted underline-offset-4 hover:bg-white/5 text-white/60",
        ignore: "text-white/40 hover:text-white/60",
      };
      return `${base} ${stageStyles[stage] || ""}`;
    }

    if (!word.difficulty) {
      return isSaved ? `${base} bg-secondary/30 hover:bg-secondary/50` : "";
    }

    const difficultyColors = {
      beginner: "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
      intermediate: "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30",
      advanced: "bg-red-500/20 text-red-300 hover:bg-red-500/30",
    };
    return `${base} ${difficultyColors[word.difficulty]}`;
  };

  const renderSubtitleText = (subtitle: Subtitle) => {
    if (!subtitle.words || subtitle.words.length === 0) {
      return <span>{subtitle.originalText}</span>;
    }

    return (
      <>
        {subtitle.words.map((word, index) => {
          const style = getWordDifficultyStyle(word);
          if (style) {
            return (
              <span
                key={index}
                className={style}
                onClick={(e) => {
                  e.stopPropagation();
                  handleWordClick(word);
                }}
              >
                {word.text}
              </span>
            );
          }
          return <span key={index}>{word.text}</span>;
        })}
      </>
    );
  };

  const handleSaveWord = (word: SubtitleWord) => {
    const key = word.text.toLowerCase();
    if (savedWords.has(key)) {
      unsaveWord(word.text);
      return;
    }
    saveWord({
      word: word.text,
      translation: word.translation || "",
      definition: word.definition || "",
      difficulty: word.difficulty || "intermediate",
      examples: currentSubtitle
        ? [
            {
              text: currentSubtitle.originalText,
              translation: currentSubtitle.translatedText || "",
              source: videoTitle,
            },
          ]
        : [],
    });
  };

  const handleSkipToSubtitle = (subtitle: Subtitle) => {
    if (!playerReady || !playerRef.current) return;

    playerRef.current.seekTo(subtitle.startTime, true);
    playerRef.current.playVideo();
  };

  const handleSkipBackward = () => {
    if (!playerReady || !playerRef.current) return;

    const newTime = Math.max(0, currentTime - 5);
    playerRef.current.seekTo(newTime, true);
  };

  const handleSkipForward = () => {
    if (!playerReady || !playerRef.current) return;

    playerRef.current.seekTo(currentTime + 5, true);
  };

  const handleNextSubtitle = () => {
    if (!playerReady || !playerRef.current) return;

    const currentIndex = subtitles.findIndex(
      (sub) => currentTime >= sub.startTime && currentTime < sub.endTime
    );

    if (currentIndex !== -1 && currentIndex < subtitles.length - 1) {
      handleSkipToSubtitle(subtitles[currentIndex + 1]);
    } else if (currentIndex === -1) {
      // If not in any subtitle, find the next one
      const nextSub = subtitles.find((sub) => sub.startTime > currentTime);
      if (nextSub) {
        handleSkipToSubtitle(nextSub);
      }
    }
  };

  const handlePreviousSubtitle = () => {
    if (!playerReady || !playerRef.current) return;

    const currentIndex = subtitles.findIndex(
      (sub) => currentTime >= sub.startTime && currentTime < sub.endTime
    );

    if (currentIndex > 0) {
      handleSkipToSubtitle(subtitles[currentIndex - 1]);
    } else if (currentIndex === -1) {
      // If not in any subtitle, find the previous one
      const prevSub = [...subtitles]
        .reverse()
        .find((sub) => sub.endTime < currentTime);
      if (prevSub) {
        handleSkipToSubtitle(prevSub);
      }
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerReady || !playerRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * videoDuration;

    playerRef.current.seekTo(seekTime, true);
  };

  const handleProgressBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = hoverX / rect.width;
    const time = percentage * videoDuration;

    setHoverTime(time);
  };

  const handleProgressBarLeave = () => {
    setHoverTime(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatStudyTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate vocabulary statistics
  const allWords = subtitles.flatMap(s => s.words || []);
  const savedWordsCount = savedWords.size;
  const beginnerWords = allWords.filter(w => w.difficulty === "beginner" && (w.saved || savedWords.has(w.text.toLowerCase()))).length;
  const intermediateWords = allWords.filter(w => w.difficulty === "intermediate" && (w.saved || savedWords.has(w.text.toLowerCase()))).length;
  const advancedWords = allWords.filter(w => w.difficulty === "advanced" && (w.saved || savedWords.has(w.text.toLowerCase()))).length;

  const handleExportSubtitles = (format: "csv" | "json" | "srt" | "vtt") => {
    exportSubtitles(subtitles, format, videoTitle);
    setShowExportMenu(false);
  };

  const handleExportVocabulary = (format: "csv" | "json") => {
    const vocabulary = subtitles.flatMap(s => s.words || []).map(word => ({
      word: word.text,
      translation: word.translation || "",
      difficulty: word.difficulty || "intermediate",
      definition: word.definition || "",
      saved: word.saved || savedWords.has(word.text.toLowerCase()),
    }));
    exportVocabulary(vocabulary, format, videoTitle);
    setShowExportMenu(false);
  };

  const handlePreviousVideo = () => {
    if (previousVideo) {
      router.push(`/player/${previousVideo.id}`);
    }
  };

  const handleNextVideo = () => {
    if (nextVideo) {
      router.push(`/player/${nextVideo.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Breadcrumb */}
      <section className="w-full border-b border-white/10 py-4">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Link href="/catalog" className="hover:text-white">
              内容目录
            </Link>
            <span>/</span>
            {channelName && (
              <>
                <span className="hover:text-white">{channelName}</span>
                <span>/</span>
              </>
            )}
            <span className="text-white">{videoTitle}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Video Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{videoTitle}</h1>
          {channelName && (
            <p className="mt-2 text-white/60">{channelName}</p>
          )}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-card p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousVideo}
              disabled={!previousVideo}
              className="rounded-lg border border-white/20 p-2 text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              title={previousVideo ? `上一个: ${previousVideo.title}` : "没有上一个视频"}
            >
              <span className="text-lg">◀</span>
            </button>
            <button
              onClick={handleNextVideo}
              disabled={!nextVideo}
              className="rounded-lg border border-white/20 p-2 text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              title={nextVideo ? `下一个: ${nextVideo.title}` : "没有下一个视频"}
            >
              <span className="text-lg">▶</span>
            </button>
            {relatedVideos.length > 1 && (
              <span className="ml-2 text-sm text-white/60">
                {currentVideoIndex + 1} / {relatedVideos.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVideoInfo(true)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
              title="更多信息"
            >
              更多信息
            </button>
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
                title="导出"
              >
                导出
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-white/10 bg-card p-2 shadow-xl">
                  <div className="mb-2 border-b border-white/10 pb-2">
                    <div className="px-3 py-1 text-xs font-semibold text-white/60">
                      导出字幕
                    </div>
                    <button
                      onClick={() => handleExportSubtitles("csv")}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition-all hover:bg-white/10"
                    >
                      字幕 (CSV)
                    </button>
                    <button
                      onClick={() => handleExportSubtitles("json")}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition-all hover:bg-white/10"
                    >
                      字幕 (JSON)
                    </button>
                    <button
                      onClick={() => handleExportSubtitles("srt")}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition-all hover:bg-white/10"
                    >
                      字幕 (SRT)
                    </button>
                    <button
                      onClick={() => handleExportSubtitles("vtt")}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition-all hover:bg-white/10"
                    >
                      字幕 (WebVTT)
                    </button>
                  </div>
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-white/60">
                      导出词汇
                    </div>
                    <button
                      onClick={() => handleExportVocabulary("csv")}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition-all hover:bg-white/10"
                    >
                      词汇表 (CSV)
                    </button>
                    <button
                      onClick={() => handleExportVocabulary("json")}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition-all hover:bg-white/10"
                    >
                      词汇表 (JSON)
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              className="rounded-lg border border-white/20 p-2 text-white transition-all hover:bg-white/10"
              title="全屏"
            >
              <span className="text-lg">⛶</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left: Video Player */}
          <div>
            {/* Video Player */}
            <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
              {/* YouTube Player Container */}
              <div id="youtube-player" className="absolute inset-0 h-full w-full" />

              {/* Subtitle overlay */}
              {overlayCaption && currentSubtitle && (
                <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 px-8 text-center">
                  <div
                    className={`pointer-events-auto max-w-[90%] rounded-lg bg-black/70 px-4 py-2 text-white shadow-lg backdrop-blur-sm transition-all ${
                      fuzzyMode ? "select-none blur-sm hover:blur-0" : ""
                    }`}
                    style={{ fontSize: `${1.4 * subtitleFontScale}rem`, lineHeight: 1.4 }}
                    onClick={() => fuzzyMode && setFuzzyMode(false)}
                  >
                    {renderSubtitleText(currentSubtitle)}
                  </div>
                  {showTranslation && currentSubtitle.translatedText && (
                    <div
                      className={`pointer-events-auto max-w-[90%] rounded-lg bg-black/60 px-3 py-1 text-white/90 shadow backdrop-blur-sm ${
                        blurTranslation ? "select-none blur-sm hover:blur-0" : ""
                      }`}
                      style={{ fontSize: `${1.0 * subtitleFontScale}rem` }}
                    >
                      {currentSubtitle.translatedText}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Progress Bar */}
            {playerReady && videoDuration > 0 && (
              <div className="mb-4 rounded-xl border border-white/10 bg-card p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-white/60">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(videoDuration)}</span>
                </div>

                {/* Progress Bar Container */}
                <div
                  ref={progressBarRef}
                  onClick={handleProgressBarClick}
                  onMouseMove={handleProgressBarHover}
                  onMouseLeave={handleProgressBarLeave}
                  className="group relative h-12 cursor-pointer rounded-lg bg-white/5 transition-all hover:bg-white/10"
                >
                  {/* Subtitle Segments */}
                  {subtitles.map((subtitle) => {
                    const startPercent = (subtitle.startTime / videoDuration) * 100;
                    const widthPercent = ((subtitle.endTime - subtitle.startTime) / videoDuration) * 100;
                    const isActive = currentSubtitle?.id === subtitle.id;

                    return (
                      <div
                        key={subtitle.id}
                        className={`absolute top-0 h-full transition-all ${
                          isActive
                            ? "bg-secondary/60 ring-2 ring-secondary"
                            : "bg-white/20 hover:bg-white/30"
                        }`}
                        style={{
                          left: `${startPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        title={`${subtitle.startTime.toFixed(1)}s - ${subtitle.endTime.toFixed(1)}s: ${subtitle.originalText}`}
                      />
                    );
                  })}

                  {/* Current Time Indicator */}
                  <div
                    className="absolute top-0 h-full w-1 bg-secondary shadow-lg shadow-secondary/50"
                    style={{
                      left: `${(currentTime / videoDuration) * 100}%`,
                    }}
                  />

                  {/* Hover Time Preview */}
                  {hoverTime !== null && (
                    <div
                      className="absolute -top-8 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs text-white"
                      style={{
                        left: `${(hoverTime / videoDuration) * 100}%`,
                      }}
                    >
                      {formatTime(hoverTime)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Subtitle Display */}
            <div className="mb-4 rounded-2xl border border-white/10 bg-card p-6">
              {currentSubtitle ? (
                <>
                  {/* Original Text */}
                  <div className="mb-4 text-center">
                    <p
                      className={`text-2xl leading-relaxed text-white transition-all ${
                        fuzzyMode ? "select-none blur-sm hover:blur-0" : ""
                      }`}
                      onClick={() => {
                        if (fuzzyMode) setFuzzyMode(false);
                      }}
                    >
                      {renderSubtitleText(currentSubtitle)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mb-4 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        if (typeof navigator.clipboard === "undefined") return;
                        navigator.clipboard
                          .writeText(currentSubtitle.originalText)
                          .then(() => {
                            setCopyToast("已复制");
                            setTimeout(() => setCopyToast(null), 1500);
                          })
                          .catch(() => {});
                      }}
                      title="复制字幕 (Ctrl+C)"
                      className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white transition-all hover:bg-white/10"
                    >
                      📋 复制
                    </button>
                    <button
                      onClick={() => {
                        if (!videoId) return;
                        savePhrase({
                          text: currentSubtitle.originalText,
                          translation: currentSubtitle.translatedText || "",
                          source: videoTitle,
                          videoId,
                          subtitleId: currentSubtitle.id,
                          startTime: currentSubtitle.startTime,
                        });
                        setPhraseToast(`已保存: ${currentSubtitle.originalText.slice(0, 32)}...`);
                        setTimeout(() => setPhraseToast(null), 2000);
                      }}
                      title="保存为短语 (R)"
                      className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white transition-all hover:bg-white/10"
                    >
                      ⭐ 保存短语
                    </button>
                    <button
                      onClick={() => setFuzzyMode((prev) => !prev)}
                      title="模糊字幕 (E)"
                      className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                        fuzzyMode
                          ? "border-secondary bg-secondary/20 text-secondary"
                          : "border-white/20 text-white hover:bg-white/10"
                      }`}
                    >
                      {fuzzyMode ? "👁️‍🗨️ 已模糊" : "👁️ 模糊"}
                    </button>
                  </div>

                  {/* Translation */}
                  {showTranslation && (
                    <div className="border-t border-white/10 pt-4 text-center">
                      <p className="text-lg text-white/70">
                        {currentSubtitle.translatedText}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-white/40">
                  等待字幕...
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="rounded-2xl border border-white/10 bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Play Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSkipBackward}
                    disabled={!playerReady}
                    className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ⏪ -5s
                  </button>
                  <button
                    onClick={handlePlayPause}
                    disabled={!playerReady}
                    className="rounded-lg bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPlaying ? "⏸ 暂停" : "▶ 播放"}
                  </button>
                  <button
                    onClick={handleSkipForward}
                    disabled={!playerReady}
                    className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ⏩ +5s
                  </button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">速度:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
                </div>

                {/* Settings Toggles */}
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoPause}
                      onChange={(e) => setAutoPause(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-white/80">自动暂停</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showTranslation}
                      onChange={(e) => setShowTranslation(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-white/80">显示翻译</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={loopCurrent}
                      onChange={(e) => setLoopCurrent(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-white/80">循环当前句</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={overlayCaption}
                      onChange={(e) => setOverlayCaption(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-white/80">视频上字幕</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={blurTranslation}
                      onChange={(e) => setBlurTranslation(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-white/80">模糊翻译</span>
                  </label>
                </div>
              </div>

              {/* Caption size + PiP + quick actions */}
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
                <span className="text-xs text-white/60">字幕字号</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setSubtitleFontScale((s) => Math.max(0.6, +(s - 0.1).toFixed(2)))
                    }
                    className="rounded border border-white/20 px-2 py-0.5 text-xs text-white hover:bg-white/10"
                    title="缩小"
                  >
                    A-
                  </button>
                  <span className="w-10 text-center text-xs text-white/70">
                    {Math.round(subtitleFontScale * 100)}%
                  </span>
                  <button
                    onClick={() =>
                      setSubtitleFontScale((s) => Math.min(2.0, +(s + 0.1).toFixed(2)))
                    }
                    className="rounded border border-white/20 px-2 py-0.5 text-xs text-white hover:bg-white/10"
                    title="放大"
                  >
                    A+
                  </button>
                </div>
                <button
                  onClick={async () => {
                    const iframe = document.querySelector<HTMLIFrameElement>("#youtube-player iframe");
                    if (!iframe) return;
                    try {
                      type PiPWindow = Window & {
                        documentPictureInPicture?: {
                          requestWindow: (o?: { width?: number; height?: number }) => Promise<Window>;
                        };
                      };
                      const wp = window as unknown as PiPWindow;
                      if (wp.documentPictureInPicture) {
                        await wp.documentPictureInPicture.requestWindow({ width: 640, height: 360 });
                      } else {
                        iframe.requestFullscreen?.();
                      }
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white transition-all hover:bg-white/10"
                  title="画中画 / 全屏"
                >
                  ⧉ PiP
                </button>
                <button
                  onClick={() => {
                    const idx = subtitles.findIndex((s) => s.id === currentSubtitle?.id);
                    if (idx !== -1) handleSkipToSubtitle(subtitles[idx]);
                  }}
                  disabled={!currentSubtitle}
                  className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  title="循环一次"
                >
                  ↻ 重播
                </button>
              </div>
            </div>
          </div>

          {/* Right: Subtitle List */}
          <div>
            <div className="sticky top-20">
              {/* Subtitle List Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  字幕列表
                </h3>
                <span className="text-sm text-white/60">
                  {subtitles.length} 条
                </span>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  placeholder="搜索字幕内容..."
                  value={subtitleSearch}
                  onChange={(e) => setSubtitleSearch(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-card px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
                />
              </div>

              {/* Subtitle List */}
              <div
                className="max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto pr-2"
                ref={subtitleListRef}
              >
                {subtitlesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-secondary mx-auto"></div>
                      <p className="text-sm text-white/60">加载字幕中...</p>
                    </div>
                  </div>
                ) : subtitlesError ? (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
                    <p className="text-sm text-red-400">{subtitlesError}</p>
                  </div>
                ) : subtitles.length === 0 ? (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-sm text-white/60">暂无字幕数据</p>
                  </div>
                ) : (
                  subtitles
                    .filter((s) =>
                      subtitleSearch.trim()
                        ? s.originalText
                            .toLowerCase()
                            .includes(subtitleSearch.toLowerCase()) ||
                          (s.translatedText || "")
                            .toLowerCase()
                            .includes(subtitleSearch.toLowerCase())
                        : true
                    )
                    .map((subtitle) => (
                    <button
                      key={subtitle.id}
                      data-subtitle-id={subtitle.id}
                      onClick={() => handleSkipToSubtitle(subtitle)}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        currentSubtitle?.id === subtitle.id
                          ? "border-secondary bg-secondary/10"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-white/50">
                          {subtitle.startTime.toFixed(1)}s
                        </span>
                      </div>
                      <p className="mb-1 text-sm leading-relaxed text-white">
                        {renderSubtitleText(subtitle)}
                      </p>
                      {showTranslation && subtitle.translatedText && (
                        <p className="text-xs text-white/60">
                          {subtitle.translatedText}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Panel */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            ref={helpPanelRef}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-card p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              <span className="text-2xl">×</span>
            </button>

            {/* Title */}
            <h2 className="mb-6 text-2xl font-bold text-white">键盘快捷键</h2>

            {/* Shortcuts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Playback Control */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-secondary">播放控制</h3>
                <div className="space-y-2">
                  <ShortRow label="播放/暂停" keys={["空格", "K", "W"]} />
                  <ShortRow label="后退 5 秒" keys={["←"]} />
                  <ShortRow label="前进 5 秒" keys={["→"]} />
                  <ShortRow label="后退 10 秒" keys={["J"]} />
                  <ShortRow label="前进 10 秒" keys={["L"]} />
                </div>
              </div>

              {/* Subtitle Navigation */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-secondary">字幕导航</h3>
                <div className="space-y-2">
                  <ShortRow label="上一字幕" keys={["A", "P"]} />
                  <ShortRow label="重播当前字幕" keys={["S"]} />
                  <ShortRow label="下一字幕" keys={["D", "N"]} />
                  <ShortRow label="保存当前字幕为短语" keys={["R"]} />
                  <ShortRow label="复制字幕到剪贴板" keys={["Ctrl/⌘", "C"]} />
                </div>
              </div>

              {/* Speed Control */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-secondary">速度控制</h3>
                <div className="space-y-2">
                  <ShortRow label="减速 0.25x" keys={["<"]} />
                  <ShortRow label="加速 0.25x" keys={[">"]} />
                </div>
              </div>

              {/* Interface Toggle */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-secondary">界面切换</h3>
                <div className="space-y-2">
                  <ShortRow label="切换翻译" keys={["T"]} />
                  <ShortRow label="自动暂停开关" keys={["Q"]} />
                  <ShortRow label="模糊/显示字幕" keys={["E"]} />
                  <ShortRow label="切换标签" keys={["Tab"]} />
                  <ShortRow label="关闭弹窗" keys={["Esc"]} />
                </div>
              </div>

              {/* Quick Jump */}
              <div className="md:col-span-2">
                <h3 className="mb-3 text-lg font-semibold text-secondary">快速跳转</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">跳转到视频 10%-90% 位置</span>
                    <div className="flex gap-1">
                      <kbd className="rounded bg-white/10 px-2 py-1 text-sm text-white">1</kbd>
                      <span className="text-white/40">-</span>
                      <kbd className="rounded bg-white/10 px-2 py-1 text-sm text-white">9</kbd>
                    </div>
                  </div>
                  <ShortRow label="显示快捷键帮助" keys={["?"]} />
                </div>
              </div>
            </div>

            {/* Footer Tip */}
            <div className="mt-6 rounded-lg bg-secondary/10 p-4 text-center text-sm text-white/60">
              提示：在输入框中输入时，快捷键会自动禁用
            </div>
          </div>
        </div>
      )}

      {/* Video Info Panel */}
      {showVideoInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            ref={videoInfoPanelRef}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-card p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowVideoInfo(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              <span className="text-2xl">×</span>
            </button>

            {/* Title */}
            <h2 className="mb-6 text-2xl font-bold text-white">视频信息</h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Video Details */}
              <div className="md:col-span-2">
                <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-secondary">视频详情</h3>

                  <div className="mb-4">
                    <div className="mb-1 text-sm text-white/60">标题</div>
                    <div className="text-white">{videoTitle}</div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-1 text-sm text-white/60">描述</div>
                    <div className="text-sm leading-relaxed text-white/70">
                      这是一个语言学习视频，包含双语字幕和词汇标注。通过观看视频并学习字幕中的词汇，可以有效提升语言能力。
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="mb-1 text-sm text-white/60">时长</div>
                      <div className="text-white">{formatTime(videoDuration)}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-sm text-white/60">字幕数量</div>
                      <div className="text-white">{subtitles.length} 条</div>
                    </div>
                    <div>
                      <div className="mb-1 text-sm text-white/60">上传日期</div>
                      <div className="text-white">2024-01-15</div>
                    </div>
                    <div>
                      <div className="mb-1 text-sm text-white/60">观看次数</div>
                      <div className="text-white">1.2M</div>
                    </div>
                  </div>
                </div>

                {/* Channel Info */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-secondary">频道信息</h3>

                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20 text-2xl font-bold text-secondary">
                      {channelName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{channelName}</div>
                      <div className="text-sm text-white/60">500K 订阅者</div>
                    </div>
                  </div>

                  <div className="text-sm leading-relaxed text-white/70">
                    专注于语言学习内容的优质频道，提供多种语言的学习视频和教程。
                  </div>
                </div>
              </div>

              {/* Related Videos */}
              <div className="md:col-span-1">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-secondary">相关视频</h3>

                  <div className="space-y-3">
                    {relatedVideos.slice(0, 5).map((video) => (
                      <button
                        key={video.id}
                        onClick={() => {
                          setShowVideoInfo(false);
                          router.push(`/player/${video.id}`);
                        }}
                        className={`w-full rounded-lg border p-3 text-left transition-all ${
                          video.id === videoId
                            ? "border-secondary bg-secondary/10"
                            : "border-white/10 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="mb-1 text-sm font-semibold text-white line-clamp-2">
                          {video.title}
                        </div>
                        <div className="text-xs text-white/60">
                          {video.channelName}
                        </div>
                      </button>
                    ))}
                  </div>

                  {relatedVideos.length > 5 && (
                    <button
                      onClick={() => {
                        setShowVideoInfo(false);
                        router.push(`/catalog/en/youtube/channel/${videoInfo?.channelId}`);
                      }}
                      className="mt-3 w-full rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
                    >
                      查看全部 {relatedVideos.length} 个视频
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dictionary Modal */}
      {showDictionaryModal && dictionaryWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            ref={dictionaryModalRef}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-card p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDictionaryModal(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              <span className="text-2xl">×</span>
            </button>

            {/* Word Header */}
            <div className="mb-6 border-b border-white/10 pb-6">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white">
                  {dictionaryWord.text}
                </h2>
                <button
                  onClick={() => speakWord(dictionaryWord.text)}
                  className="rounded-lg border border-white/20 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
                  title="发音"
                  aria-label="发音"
                >
                  <span className="text-xl">🔊</span>
                </button>
                {settings.customDictUrl && (
                  <a
                    href={settings.customDictUrl.replace(/WORD/g, encodeURIComponent(dictionaryWord.text))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 transition-all hover:bg-white/10"
                    title="在自定义词典中查询"
                  >
                    📖 自定义词典
                  </a>
                )}
              </div>

              {/* Translation */}
              <div className="mb-3 text-xl text-white/70">
                {dictionaryWord.translation || "暂无翻译"}
              </div>

              {/* Difficulty Badge */}
              {dictionaryWord.difficulty && (
                <span
                  className={`inline-block rounded px-3 py-1 text-sm font-semibold ${
                    dictionaryWord.difficulty === "beginner"
                      ? "bg-blue-500/20 text-blue-400"
                      : dictionaryWord.difficulty === "intermediate"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {dictionaryWord.difficulty === "beginner" && "初级"}
                  {dictionaryWord.difficulty === "intermediate" && "中级"}
                  {dictionaryWord.difficulty === "advanced" && "高级"}
                </span>
              )}
            </div>

            {/* Definition */}
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold text-secondary">释义</h3>
              <p className="leading-relaxed text-white/80">
                {dictionaryWord.definition || "暂无释义"}
              </p>
            </div>

            {/* Example Sentences */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-secondary">例句</h3>
              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-white">
                    The weather makes me feel happy today.
                  </p>
                  <p className="text-sm text-white/60">
                    今天的天气让我感到快乐。
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-white">
                    She makes delicious cakes every weekend.
                  </p>
                  <p className="text-sm text-white/60">
                    她每个周末都做美味的蛋糕。
                  </p>
                </div>
              </div>
            </div>

            {/* Word Forms */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-secondary">词形变化</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
                  makes
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
                  made
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
                  making
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleSaveWord(dictionaryWord)}
                className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                  savedWords.has(dictionaryWord.text.toLowerCase())
                    ? "border border-white/20 text-white hover:bg-white/10"
                    : "bg-secondary text-secondary-foreground hover:opacity-90"
                }`}
              >
                {savedWords.has(dictionaryWord.text.toLowerCase())
                  ? "✓ 已保存"
                  : "保存到词汇表"}
              </button>
              <button
                onClick={() => setShowDictionaryModal(false)}
                className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      {(phraseToast || copyToast) && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-white/20 bg-black/90 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
          {phraseToast || copyToast}
        </div>
      )}
    </main>
  );
}
