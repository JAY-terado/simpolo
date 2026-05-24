import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, QrCode, Menu, ChevronRight, Volume2, VolumeX, Maximize, Minimize, LogOut, X } from 'lucide-react';
import logoDark from '../../assets/logo_dark.png';
import thumbWetMix from '../../assets/thumbnail_wet_mix.png';
import thumbPress from '../../assets/thumbnail_press.png';
import thumbGlaze from '../../assets/thumbnail_glaze.png';

interface SlipHousePageProps {
  userName: string;
  userPhone: string;
  onBack: () => void;
}

interface Language {
  code: string;
  name: string;
  videoUrl: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', videoUrl: 'https://d1f509n5sa1jf5.cloudfront.net/factory-video/English%20Slip%20House.mp4' },
  { code: 'hi', name: 'Hindi', videoUrl: 'https://d1f509n5sa1jf5.cloudfront.net/factory-video/Hindi%20Slip%20House.mp4' },
  { code: 'mr', name: 'Marathi', videoUrl: 'https://d1f509n5sa1jf5.cloudfront.net/factory-video/Marathi%20Slip%20House.mp4' },
  { code: 'te', name: 'Telugu', videoUrl: 'https://d1f509n5sa1jf5.cloudfront.net/factory-video/Telegu%20Slip%20House.mp4' },
  { code: 'kn', name: 'Kannada', videoUrl: 'https://d1f509n5sa1jf5.cloudfront.net/factory-video/Kannad%20Slip%20House.mp4' },
  { code: 'ml', name: 'Malayalam', videoUrl: 'https://d1f509n5sa1jf5.cloudfront.net/factory-video/Malayalam%20Slip%20House.mp4' },
  { code: 'gu', name: 'Gujarati', videoUrl: 'https://d1f509n5sa1jf5.cloudfront.net/factory-video/Gujrati%20Slip%20House.mp4' },
  { code: 'ta', name: 'Tamil', videoUrl: 'https://d1f509n5sa1jf5.cloudfront.net/factory-video/Tamil%20Slip%20House.mp4' }
];

export default function SlipHousePage({ userName, userPhone, onBack }: SlipHousePageProps) {
  const [selectedLang, setSelectedLang] = useState<Language>(() => {
    try {
      const cached = localStorage.getItem(`simpolo_tour_progress_${userPhone}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const found = LANGUAGES.find((l) => l.code === parsed.languageCode);
        if (found) return found;
      }
    } catch (e) {
      console.error('Error loading selected language from localStorage:', e);
    }
    return LANGUAGES[0];
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Play with audio by default
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    savedTimeRef.current = newTime;
    saveProgress(newTime, selectedLang.code);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const getInitialTime = (): number => {
    try {
      const cached = localStorage.getItem(`simpolo_tour_progress_${userPhone}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.timestamp || 0;
      }
    } catch (e) {
      console.error('Error loading timestamp from localStorage:', e);
    }
    return 0;
  };

  const savedTimeRef = useRef<number>(getInitialTime());

  const saveProgress = (time: number, langCode: string) => {
    try {
      const data = {
        languageCode: langCode,
        timestamp: time
      };
      localStorage.setItem(`simpolo_tour_progress_${userPhone}`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  };

  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanner = async () => {
    setScannerOpen(true);
    try {
      setTimeout(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          streamRef.current = stream;
          if (scannerVideoRef.current) {
            scannerVideoRef.current.srcObject = stream;
            scannerVideoRef.current.play().catch(err => console.error("Error playing scanner video:", err));
          }
        } else {
          alert("Camera access is not supported on this browser.");
        }
      }, 300);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScannerOpen(false);
  };

  // Clean up camera stream if component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Monitor fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);



  const handleLanguageChange = (lang: Language) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      savedTimeRef.current = currentTime;
      saveProgress(currentTime, lang.code);
    } else {
      saveProgress(savedTimeRef.current, lang.code);
    }
    setSelectedLang(lang);
    setDropdownOpen(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-[#1a0f0d] flex flex-col font-sans">
      
      {/* Header bar matching mockup */}
      <header className="w-full bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <img 
            src={logoDark} 
            alt="Simpolo Tiles & Bathware" 
            className="h-10 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-5 text-gray-700">
          <button 
            onClick={startScanner}
            className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer lg:hidden" 
            title="Scan QR Code"
          >
            <QrCode className="w-6 h-6" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-700 block" 
              title="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Menu Dropdown */}
            <AnimatePresence>
              {menuOpen && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-3 px-4 flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-0.5 select-none">
                      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Signed in as</span>
                      <span className="text-sm font-bold text-gray-800 truncate" title={userName}>{userName}</span>
                    </div>
                    
                    <div className="h-px bg-gray-100 w-full" />
                    
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onBack();
                      }}
                      className="w-full flex items-center justify-between text-left text-sm font-semibold text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer group"
                    >
                      <span>Logout</span>
                      <LogOut className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content scrollable */}
      <main className="flex-1 flex flex-col w-full max-w-[480px] lg:max-w-[1200px] mx-auto px-5 py-4">

        {/* Page Title */}
        <div className="mb-4 flex items-baseline gap-2">
          <h2 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">Slip House</h2>
          <span className="text-gray-400 text-sm font-normal">({LANGUAGES.length} Languages)</span>
        </div>

        {/* Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left Column: Video and Language Controls */}
          <div className="lg:col-span-8 flex flex-col w-full">
            {/* Video Player Card */}
            <div 
              ref={containerRef} 
              className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-100 group mb-4 flex items-center justify-center"
            >
              <video
                ref={videoRef}
                src={selectedLang.videoUrl}
                playsInline
                muted={isMuted}
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  setDuration(video.duration || 0);
                  video.currentTime = savedTimeRef.current;
                  setCurrentTime(savedTimeRef.current);
                  video.play()
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  savedTimeRef.current = 0;
                  saveProgress(0, selectedLang.code);
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    const time = videoRef.current.currentTime;
                    setCurrentTime(time);
                    savedTimeRef.current = time;
                    saveProgress(time, selectedLang.code);
                  }
                }}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Simple controls bar */}
              <div 
                className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 bg-black/20'
                }`}
              >
                {/* Top Bar (controls) */}
                <div className="flex justify-end gap-2 pointer-events-auto h-fit w-full">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="p-1.5 rounded-full bg-black/45 text-white hover:bg-black/60 cursor-pointer transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                    className="p-1.5 rounded-full bg-black/45 text-white hover:bg-black/60 cursor-pointer transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>

                {/* Bottom Bar: Scrubber and Time */}
                <div className="flex items-center gap-3.5 w-full pointer-events-auto mt-auto px-1 pb-1">
                  <span className="text-white text-xs font-medium select-none tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleScrubberChange}
                    onClick={(e) => e.stopPropagation()} // Prevent play/pause toggle when clicking scrubber
                    className="custom-slider flex-1 cursor-pointer accent-[#C5A073]"
                  />
                  <span className="text-white/90 text-xs font-medium select-none tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Premium Language Dropdown Button */}
            <div className="relative mb-6">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-sm font-semibold text-gray-800 transition-all hover:bg-gray-100 cursor-pointer lg:hidden"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-normal">Play Audio in:</span>
                  <span className="text-[#C5A073] font-bold">{selectedLang.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Languages Dropdown Overlay */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-2 max-h-60 overflow-y-auto lg:hidden"
                  >
                    {LANGUAGES.map((lang) => {
                      const isSelected = selectedLang.code === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang)}
                          className={`w-full text-left px-5 py-3 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-[#C5A073]/10 text-[#C5A073] font-bold' 
                              : 'hover:bg-gray-50 text-gray-700 font-medium'
                          }`}
                        >
                          <span>{lang.name}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#C5A073]" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Language Pills (matching the mockup design aesthetic) */}
              <div className="flex flex-wrap gap-2 mt-3 lg:mt-0">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLang.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#22c55e] bg-[#f0fdf4] text-[#15803d]' 
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {lang.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: About Details and Next Videos */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            {/* About Section */}
            <section className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-gray-900 tracking-wide uppercase">About</h3>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                This is where the backbone of our premium ceramic production begins — the Slip House. 
                In this section, raw materials are scientifically handled and processed to ensure that body composition remains perfectly consistent in every batch.
              </p>
            </section>

            {/* Next Video Presentational Section (Matching Mockup exactly) */}
            <section className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-gray-900 tracking-wide uppercase">Next Video</h3>
              
              <div className="flex flex-col gap-4 border border-gray-100 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                
                {/* Wet Color Mixing System item */}
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={thumbWetMix} 
                      alt="Wet Color Mixing System" 
                      className="w-16 h-12 rounded-lg object-cover border border-gray-100 shadow-sm"
                    />
                    <div>
                      <span className="text-[13px] font-bold text-gray-900 leading-snug block">
                        Wet Color Mixing System
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        (8 Languages)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Press item */}
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={thumbPress} 
                      alt="Press" 
                      className="w-16 h-12 rounded-lg object-cover border border-gray-100 shadow-sm"
                    />
                    <div>
                      <span className="text-[13px] font-bold text-gray-900 leading-snug block">
                        Press (By SACMI, ITALY)
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        (8 Languages)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Glaze Line item */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={thumbGlaze} 
                      alt="Glaze Line" 
                      className="w-16 h-12 rounded-lg object-cover border border-gray-100 shadow-sm"
                    />
                    <div>
                      <span className="text-[13px] font-bold text-gray-900 leading-snug block">
                        Glaze Line (By INTESA, SACMI, ITALY)
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        (8 Languages)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

              </div>

              {/* See all videos button */}
              <button className="flex items-center justify-center gap-1.5 self-center mt-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors py-2 px-4 rounded-full border border-gray-200 bg-white cursor-pointer shadow-sm">
                <span>See all videos (10)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>
          </div>

        </div>

      </main>

      {/* QR Code Scanner Modal */}
      <AnimatePresence>
        {scannerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-between p-6 font-sans text-white"
          >
            {/* Top Bar inside Scanner */}
            <div className="w-full flex items-center justify-between max-w-[480px]">
              <h3 className="text-lg font-bold">Scan QR Code</h3>
              <button 
                onClick={stopScanner}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                title="Close Scanner"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Camera Viewfinder */}
            <div className="relative w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden bg-[#110705] border border-white/10 shadow-2xl flex items-center justify-center">
              <video
                ref={scannerVideoRef}
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Viewfinder square framing overlay */}
              <div className="absolute inset-0 border-[32px] border-black/40 pointer-events-none" />

              {/* Scanning Target frame */}
              <div className="absolute w-[240px] h-[240px] border-2 border-white/25 rounded-2xl pointer-events-none flex items-center justify-center">
                {/* Glowing Laser line */}
                <div className="absolute top-2 left-2 right-2 h-0.5 bg-green-400 scanner-laser shadow-[0_0_12px_#4ade80]" />
              </div>

              {/* Corner Targets */}
              <div className="absolute w-[244px] h-[244px] pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#C5A073]" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#C5A073]" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#C5A073]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#C5A073]" />
              </div>
            </div>

            {/* Bottom info text */}
            <div className="text-center max-w-[280px] mb-8 select-none">
              <p className="text-sm font-semibold text-white">Align QR Code inside the square</p>
              <p className="text-xs text-gray-400 mt-1.5 font-light leading-relaxed">Position the code flat and avoid glares for a fast scan.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
