
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState, useRef, useEffect} from 'react';
import {AspectRatio, GenerateVideoParams} from '../types';
import {ArrowPathIcon, DownloadIcon, SparklesIcon, FileImageIcon, PlusIcon, MusicIcon, TrashIcon} from './icons';
import Tooltip from './Tooltip';
// @ts-ignore
import gifshot from 'gifshot';

interface VideoResultProps {
  videoUrl: string;
  config: GenerateVideoParams | null; // Receive the config used
  onRetry: () => void;
  onNewVideo: () => void;
  onExtend: () => void;
  canExtend: boolean;
  aspectRatio: AspectRatio;
}

const VideoResult: React.FC<VideoResultProps> = ({
  videoUrl,
  config,
  onRetry,
  onNewVideo,
  onExtend,
  canExtend,
  aspectRatio,
}) => {
  const isPortrait = aspectRatio === AspectRatio.PORTRAIT;
  const [isConvertingGif, setIsConvertingGif] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Initialize Audio from Config
  useEffect(() => {
    if (config?.audioFile && !audioUrl) {
        const url = URL.createObjectURL(config.audioFile);
        setAudioUrl(url);
        setAudioName(config.audioFile.name);
    }
  }, [config, audioUrl]);

  // Synchronization Logic
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio) return;

    // Save to History on Success (once)
    const saveToHistory = async () => {
      if (!videoUrl || !config) return;
      try {
        await fetch('./api/history.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: config.prompt,
            video_url: videoUrl,
            model: config.model,
            resolution: config.resolution,
            aspect_ratio: config.aspectRatio,
            style: config.visualStyle
          })
        });
        console.log('Video saved to history');
      } catch (e) {
        console.error('Failed to save history:', e);
      }
    };

    if (videoUrl) {
      saveToHistory();
    }

    const syncPlay = () => {
        audio.play().catch(e => console.log("Audio play blocked/failed", e));
    };
    
    const syncPause = () => {
        audio.pause();
    };

    const syncSeek = () => {
        audio.currentTime = video.currentTime;
    };

    const syncVolume = () => {
        audio.volume = video.volume;
        audio.muted = video.muted;
    };

    const handleVideoEnded = () => {
        if (video.loop) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    };

    video.addEventListener('play', syncPlay);
    video.addEventListener('pause', syncPause);
    video.addEventListener('seeking', syncSeek);
    video.addEventListener('waiting', syncPause);
    video.addEventListener('playing', syncPlay);
    video.addEventListener('volumechange', syncVolume);
    video.addEventListener('ended', handleVideoEnded);

    return () => {
        video.removeEventListener('play', syncPlay);
        video.removeEventListener('pause', syncPause);
        video.removeEventListener('seeking', syncSeek);
        video.removeEventListener('waiting', syncPause);
        video.removeEventListener('playing', syncPlay);
        video.removeEventListener('volumechange', syncVolume);
        video.removeEventListener('ended', handleVideoEnded);
    };
  }, [audioUrl]);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        setAudioName(file.name);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    }
    if (audioInputRef.current) {
        audioInputRef.current.value = '';
    }
  };

  const handleRemoveAudio = () => {
    setAudioUrl(null);
    setAudioName(null);
  };

  const handleDownloadGif = async (frames: number) => {
    if (!videoUrl) return;
    setIsConvertingGif(true);
    try {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        if (video.readyState >= 1) {
          resolve(null);
        } else {
          video.onloadedmetadata = () => resolve(null);
        }
      });
      const duration = video.duration;
      const width = isPortrait ? 360 : 640;
      const height = isPortrait ? 640 : 360;
      const step = duration / frames;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const images: string[] = [];
      for (let i = 0; i < frames; i++) {
        const time = i * step;
        if (time > 0) {
          video.currentTime = time;
          await new Promise((resolve) => {
             const onSeeked = () => {
               video.removeEventListener('seeked', onSeeked);
               resolve(null);
             };
             video.addEventListener('seeked', onSeeked);
          });
        }
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          images.push(canvas.toDataURL('image/jpeg', 0.8));
        }
      }
      gifshot.createGIF({
        images: images,
        interval: 0.1,
        gifWidth: width,
        gifHeight: height,
        numFrames: frames,
        sampleInterval: 10,
      }, (obj: any) => {
        if (!obj.error) {
          const link = document.createElement('a');
          link.href = obj.image;
          link.download = `veo-studio-creation-${(frames/10).toFixed(1)}s.gif`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('Failed to generate GIF. Try again.');
        }
        setIsConvertingGif(false);
      });
    } catch (error) {
      setIsConvertingGif(false);
      alert('An error occurred while preparing the GIF.');
    }
  };

  const getDurationLabel = (divisor: number) => {
    if (!videoDuration) return divisor === 1 ? '8s' : divisor === 2 ? '4s' : '2s';
    return `${Math.round(videoDuration / divisor)}s`;
  };

  const getFrames = (divisor: number) => {
    const duration = videoDuration || 8;
    return Math.floor((duration / divisor) * 10);
  }

  return (
    <div className="w-full relative flex flex-col items-center gap-6 p-8 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-2xl overflow-visible animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute top-4 left-4 z-10">
        <Tooltip content="Iniciar uma nova criação do zero.">
          <button
            onClick={onNewVideo}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-lg shadow-purple-900/20"
          >
            <PlusIcon className="w-4 h-4" />
            Novo Vídeo
          </button>
        </Tooltip>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Criação Pronta!
        </h2>
        {config && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-0.5 bg-gray-700/50 rounded border border-gray-600">
                    {config.model.includes('fast') ? 'Veo Fast' : 'Veo 3.1'}
                </span>
                <span className="px-2 py-0.5 bg-gray-700/50 rounded border border-gray-600">
                    {config.resolution}
                </span>
                <span className="px-2 py-0.5 bg-gray-700/50 rounded border border-gray-600">
                    {config.aspectRatio}
                </span>
            </div>
        )}
      </div>

      <div 
        className={`w-full ${
          isPortrait ? 'max-w-xs aspect-[9/16]' : 'max-w-2xl aspect-video'
        } rounded-xl overflow-hidden bg-black shadow-[0_0_50px_rgba(79,70,229,0.15)] border border-indigo-500/20 transition-all duration-500 group relative`}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full h-full object-contain"
          onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
        />
        {audioUrl && (
            <audio ref={audioRef} src={audioUrl} preload="auto" />
        )}
      </div>
      
      <div className="w-full max-w-2xl flex flex-col items-center gap-3">
        {!audioUrl ? (
            <div className="w-full">
                <input 
                    type="file" 
                    accept="audio/*" 
                    ref={audioInputRef} 
                    className="hidden" 
                    onChange={handleAudioUpload}
                />
                <Tooltip content="Adicione uma música ou efeito para tocar em sincronia com o vídeo." className="w-full">
                  <button 
                      onClick={() => audioInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1f1f23] hover:bg-gray-700 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors text-sm group"
                  >
                      <MusicIcon className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
                      Adicionar Trilha Sonora / Efeito Sonoro
                  </button>
                </Tooltip>
            </div>
        ) : (
            <div className="w-full flex items-center justify-between px-4 py-3 bg-[#1f1f23] border border-indigo-500/30 rounded-lg">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400">
                        <MusicIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm text-gray-200 font-medium truncate max-w-[200px]">{audioName}</span>
                        <span className="text-[10px] text-indigo-400">Sincronizado com vídeo</span>
                    </div>
                </div>
                <Tooltip content="Remover a trilha sonora atual do projeto.">
                  <button 
                      onClick={handleRemoveAudio}
                      className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                  >
                      <TrashIcon className="w-4 h-4" />
                  </button>
                </Tooltip>
            </div>
        )}
      </div>

      {config && config.prompt && (
        <div className="w-full max-w-2xl bg-[#1f1f23] rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <SparklesIcon className="w-3 h-3" />
                Prompt Utilizado
            </div>
            <p className="text-gray-300 text-sm leading-relaxed italic">
                "{config.prompt}"
            </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 w-full pt-2">
        <Tooltip content="Regenerar o vídeo com os mesmos parâmetros para buscar um novo resultado.">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all active:scale-95 border border-gray-600">
            <ArrowPathIcon className="w-5 h-5" />
            Tentar Novamente
          </button>
        </Tooltip>
        
        <Tooltip content="Salvar o vídeo em alta qualidade no seu dispositivo (formato MP4).">
          <a
            href={videoUrl}
            download="veo-studio-creation.mp4"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
            <DownloadIcon className="w-5 h-5" />
            Baixar MP4
          </a>
        </Tooltip>

        <div className="relative group">
          <Tooltip content="Converter e baixar uma versão animada em formato GIF.">
            <button
              disabled={isConvertingGif}
              onClick={() => handleDownloadGif(getFrames(1))}
              className={`flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-wait`}
            >
              {isConvertingGif ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FileImageIcon className="w-5 h-5" />
              )}
              {isConvertingGif ? 'Convertendo...' : 'Baixar GIF'}
            </button>
          </Tooltip>
          
          {!isConvertingGif && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-visible opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-30
            after:content-[''] after:absolute after:top-full after:left-0 after:w-full after:h-4">
              <div className="overflow-hidden rounded-xl bg-gray-800">
                <div className="p-3 text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-700 text-center font-bold">
                  Duração do GIF
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownloadGif(getFrames(4)); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-amber-600/50 transition-colors flex justify-between items-center group/item"
                >
                  <span>{getDurationLabel(4)}</span>
                  <span className="text-[10px] text-gray-500 group-hover/item:text-white">4x Rápido</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownloadGif(getFrames(2)); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-amber-600/50 transition-colors flex justify-between items-center group/item"
                >
                  <span>{getDurationLabel(2)}</span>
                  <span className="text-[10px] text-gray-500 group-hover/item:text-white">2x Rápido</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownloadGif(getFrames(1)); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-amber-600/50 transition-colors flex justify-between items-center group/item"
                >
                  <span>{getDurationLabel(1)}</span>
                  <span className="text-[10px] text-gray-500 group-hover/item:text-white">Normal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {canExtend ? (
          <Tooltip content="Adicionar mais 7 segundos de movimento contínuo ao final deste vídeo.">
            <button
              onClick={onExtend}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-900/20">
              <SparklesIcon className="w-5 h-5" />
              Extender
            </button>
          </Tooltip>
        ) : (
          <Tooltip content="Extensões só estão disponíveis para vídeos gerados em 720p.">
            <button
              disabled
              className="flex items-center gap-2 px-6 py-3 bg-gray-700/50 text-gray-500 font-semibold rounded-lg cursor-not-allowed opacity-60 border border-gray-700">
              <SparklesIcon className="w-5 h-5" />
              Extender
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default VideoResult;
