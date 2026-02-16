
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AspectRatio,
  CameraMovement,
  GenerateVideoParams,
  GenerationMode,
  ImageFile,
  LightingStyle,
  Resolution,
  VeoModel,
  VideoFile,
  VisualStyle,
} from '../types';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  FileImageIcon,
  FilmIcon,
  FramesModeIcon,
  InfoIcon,
  PlusIcon,
  RectangleStackIcon,
  ReferencesModeIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TextModeIcon,
  TvIcon,
  XMarkIcon,
  MusicIcon,
} from './icons';
import Tooltip from './Tooltip';

const aspectRatioDisplayNames: Record<AspectRatio, string> = {
  [AspectRatio.LANDSCAPE]: 'Paisagem (16:9)',
  [AspectRatio.PORTRAIT]: 'Retrato (9:16)',
};

const modeIcons: Record<GenerationMode, React.ReactNode> = {
  [GenerationMode.TEXT_TO_VIDEO]: <TextModeIcon className="w-5 h-5" />,
  [GenerationMode.IMAGE_TO_VIDEO]: <FileImageIcon className="w-5 h-5" />,
  [GenerationMode.FRAMES_TO_VIDEO]: <FramesModeIcon className="w-5 h-5" />,
  [GenerationMode.REFERENCES_TO_VIDEO]: (
    <ReferencesModeIcon className="w-5 h-5" />
  ),
  [GenerationMode.EXTEND_VIDEO]: <FilmIcon className="w-5 h-5" />,
};

const modeLabels: Record<GenerationMode, string> = {
  [GenerationMode.TEXT_TO_VIDEO]: 'Texto para Vídeo',
  [GenerationMode.IMAGE_TO_VIDEO]: 'Imagem para Vídeo',
  [GenerationMode.FRAMES_TO_VIDEO]: 'Quadros para Vídeo',
  [GenerationMode.REFERENCES_TO_VIDEO]: 'Referências para Vídeo',
  [GenerationMode.EXTEND_VIDEO]: 'Estender Vídeo',
};

const SETTINGS_STORAGE_KEY = 'veo_studio_settings';

const fileToBase64 = <T extends {file: File; base64: string}>(
  file: File,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64} as T);
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
const fileToImageFile = (file: File): Promise<ImageFile> =>
  fileToBase64<ImageFile>(file);
const fileToVideoFile = (file: File): Promise<VideoFile> =>
  fileToBase64<VideoFile>(file);

const extractLastFrame = async (file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;
        video.onloadedmetadata = () => {
            video.currentTime = video.duration - 0.05; 
        };
        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const frameFile = new File([blob], 'last_frame.jpg', { type: 'image/jpeg' });
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64 = (reader.result as string).split(',')[1];
                            resolve({ file: frameFile, base64 });
                        };
                        reader.readAsDataURL(frameFile);
                    } else {
                        reject(new Error("Failed to create blob from frame"));
                    }
                }, 'image/jpeg', 0.95);
            } else {
                reject(new Error("Failed to get canvas context"));
            }
        };
        video.onerror = (e) => reject(e);
    });
};

const CustomSelect: React.FC<{
  label: string;
  tooltip?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({label, tooltip, value, onChange, icon, children, disabled = false}) => (
  <div>
    <div className="flex items-center gap-2 mb-1.5">
        <label
        className={`text-xs font-medium ${
            disabled ? 'text-gray-500' : 'text-gray-400'
        }`}>
        {label}
        </label>
        {tooltip && (
            <Tooltip content={tooltip}>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
            </Tooltip>
        )}
    </div>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {icon}
      </div>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-[#1f1f1f] border border-gray-600 rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-700/50 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed">
        {children}
      </select>
      <ChevronDownIcon
        className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
          disabled ? 'text-gray-600' : 'text-gray-400'
        }`}
      />
    </div>
  </div>
);

const ImageUpload: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
  label: React.ReactNode;
  className?: string;
}> = ({onSelect, onRemove, image, label, className = "w-28 h-20"}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (image) {
    return (
      <div className={`relative group ${className}`}>
        <img
          src={URL.createObjectURL(image.file)}
          alt="preview"
          className="w-full h-full object-cover rounded-lg shadow-inner"
        />
        <Tooltip content="Remover esta imagem e selecionar outra.">
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={`${className} bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors`}>
      <PlusIcon className="w-6 h-6" />
      <span className="text-xs mt-1 text-center px-1">{label}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </button>
  );
};

const VideoUpload: React.FC<{
  onSelect: (video: VideoFile, lastFrame?: ImageFile) => void;
  onRemove?: () => void;
  video?: VideoFile | null;
  label: React.ReactNode;
  isProcessing?: boolean;
}> = ({onSelect, onRemove, video, label, isProcessing}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const videoFile = await fileToVideoFile(file);
        const frame = await extractLastFrame(file);
        onSelect(videoFile, frame);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
  };

  if (video) {
    return (
      <div className="relative w-48 h-28 group">
        <video
          src={URL.createObjectURL(video.file)}
          muted
          loop
          className="w-full h-full object-cover rounded-lg shadow-inner"
        />
        <Tooltip content="Remover o vídeo importado.">
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove video">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isProcessing}
      onClick={() => inputRef.current?.click()}
      className="w-48 h-28 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors text-center disabled:opacity-50">
      {isProcessing ? (
        <div className="w-6 h-6 border-2 border-t-indigo-500 border-gray-500 rounded-full animate-spin"></div>
      ) : (
        <PlusIcon className="w-6 h-6" />
      )}
      <span className="text-xs mt-1 px-2">
        {isProcessing ? 'Extraindo frame...' : label}
      </span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
    </button>
  );
};

const AudioUpload: React.FC<{
    onSelect: (file: File) => void;
    onRemove: () => void;
    audioFile: File | null;
}> = ({ onSelect, onRemove, audioFile }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onSelect(file);
        }
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5">
                <label className="text-xs font-medium text-gray-400">
                    Trilha Sonora (Opcional)
                </label>
                <Tooltip content="O áudio será sincronizado automaticamente com o vídeo gerado para pré-visualização.">
                    <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </Tooltip>
            </div>
            
            {!audioFile ? (
                 <button
                 type="button"
                 onClick={() => inputRef.current?.click()}
                 className="w-full bg-[#1f1f1f] hover:bg-gray-700 border border-dashed border-gray-600 rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors group"
               >
                 <MusicIcon className="w-4 h-4 group-hover:text-indigo-400" />
                 <span className="text-sm">Upload Áudio</span>
                 <input
                   type="file"
                   ref={inputRef}
                   onChange={handleFileChange}
                   accept="audio/*"
                   className="hidden"
                 />
               </button>
            ) : (
                <div className="w-full bg-[#1f1f1f] border border-indigo-500/30 rounded-lg py-2.5 px-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <MusicIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs text-white truncate max-w-[120px]">
                            {audioFile.name}
                        </span>
                    </div>
                    <Tooltip content="Remover o áudio selecionado.">
                      <button
                          type="button"
                          onClick={onRemove}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                          <XMarkIcon className="w-4 h-4" />
                      </button>
                    </Tooltip>
                </div>
            )}
        </div>
    );
};

interface PromptFormProps {
  onGenerate: (params: GenerateVideoParams) => void;
  initialValues?: GenerateVideoParams | null;
}

const PromptForm: React.FC<PromptFormProps> = ({
  onGenerate,
  initialValues,
}) => {
  const [prompt, setPrompt] = useState(initialValues?.prompt ?? '');
  const [model, setModel] = useState<VeoModel>(() => initialValues?.model ?? VeoModel.VEO_FAST);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => initialValues?.aspectRatio ?? AspectRatio.LANDSCAPE);
  const [resolution, setResolution] = useState<Resolution>(() => initialValues?.resolution ?? Resolution.P720);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(() => initialValues?.visualStyle ?? VisualStyle.NONE);
  const [lighting, setLighting] = useState<LightingStyle>(() => initialValues?.lighting ?? LightingStyle.NONE);
  const [cameraMovement, setCameraMovement] = useState<CameraMovement>(() => initialValues?.cameraMovement ?? CameraMovement.NONE);
  const [highFidelity, setHighFidelity] = useState(false);
  const [textureLevel, setTextureLevel] = useState(3);
  const [durationSeconds, setDurationSeconds] = useState(5); // Default to 5s
  const [generationMode, setGenerationMode] = useState<GenerationMode>(initialValues?.mode ?? GenerationMode.TEXT_TO_VIDEO);
  const [startFrame, setStartFrame] = useState<ImageFile | null>(initialValues?.startFrame ?? null);
  const [endFrame, setEndFrame] = useState<ImageFile | null>(initialValues?.endFrame ?? null);
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>(initialValues?.referenceImages ?? []);
  const [styleImage, setStyleImage] = useState<ImageFile | null>(initialValues?.styleImage ?? null);
  const [inputVideo, setInputVideo] = useState<VideoFile | null>(initialValues?.inputVideo ?? null);
  const [inputVideoObject, setInputVideoObject] = useState<Video | null>(initialValues?.inputVideoObject ?? null);
  const [isLooping, setIsLooping] = useState(initialValues?.isLooping ?? false);
  const [audioFile, setAudioFile] = useState<File | null>(initialValues?.audioFile ?? null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialValues) {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (parsed.model) setModel(parsed.model);
                if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
                if (parsed.resolution) setResolution(parsed.resolution);
                if (parsed.visualStyle) setVisualStyle(parsed.visualStyle);
                if (parsed.lighting) setLighting(parsed.lighting);
                if (parsed.cameraMovement) setCameraMovement(parsed.cameraMovement);
                if (parsed.highFidelity !== undefined) setHighFidelity(parsed.highFidelity);
                if (parsed.textureLevel) setTextureLevel(parsed.textureLevel);
                if (parsed.durationSeconds) setDurationSeconds(parsed.durationSeconds);
            }
        } catch (e) {}
    }
  }, [initialValues]);

  useEffect(() => {
    const settings = { model, aspectRatio, resolution, visualStyle, lighting, cameraMovement, highFidelity, textureLevel, durationSeconds };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [model, aspectRatio, resolution, visualStyle, lighting, cameraMovement, highFidelity, textureLevel, durationSeconds]);

  useEffect(() => {
    if (initialValues) {
      setPrompt(initialValues.prompt ?? '');
      setModel(initialValues.model ?? VeoModel.VEO_FAST);
      setAspectRatio(initialValues.aspectRatio ?? AspectRatio.LANDSCAPE);
      setResolution(initialValues.resolution ?? Resolution.P720);
      setVisualStyle(initialValues.visualStyle ?? VisualStyle.NONE);
      setLighting(initialValues.lighting ?? LightingStyle.NONE);
      setCameraMovement(initialValues.cameraMovement ?? CameraMovement.NONE);
      setHighFidelity(initialValues.highFidelity ?? false);
      setTextureLevel(initialValues.textureLevel ?? 3);
      setDurationSeconds(initialValues.durationSeconds ?? 5);
      setGenerationMode(initialValues.mode ?? GenerationMode.TEXT_TO_VIDEO);
      setStartFrame(initialValues.startFrame ?? null);
      setEndFrame(initialValues.endFrame ?? null);
      setReferenceImages(initialValues.referenceImages ?? []);
      setStyleImage(initialValues.styleImage ?? null);
      setInputVideo(initialValues.inputVideo ?? null);
      setInputVideoObject(initialValues.inputVideoObject ?? null);
      setIsLooping(initialValues.isLooping ?? false);
      setAudioFile(initialValues.audioFile ?? null);
    }
  }, [initialValues]);

  useEffect(() => {
    if (generationMode === GenerationMode.EXTEND_VIDEO) {
      setResolution(Resolution.P720);
    }
  }, [generationMode]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeSelectorRef.current && !modeSelectorRef.current.contains(event.target as Node)) {
        setIsModeSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVideoSelectForExtension = (video: VideoFile, frame?: ImageFile) => {
      setInputVideo(video);
      if (frame) {
          setStartFrame(frame);
      }
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const effectiveMode = (generationMode === GenerationMode.EXTEND_VIDEO && !inputVideoObject) 
        ? GenerationMode.IMAGE_TO_VIDEO 
        : generationMode;
      onGenerate({ prompt, model, aspectRatio, resolution, visualStyle, lighting, cameraMovement, highFidelity, textureLevel, durationSeconds, mode: effectiveMode, startFrame, endFrame, referenceImages, styleImage, inputVideo, inputVideoObject, isLooping, audioFile });
    },
    [prompt, model, aspectRatio, resolution, visualStyle, lighting, cameraMovement, highFidelity, textureLevel, durationSeconds, generationMode, startFrame, endFrame, referenceImages, styleImage, inputVideo, inputVideoObject, onGenerate, isLooping, audioFile],
  );

  const handleSelectMode = (mode: GenerationMode) => {
    setGenerationMode(mode);
    setIsModeSelectorOpen(false);
    setStartFrame(null);
    setEndFrame(null);
    setReferenceImages([]);
    setStyleImage(null);
    setInputVideo(null);
    setInputVideoObject(null);
    setIsLooping(false);
  };

  const promptPlaceholder = {
    [GenerationMode.TEXT_TO_VIDEO]: 'Descreva o vídeo que você deseja criar...',
    [GenerationMode.IMAGE_TO_VIDEO]: 'Descreva como a imagem deve se mover...',
    [GenerationMode.FRAMES_TO_VIDEO]: 'Descreva o movimento entre os quadros (opcional)...',
    [GenerationMode.REFERENCES_TO_VIDEO]: 'Descreva o vídeo usando as imagens de referência...',
    [GenerationMode.EXTEND_VIDEO]: 'Descreva o que acontece a seguir na cena...',
  }[generationMode];

  const selectableModes = [
    GenerationMode.TEXT_TO_VIDEO,
    GenerationMode.IMAGE_TO_VIDEO,
    GenerationMode.FRAMES_TO_VIDEO,
    GenerationMode.REFERENCES_TO_VIDEO,
    GenerationMode.EXTEND_VIDEO,
  ];

  const totalReferences = referenceImages.length + (styleImage ? 1 : 0);

  const renderMediaUploads = () => {
    if (generationMode === GenerationMode.IMAGE_TO_VIDEO) {
        return (
            <div className="mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 flex flex-col items-center justify-center gap-4">
                <ImageUpload label="Imagem de Entrada" image={startFrame} onSelect={setStartFrame} onRemove={() => setStartFrame(null)} />
                <p className="text-[10px] text-gray-500 italic">Faça upload de uma imagem e use o prompt para animá-la.</p>
            </div>
        );
    }
    if (generationMode === GenerationMode.FRAMES_TO_VIDEO) {
      return (
        <div className="mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-4">
            <ImageUpload label="Quadro Inicial" image={startFrame} onSelect={setStartFrame} onRemove={() => { setStartFrame(null); setIsLooping(false); }} />
            {!isLooping && (
              <ImageUpload label="Quadro Final" image={endFrame} onSelect={setEndFrame} onRemove={() => setEndFrame(null)} />
            )}
          </div>
          <p className="text-[10px] text-gray-500 italic">Quadros para vídeo requer pelo menos um quadro inicial.</p>
          {startFrame && !endFrame && (
            <div className="mt-1 flex items-center">
              <input id="loop-video-checkbox" type="checkbox" checked={isLooping} onChange={(e) => setIsLooping(e.target.checked)} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-offset-gray-800 cursor-pointer" />
              <label htmlFor="loop-video-checkbox" className="ml-2 text-sm font-medium text-gray-300 cursor-pointer">Criar um vídeo em loop</label>
            </div>
          )}
        </div>
      );
    }
    if (generationMode === GenerationMode.REFERENCES_TO_VIDEO) {
      return (
        <div className="mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 flex flex-col items-center gap-5">
          <div className="w-full">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-3 text-center">Referências de Conteúdo ({referenceImages.length}/3)</label>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {referenceImages.map((img, index) => (
                <ImageUpload key={index} image={img} label="" onSelect={() => {}} onRemove={() => setReferenceImages((imgs) => imgs.filter((_, i) => i !== index))} />
              ))}
              {totalReferences < 3 && (
                <ImageUpload label="Novo Recurso" onSelect={(img) => setReferenceImages((imgs) => [...imgs, img])} />
              )}
            </div>
          </div>
        </div>
      );
    }
    if (generationMode === GenerationMode.EXTEND_VIDEO) {
      return (
        <div className="mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-6">
              <VideoUpload label="Importar Vídeo" video={inputVideo} onSelect={handleVideoSelectForExtension} onRemove={() => { setInputVideo(null); setInputVideoObject(null); setStartFrame(null); }} isProcessing={isProcessingVideo} />
              {startFrame && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-28 h-20 rounded-lg overflow-hidden border border-indigo-500/50 relative shadow-lg shadow-indigo-500/10">
                        <img src={URL.createObjectURL(startFrame.file)} className="w-full h-full object-cover" />
                        <div className="absolute top-0 left-0 bg-indigo-600 text-[8px] font-bold text-white px-1 py-0.5 rounded-br">FIM DO VÍDEO</div>
                    </div>
                  </div>
              )}
          </div>
        </div>
      );
    }
    return null;
  };

  const isExtendMode = generationMode === GenerationMode.EXTEND_VIDEO;
  let isSubmitDisabled = false;

  switch (generationMode) {
    case GenerationMode.TEXT_TO_VIDEO: isSubmitDisabled = !prompt.trim(); break;
    case GenerationMode.IMAGE_TO_VIDEO: isSubmitDisabled = !startFrame || !prompt.trim(); break;
    case GenerationMode.FRAMES_TO_VIDEO: isSubmitDisabled = !startFrame; break;
    case GenerationMode.REFERENCES_TO_VIDEO: isSubmitDisabled = !prompt.trim() || referenceImages.length === 0; break;
    case GenerationMode.EXTEND_VIDEO: isSubmitDisabled = (!inputVideoObject && !inputVideo) || !prompt.trim(); break;
  }

  return (
    <div className="relative w-full">
      {isSettingsOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-3 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
            <CustomSelect label="Modelo" value={model} onChange={(e) => setModel(e.target.value as VeoModel)} icon={<SparklesIcon className="w-5 h-5 text-gray-400" />}>
              {Object.values(VeoModel).map((v) => <option key={v} value={v}>{v === VeoModel.VEO ? 'Alta Qualidade (Veo 3.1)' : 'Rápido (Veo 3.1)'}</option>)}
            </CustomSelect>
            <CustomSelect label="Proporção" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} icon={<RectangleStackIcon className="w-5 h-5 text-gray-400" />}>
              {Object.entries(aspectRatioDisplayNames).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </CustomSelect>
            <CustomSelect label="Resolução" value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)} icon={<TvIcon className="w-5 h-5 text-gray-400" />} disabled={isExtendMode}>
              <option value={Resolution.P720}>720p</option>
              <option value={Resolution.P1080}>1080p</option>
              <option value={Resolution.P4K}>4K</option>
            </CustomSelect>
            <CustomSelect label="Estilo Visual" value={visualStyle} onChange={(e) => setVisualStyle(e.target.value as VisualStyle)} icon={<SparklesIcon className="w-5 h-5 text-pink-400" />}>
              {Object.values(VisualStyle).map((s) => <option key={s} value={s}>{s}</option>)}
            </CustomSelect>
            <CustomSelect label="Iluminação" value={lighting} onChange={(e) => setLighting(e.target.value as LightingStyle)} icon={<SparklesIcon className="w-5 h-5 text-amber-400" />}>
              {Object.values(LightingStyle).map((l) => <option key={l} value={l}>{l}</option>)}
            </CustomSelect>
            <CustomSelect label="Câmera" value={cameraMovement} onChange={(e) => setCameraMovement(e.target.value as CameraMovement)} icon={<FilmIcon className="w-5 h-5 text-blue-400" />}>
              {Object.values(CameraMovement).map((c) => <option key={c} value={c}>{c}</option>)}
            </CustomSelect>
            
            <AudioUpload onSelect={setAudioFile} onRemove={() => setAudioFile(null)} audioFile={audioFile} />
            
            {/* Texture Level Slider */}
            <div className="flex flex-col justify-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
               <div className="flex items-center gap-2 mb-2">
                 <label className="text-sm font-semibold text-gray-200">Nível de Textura: <span className="text-indigo-400">{textureLevel}</span></label>
                 <Tooltip content="Ajuste o nível de detalhes da superfície. 1 = Suave, 5 = Detalhes Extremos.">
                    <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                 </Tooltip>
               </div>
               <input type="range" min="1" max="5" step="1" value={textureLevel} onChange={(e) => setTextureLevel(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            </div>

            {/* Duration Slider */}
            <div className="flex flex-col justify-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
               <div className="flex items-center gap-2 mb-2">
                 <label className="text-sm font-semibold text-gray-200">Duração: <span className="text-indigo-400">{durationSeconds}s</span></label>
                 <Tooltip content="Define o tempo total da cena gerada (entre 1 e 8 segundos).">
                    <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                 </Tooltip>
               </div>
               <input type="range" min="1" max="8" step="1" value={durationSeconds} onChange={(e) => setDurationSeconds(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            </div>

            <div className="flex items-center justify-between col-span-1 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
               <label htmlFor="high-fidelity-toggle" className="text-sm font-semibold text-gray-200 cursor-pointer">Alta Fidelidade</label>
               <input type="checkbox" id="high-fidelity-toggle" className="w-4 h-4" checked={highFidelity} onChange={(e) => setHighFidelity(e.target.checked)} />
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full">
        {renderMediaUploads()}
        <div className="flex items-end gap-2 bg-[#1f1f1f] border border-gray-600 rounded-2xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500">
          <div className="relative" ref={modeSelectorRef}>
            <Tooltip content="Mudar o modo de geração (Texto, Imagem, Frame ou Extensão).">
              <button type="button" onClick={() => setIsModeSelectorOpen((prev) => !prev)} className="flex shrink-0 items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors">
                {modeIcons[generationMode]}
                <span className="font-medium text-sm whitespace-nowrap">{modeLabels[generationMode]}</span>
              </button>
            </Tooltip>
            {isModeSelectorOpen && (
              <div className="absolute bottom-full mb-2 w-64 bg-[#2c2c2e] border border-gray-600 rounded-lg shadow-xl z-30 flex flex-col p-1">
                {selectableModes.map((mode) => (
                    <button key={mode} type="button" onClick={() => handleSelectMode(mode)} className={`w-full text-left flex items-center gap-3 p-3 rounded-md hover:bg-indigo-600/50 transition-colors ${generationMode === mode ? 'bg-indigo-600/30 text-white' : 'text-gray-300'}`}>
                      {modeIcons[mode]}
                      <span>{modeLabels[mode]}</span>
                    </button>
                ))}
              </div>
            )}
          </div>
          <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={promptPlaceholder} className="flex-grow bg-transparent focus:outline-none resize-none text-base text-gray-200 placeholder-gray-500 max-h-48 py-2" rows={1} />
          
          <Tooltip content="Ajustar modelo, resolução, estilos e controles criativos.">
            <button type="button" onClick={() => setIsSettingsOpen((prev) => !prev)} className={`p-2.5 rounded-full hover:bg-gray-700 transition-colors ${isSettingsOpen ? 'bg-indigo-600/50 text-white border border-indigo-500/50' : 'text-gray-300'}`}>
              <SlidersHorizontalIcon className="w-5 h-5" />
            </button>
          </Tooltip>

          <div className="relative group">
            <Tooltip content="Processar parâmetros e iniciar a geração do vídeo via IA.">
              <button type="submit" className="p-2.5 bg-indigo-600 rounded-full hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all active:scale-95" disabled={isSubmitDisabled}>
                <ArrowRightIcon className="w-5 h-5 text-white" />
              </button>
            </Tooltip>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromptForm;
