
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useState} from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import {CurvedArrowDownIcon} from './components/icons';
import LoadingIndicator from './components/LoadingIndicator';
import PromptForm from './components/PromptForm';
import VideoResult from './components/VideoResult';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import GalleryPage from './components/GalleryPage';
import SettingsPage from './components/SettingsPage';
import TutorialOverlay from './components/TutorialOverlay';
import {generateVideo} from './services/geminiService';
import {
  AppState,
  AspectRatio,
  GenerateVideoParams,
  GenerationMode,
  Resolution,
  VideoFile,
} from './types';

type ViewState = 'home' | 'studio' | 'gallery' | 'settings';

const TUTORIAL_DISMISSED_KEY = 'veo_tutorial_dismissed';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Studio State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastConfig, setLastConfig] = useState<GenerateVideoParams | null>(
    null,
  );
  const [lastVideoObject, setLastVideoObject] = useState<Video | null>(null);
  const [lastVideoBlob, setLastVideoBlob] = useState<Blob | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const [initialFormValues, setInitialFormValues] =
    useState<GenerateVideoParams | null>(null);

  useEffect(() => {
    const checkTutorial = () => {
      const dismissed = localStorage.getItem(TUTORIAL_DISMISSED_KEY);
      if (!dismissed && currentView === 'studio') {
        setShowTutorial(true);
      }
    };
    checkTutorial();
  }, [currentView]);

  useEffect(() => {
    const checkApiKey = async () => {
      // Check for manual key first
      const manualKey = localStorage.getItem('veo_api_key');
      if (manualKey) return; // We have a key, no need to nag

      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            // Only prompt strictly if we are in studio mode
          }
        } catch (error) {
          console.warn('API check failed', error);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleDismissTutorial = () => {
    localStorage.setItem(TUTORIAL_DISMISSED_KEY, 'true');
    setShowTutorial(false);
  };

  const showStatusError = (message: string) => {
    setErrorMessage(message);
    setAppState(AppState.ERROR);
  };

  const handleGenerate = useCallback(async (params: GenerateVideoParams) => {
    // 1. Check for manual key in storage and sanitize
    const storedKey = localStorage.getItem('veo_api_key');
    const manualKey = storedKey ? storedKey.trim() : null;
    
    // 2. If no manual key, check AI Studio environment
    if (!manualKey && window.aistudio) {
      try {
        if (!(await window.aistudio.hasSelectedApiKey())) {
          setShowApiKeyDialog(true);
          return;
        }
      } catch (error) {
        console.warn(
          'aistudio.hasSelectedApiKey check failed, assuming no key selected.',
          error,
        );
        setShowApiKeyDialog(true);
        return;
      }
    } else if (!manualKey && !window.aistudio && !process.env.API_KEY) {
        // If not in AI Studio, not manual key, and no env key (fallback), force dialog
        setShowApiKeyDialog(true);
        return;
    }

    setAppState(AppState.LOADING);
    setErrorMessage(null);
    
    // Inject key into params
    const paramsWithKey = { ...params, apiKey: manualKey || undefined };

    setLastConfig(paramsWithKey);
    setInitialFormValues(null);

    try {
      const {objectUrl, blob, video} = await generateVideo(paramsWithKey);
      setVideoUrl(objectUrl);
      setLastVideoBlob(blob);
      setLastVideoObject(video);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error('Video generation failed:', error);
      
      let rawErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      
      // Attempt to parse JSON error message from SDK
      try {
        // Sometimes the error message is a JSON string: '{"error": ...}'
        const jsonError = JSON.parse(rawErrorMessage);
        if (jsonError.error && jsonError.error.message) {
          rawErrorMessage = jsonError.error.message;
        }
      } catch (e) {
        // Not a JSON string, stick with the raw message
      }

      let userFriendlyMessage = `Video generation failed: ${rawErrorMessage}`;
      let shouldOpenDialog = false;

      if (
        rawErrorMessage.includes('Requested entity was not found.') ||
        rawErrorMessage.includes('404')
      ) {
        userFriendlyMessage =
          'Modelo não encontrado. Verifique se sua chave de API tem acesso ao modelo Veo.';
        shouldOpenDialog = true;
      } else if (
        rawErrorMessage.includes('API_KEY_INVALID') ||
        rawErrorMessage.includes('API key not valid') ||
        rawErrorMessage.toLowerCase().includes('permission denied') ||
        rawErrorMessage.toLowerCase().includes('permission_denied') ||
        rawErrorMessage.includes('403') || 
        rawErrorMessage.includes('API Key is missing')
      ) {
        userFriendlyMessage =
          'Acesso negado (403). Sua chave de API não tem permissão para acessar o modelo Veo ou é inválida. Por favor, insira uma chave com acesso habilitado.';
        shouldOpenDialog = true;
        
        // If it was a manual key that failed, consider clearing it or warning the user
        // We won't auto-clear to avoid frustration, but the dialog allows changing it.
      }

      setErrorMessage(userFriendlyMessage);
      setAppState(AppState.ERROR);

      if (shouldOpenDialog) {
        setShowApiKeyDialog(true);
      }
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastConfig) {
      handleGenerate(lastConfig);
    }
  }, [lastConfig, handleGenerate]);

  const handleApiKeyDialogContinue = async (manualKeyInput?: string) => {
    setShowApiKeyDialog(false);
    
    if (manualKeyInput) {
        // If user entered a key manually in the dialog, we retry immediately
        if (appState === AppState.ERROR && lastConfig) {
            handleGenerate({ ...lastConfig, apiKey: manualKeyInput });
        }
        return;
    }

    // Fallback to auto selector
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    
    if (appState === AppState.ERROR && lastConfig) {
      handleRetry();
    }
  };

  const handleNewVideo = useCallback(() => {
    setAppState(AppState.IDLE);
    setVideoUrl(null);
    setErrorMessage(null);
    setLastConfig(null);
    setLastVideoObject(null);
    setLastVideoBlob(null);
    setInitialFormValues(null);
  }, []);

  const handleTryAgainFromError = useCallback(() => {
    if (lastConfig) {
      setInitialFormValues(lastConfig);
      setAppState(AppState.IDLE);
      setErrorMessage(null);
    } else {
      handleNewVideo();
    }
  }, [lastConfig, handleNewVideo]);

  const handleExtend = useCallback(async () => {
    if (lastConfig && lastVideoBlob && lastVideoObject) {
      try {
        const file = new File([lastVideoBlob], 'last_video.mp4', {
          type: lastVideoBlob.type,
        });
        const videoFile: VideoFile = {file, base64: ''};

        setInitialFormValues({
          ...lastConfig,
          mode: GenerationMode.EXTEND_VIDEO,
          prompt: '', 
          inputVideo: videoFile, 
          inputVideoObject: lastVideoObject, 
          resolution: Resolution.P720, 
          startFrame: null,
          endFrame: null,
          referenceImages: [],
          styleImage: null,
          isLooping: false,
          audioFile: null,
        });

        setAppState(AppState.IDLE);
        setVideoUrl(null);
        setErrorMessage(null);
      } catch (error) {
        console.error('Failed to process video for extension:', error);
        const message =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        showStatusError(`Failed to prepare video for extension: ${message}`);
      }
    }
  }, [lastConfig, lastVideoBlob, lastVideoObject]);

  const renderError = (message: string) => (
    <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-lg max-w-2xl">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Erro</h2>
      <p className="text-red-300 mb-6 whitespace-pre-wrap">{message}</p>
      <div className="flex gap-4 justify-center">
        <button
            onClick={handleTryAgainFromError}
            className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors text-white">
            Tentar Novamente
        </button>
        <button
            onClick={() => setShowApiKeyDialog(true)}
            className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-white">
            Trocar API Key
        </button>
      </div>
    </div>
  );

  const canExtend = lastConfig?.resolution === Resolution.P720;

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onStart={(params) => {
          if (params) setInitialFormValues(params as GenerateVideoParams);
          setCurrentView('studio');
        }} />;
      case 'gallery':
        return <GalleryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'studio':
        return (
          <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {showTutorial && <TutorialOverlay onDismiss={handleDismissTutorial} />}
             {appState === AppState.IDLE ? (
              <>
                <div className="flex-grow flex items-center justify-center min-h-[400px]">
                  <div className="relative text-center">
                    <h2 className="text-3xl text-gray-600">
                      Digite seu prompt para começar
                    </h2>
                    <CurvedArrowDownIcon className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-24 h-24 text-gray-700 opacity-60" />
                  </div>
                </div>
                <div className="pb-4">
                  <PromptForm
                    onGenerate={handleGenerate}
                    initialValues={initialFormValues}
                  />
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                {appState === AppState.LOADING && <LoadingIndicator />}
                {appState === AppState.SUCCESS && videoUrl && (
                  <VideoResult
                    videoUrl={videoUrl}
                    config={lastConfig}
                    onRetry={handleRetry}
                    onNewVideo={handleNewVideo}
                    onExtend={handleExtend}
                    canExtend={canExtend}
                    aspectRatio={lastConfig?.aspectRatio || AspectRatio.LANDSCAPE}
                  />
                )}
                {appState === AppState.SUCCESS &&
                  !videoUrl &&
                  renderError(
                    'Vídeo gerado, mas a URL está ausente. Tente novamente.',
                  )}
                {appState === AppState.ERROR &&
                  errorMessage &&
                  renderError(errorMessage)}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-black text-gray-200 flex flex-col font-sans overflow-hidden">
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}
      
      <Navigation currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-grow flex flex-col overflow-y-auto custom-scrollbar">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
