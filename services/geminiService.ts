
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
  Video,
  VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from '@google/genai';
import {GenerateVideoParams, GenerationMode, VisualStyle, LightingStyle, CameraMovement} from '../types';

const stylePrompts: Record<VisualStyle, string> = {
  [VisualStyle.NONE]: '',
  [VisualStyle.CINEMATIC]: 'cinematic style, high budget movie look, professional color grading, anamorphic lens',
  [VisualStyle.REALISTIC]: 'photorealistic, 8k resolution, highly detailed textures, visible skin pores, realistic fabric texture, raw photography style, sharp focus, uncompressed, hyper-realistic',
  [VisualStyle.ANIME]: 'anime style, japanese animation, vibrant colors, studio ghibli inspired, 2D animation',
  [VisualStyle.VINTAGE]: 'vintage 8mm film look, film grain, retro aesthetic, color bleed, analog style',
  [VisualStyle.CYBERPUNK]: 'cyberpunk aesthetic, futuristic, high tech low life, chromatic aberration',
  [VisualStyle.RENDER_3D]: '3d render, unreal engine 5, ray tracing, cgi, octane render',
  [VisualStyle.PAINTING]: 'oil painting style, textured brushstrokes, artistic, canvas texture',
};

const lightingPrompts: Record<LightingStyle, string> = {
  [LightingStyle.NONE]: '',
  [LightingStyle.NATURAL]: 'natural lighting, soft ambient light, realistic shadows',
  [LightingStyle.GOLDEN_HOUR]: 'golden hour lighting, warm sun, sunset vibes, rim light, volumetric lighting',
  [LightingStyle.STUDIO]: 'studio lighting, professional three-point lighting, clean, well lit',
  [LightingStyle.NEON]: 'neon lighting, vibrant glow, atmospheric, colored lights',
  [LightingStyle.DRAMATIC]: 'dramatic lighting, high contrast, chiaroscuro, hard shadows',
  [LightingStyle.LOW_KEY]: 'low key lighting, dark atmosphere, moody, silhouette',
};

const cameraPrompts: Record<CameraMovement, string> = {
  [CameraMovement.NONE]: '',
  [CameraMovement.STATIC]: 'static camera shot, tripod, stable',
  [CameraMovement.PAN]: 'slow camera pan, smooth lateral motion',
  [CameraMovement.ZOOM_IN]: 'slow zoom in, focal length change',
  [CameraMovement.ZOOM_OUT]: 'slow zoom out, revealing shot',
  [CameraMovement.DRONE]: 'drone shot, aerial view, smooth flying, birds eye view',
  [CameraMovement.HANDHELD]: 'handheld camera movement, slightly shaky, realistic documentary feel',
};

const texturePrompts: Record<number, string> = {
  1: 'very smooth skin, airbrushed look, soft textures, noise reduction, clean surfaces, dreamy look',
  2: 'smooth textures, soft details, refined look, subtle grain',
  3: '', // Natural / Default - let the model decide or use other styles
  4: 'detailed textures, visible surface details, crisp look, enhanced clarity',
  5: 'extreme texture detail, visible pores, rough surfaces, raw texture, microscopic detail, tactile structure, grit, sharp micro-contrast'
};

export const generateVideo = async (
  params: GenerateVideoParams,
): Promise<{objectUrl: string; blob: Blob; uri: string; video: Video}> => {
  console.log('Starting video generation with params:', params);

  // Prioritize manual key if provided, otherwise fallback to env
  let apiKey = params.apiKey;
  
  if (!apiKey && process.env.API_KEY) {
    apiKey = process.env.API_KEY;
  }

  if (apiKey) {
    apiKey = apiKey.trim();
  }
  
  if (!apiKey) {
      throw new Error("API Key is missing. Please provide a valid key in Settings.");
  }

  const ai = new GoogleGenAI({apiKey: apiKey});

  const config: any = {
    numberOfVideos: 1,
    resolution: params.resolution,
    durationSeconds: params.durationSeconds, // Inject exact duration
  };

  // Conditionally add aspect ratio. It's not used for extending videos.
  if (params.mode !== GenerationMode.EXTEND_VIDEO) {
    config.aspectRatio = params.aspectRatio;
  }

  const generateVideoPayload: any = {
    model: params.model,
    config: config,
  };

  // Construct Enhanced Prompt
  let finalPrompt = params.prompt || '';
  
  const modifiers: string[] = [];
  
  // Logic for Texture Level (1-5)
  if (params.textureLevel && params.textureLevel !== 3) {
      modifiers.push(texturePrompts[params.textureLevel]);
  }

  // Logic for High Fidelity Mode
  if (params.highFidelity) {
    modifiers.push('hyper-realistic details, 8k resolution, maintain exact character features, preserve facial identity, sharp details, no blurring, high fidelity textures');
  }

  if (params.visualStyle && params.visualStyle !== VisualStyle.NONE) {
    modifiers.push(stylePrompts[params.visualStyle]);
  }
  if (params.lighting && params.lighting !== LightingStyle.NONE) {
    modifiers.push(lightingPrompts[params.lighting]);
  }
  if (params.cameraMovement && params.cameraMovement !== CameraMovement.NONE) {
    modifiers.push(cameraPrompts[params.cameraMovement]);
  }

  if (modifiers.length > 0) {
    const prefix = finalPrompt.trim().length > 0 ? ', ' : '';
    finalPrompt += prefix + modifiers.join(', ');
  }

  if (finalPrompt) {
    generateVideoPayload.prompt = finalPrompt;
    console.log('Enhanced Prompt sent to API:', finalPrompt);
  }

  if (params.mode === GenerationMode.FRAMES_TO_VIDEO || params.mode === GenerationMode.IMAGE_TO_VIDEO) {
    if (params.startFrame) {
      generateVideoPayload.image = {
        imageBytes: params.startFrame.base64,
        mimeType: params.startFrame.file.type,
      };
    }

    if (params.mode === GenerationMode.FRAMES_TO_VIDEO) {
      const finalEndFrame = params.isLooping
        ? params.startFrame
        : params.endFrame;
      if (finalEndFrame) {
        generateVideoPayload.config.lastFrame = {
          imageBytes: finalEndFrame.base64,
          mimeType: finalEndFrame.file.type,
        };
      }
    }
  } else if (params.mode === GenerationMode.REFERENCES_TO_VIDEO) {
    const referenceImagesPayload: VideoGenerationReferenceImage[] = [];

    if (params.referenceImages) {
      for (const img of params.referenceImages) {
        referenceImagesPayload.push({
          image: {
            imageBytes: img.base64,
            mimeType: img.file.type,
          },
          referenceType: VideoGenerationReferenceType.ASSET,
        });
      }
    }

    if (params.styleImage) {
      referenceImagesPayload.push({
        image: {
          imageBytes: params.styleImage.base64,
          mimeType: params.styleImage.file.type,
        },
        referenceType: VideoGenerationReferenceType.STYLE,
      });
    }

    if (referenceImagesPayload.length > 0) {
      generateVideoPayload.config.referenceImages = referenceImagesPayload;
    }
  } else if (params.mode === GenerationMode.EXTEND_VIDEO) {
    if (params.inputVideoObject) {
      generateVideoPayload.video = params.inputVideoObject;
    } else {
      throw new Error('An input video object is required to extend a video.');
    }
  }

  let operation = await ai.models.generateVideos(generateVideoPayload);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  if (operation?.response) {
    const videos = operation.response.generatedVideos;

    if (!videos || videos.length === 0) {
      throw new Error('No videos were generated.');
    }

    const firstVideo = videos[0];
    if (!firstVideo?.video?.uri) {
      throw new Error('Generated video is missing a URI.');
    }
    const videoObject = firstVideo.video;

    const url = decodeURIComponent(videoObject.uri);
    const res = await fetch(`${url}&key=${apiKey}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }

    const videoBlob = await res.blob();
    const objectUrl = URL.createObjectURL(videoBlob);

    return {objectUrl, blob: videoBlob, uri: url, video: videoObject};
  } else {
    throw new Error('No videos generated.');
  }
};
