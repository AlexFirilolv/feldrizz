import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useCountdownDay } from '../hooks/useCountdown';
import LoadingSpinner from './LoadingSpinner';
import { ArrowLeftIcon, LockClosedIcon, HeartIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { DaySection, AudioConfig } from '../types';

const DayView: React.FC = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('preview_token') || undefined;
  
  const dayNum = parseInt(dayNumber || '0', 10);
  const { day, loading, error, refetch } = useCountdownDay(dayNum, previewToken);

  // Audio state management
  const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);
  const [backgroundVolume, setBackgroundVolume] = useState(0.7);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    if (day?.background_audio && day?.audio_config && backgroundAudioRef.current) {
      const audio = backgroundAudioRef.current;
      const config = day.audio_config;
      
      // Configure audio
      audio.volume = config.volume || 0.7;
      audio.loop = config.loop || false;
      setBackgroundVolume(config.volume || 0.7);
      
      // Auto-play if configured (note: browsers may block autoplay)
      if (config.autoplay && !config.background_mode) {
        audio.play().catch(console.warn);
      }
    }
  }, [day]);

  // Handle video play/pause events to fade background audio
  useEffect(() => {
    const handleVideoPlay = (videoId: string) => {
      setCurrentPlayingVideo(videoId);
      if (backgroundAudioRef.current && day?.audio_config?.fade_on_video) {
        const fadeVolume = (day.audio_config.video_volume_ratio || 0.3) * backgroundVolume;
        backgroundAudioRef.current.volume = fadeVolume;
      }
    };

    const handleVideoPause = () => {
      setCurrentPlayingVideo(null);
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.volume = backgroundVolume;
      }
    };

    // Set up video event listeners
    videoRefs.current.forEach((video, id) => {
      video.addEventListener('play', () => handleVideoPlay(id));
      video.addEventListener('pause', handleVideoPause);
      video.addEventListener('ended', handleVideoPause);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        video.removeEventListener('play', () => {});
        video.removeEventListener('pause', handleVideoPause);
        video.removeEventListener('ended', handleVideoPause);
      });
    };
  }, [backgroundVolume, day?.audio_config]);

  const toggleBackgroundAudio = () => {
    if (backgroundAudioRef.current) {
      if (isBackgroundPlaying) {
        backgroundAudioRef.current.pause();
      } else {
        backgroundAudioRef.current.play().catch(console.warn);
      }
    }
  };

  const handleBackgroundAudioPlay = () => setIsBackgroundPlaying(true);
  const handleBackgroundAudioPause = () => setIsBackgroundPlaying(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your special day..." />
      </div>
    );
  }

  if (error || !day) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-warm-gray-800 mb-4">
            Day Not Found
          </h2>
          <p className="text-warm-gray-600 mb-6">
            {error || "We couldn't find this day in our countdown."}
          </p>
          <div className="space-x-4">
            <Link to="/" className="btn-romantic">
              Back to Countdown
            </Link>
            <button onClick={refetch} className="btn-outline">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!day.is_unlocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-warm-gray-200 rounded-full mb-6">
            <LockClosedIcon className="w-12 h-12 text-warm-gray-400" />
          </div>
          
          <h2 className="text-3xl font-bold text-warm-gray-800 mb-4">
            Day {day.day_number}
          </h2>
          
          <h3 className="text-xl text-warm-gray-600 mb-6 romantic-text">
            {day.title}
          </h3>
          
          <p className="text-warm-gray-600 mb-8 leading-relaxed">
            This day hasn't been unlocked yet. Check back when it's time! 
            Our journey unfolds one day at a time. 💕
          </p>
          
          <Link to="/" className="btn-romantic">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Countdown
          </Link>
        </div>
      </div>
    );
  }

  const renderSection = (section: DaySection, index: number) => {
    const alignmentClass = section.style_config?.alignment === 'center' ? 'text-center' : 
                           section.style_config?.alignment === 'right' ? 'text-right' : 'text-left';
    const fontSizeClass = section.style_config?.font_size === 'small' ? 'text-sm' :
                          section.style_config?.font_size === 'large' ? 'text-lg' : 'text-base';
    const marginClass = section.style_config?.margin === 'small' ? 'mb-2' :
                        section.style_config?.margin === 'large' ? 'mb-8' : 'mb-4';

    switch (section.section_type) {
      case 'title':
        return (
          <div key={section.id} className={`${alignmentClass} ${marginClass}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-warm-gray-800 romantic-text">
              {section.content_text}
            </h2>
          </div>
        );

      case 'text':
        return (
          <div key={section.id} className={`${alignmentClass} ${marginClass}`}>
            <div className={`${fontSizeClass} text-warm-gray-700 leading-relaxed whitespace-pre-wrap`}>
              {section.content_text}
            </div>
          </div>
        );

      case 'quote':
        return (
          <div key={section.id} className={`${alignmentClass} ${marginClass}`}>
            <blockquote className="relative">
              <div className="text-4xl text-warm-pink absolute -top-2 -left-2">"</div>
              <div className={`${fontSizeClass} text-warm-gray-700 italic pl-6 pr-6 py-4 bg-warm-yellow/10 rounded-lg border-l-4 border-warm-pink`}>
                {section.content_text}
              </div>
              <div className="text-4xl text-warm-pink absolute -bottom-6 -right-2">"</div>
            </blockquote>
          </div>
        );

      case 'image':
        return (
          <div key={section.id} className={`${alignmentClass} ${marginClass}`}>
            {section.media_asset && (
              <div className="relative">
                <img
                  src={section.media_asset.url}
                  alt={section.media_asset.media_config?.alt_text || section.content_text || ''}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  loading="lazy"
                />
                {(section.content_text || section.media_asset.media_config?.caption) && (
                  <p className="text-sm text-warm-gray-600 mt-2 italic">
                    {section.content_text || section.media_asset.media_config?.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div key={section.id} className={`${alignmentClass} ${marginClass}`}>
            {section.media_asset && (
              <div className="relative">
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current.set(section.id, el);
                    } else {
                      videoRefs.current.delete(section.id);
                    }
                  }}
                  controls={section.media_asset.media_config?.controls !== false}
                  autoPlay={section.media_asset.media_config?.autoplay || false}
                  muted={section.media_asset.media_config?.muted || false}
                  loop={section.media_asset.media_config?.loop || false}
                  poster={section.media_asset.media_config?.poster}
                  className="w-full max-w-full h-auto rounded-lg shadow-lg"
                  preload="metadata"
                >
                  <source src={section.media_asset.url} type={section.media_asset.mime_type} />
                  Your browser does not support the video tag.
                </video>
                {section.content_text && (
                  <p className="text-sm text-warm-gray-600 mt-2 italic">
                    {section.content_text}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div key={section.id} className={`${alignmentClass} ${marginClass}`}>
            {section.media_asset && (
              <div className="bg-warm-gray-50 rounded-lg p-4 border border-warm-gray-200">
                <audio
                  controls={section.media_asset.media_config?.controls !== false}
                  autoPlay={section.media_asset.media_config?.autoplay || false}
                  loop={section.media_asset.media_config?.loop || false}
                  className="w-full"
                  preload="metadata"
                >
                  <source src={section.media_asset.url} type={section.media_asset.mime_type} />
                  Your browser does not support the audio tag.
                </audio>
                {section.content_text && (
                  <p className="text-sm text-warm-gray-600 mt-2">
                    {section.content_text}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'divider':
        return (
          <div key={section.id} className={`${alignmentClass} ${marginClass}`}>
            <div className="flex items-center justify-center py-6">
              <div className="flex-1 border-t border-warm-gray-300"></div>
              <div className="px-4 text-warm-pink">
                <HeartIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 border-t border-warm-gray-300"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const sections = day.sections || [];
  const hasContent = sections.length > 0 || day.content_html;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Background Audio */}
      {day.background_audio && (
        <audio
          ref={backgroundAudioRef}
          src={day.background_audio.url}
          loop={day.audio_config?.loop || false}
          onPlay={handleBackgroundAudioPlay}
          onPause={handleBackgroundAudioPause}
          onEnded={handleBackgroundAudioPause}
          preload="auto"
        />
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-sunset rounded-full mb-6">
          <HeartIcon className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-warm-gray-800 mb-4">
          Day {day.day_number}
        </h1>
        
        <h2 className="text-2xl md:text-3xl text-warm-orange mb-6 romantic-text">
          {day.title}
        </h2>
        
        <div className="flex items-center justify-center space-x-4 mb-6">
          {previewToken && (
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full text-yellow-800 text-sm">
              <span className="mr-2">👀</span>
              Preview Mode
            </div>
          )}
          
          {/* Background Audio Controls */}
          {day.background_audio && !day.audio_config?.background_mode && (
            <button
              onClick={toggleBackgroundAudio}
              className="inline-flex items-center px-4 py-2 bg-warm-pink/10 border border-warm-pink/20 rounded-full text-warm-pink text-sm hover:bg-warm-pink/20 transition-colors"
              title={isBackgroundPlaying ? 'Pause background music' : 'Play background music'}
            >
              {isBackgroundPlaying ? (
                <>
                  <PauseIcon className="w-4 h-4 mr-2" />
                  Pause Music
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Play Music
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-romantic border border-white/20 overflow-hidden">
        {hasContent ? (
          <div className="p-8 md:p-12">
            {/* Render Sections */}
            {sections.length > 0 ? (
              <div className="space-y-6">
                {sections
                  .sort((a, b) => a.position_order - b.position_order)
                  .map((section, index) => renderSection(section, index))
                }
              </div>
            ) : (
              /* Legacy HTML Content */
              <div 
                className="prose prose-lg max-w-none scrollbar-romantic"
                dangerouslySetInnerHTML={{ __html: day.content_html || '' }}
              />
            )}
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-warm-gray-800 mb-4">
              Coming Soon
            </h3>
            <p className="text-warm-gray-600">
              The content for this day is still being prepared. 
              Check back soon for your special surprise!
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-warm-gray-600 hover:text-warm-orange transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to All Days</span>
        </Link>

        <div className="flex items-center space-x-4">
          {dayNum > 1 && (
            <Link 
              to={`/day/${dayNum - 1}`}
              className="btn-outline"
            >
              Previous Day
            </Link>
          )}
          
          {dayNum < 25 && (
            <Link 
              to={`/day/${dayNum + 1}`}
              className="btn-romantic"
            >
              Next Day
            </Link>
          )}
        </div>
      </div>

      {/* Special message for first and last days */}
      {(dayNum === 1 || dayNum === 25) && (
        <div className="mt-12 p-8 bg-gradient-soft rounded-2xl shadow-romantic border border-white/20 text-center">
          <div className="text-4xl mb-4">
            {dayNum === 25 ? '🎉' : '💖'}
          </div>
          <p className="text-lg text-warm-gray-700 romantic-text">
            {dayNum === 25 
              ? "This is where our 25-day journey begins! Welcome to our special countdown." 
              : "Congratulations! You've reached the final day of our countdown. Happy 6-month anniversary!"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DayView; 