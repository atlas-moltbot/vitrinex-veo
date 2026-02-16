
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum VeoModel {
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO = 'veo-3.1-generate-preview',
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
  P4K = '4k',
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  IMAGE_TO_VIDEO = 'Image to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
  EXTEND_VIDEO = 'Extend Video',
}

export enum VisualStyle {
  NONE = 'Nenhum',
  CINEMATIC = 'Cinemático',
  REALISTIC = 'Fotorealista (Ultra Textura)',
  ANIME = 'Anime',
  VINTAGE = 'Vintage (Filme 8mm)',
  CYBERPUNK = 'Cyberpunk',
  RENDER_3D = 'Render 3D (Unreal Engine)',
  PAINTING = 'Pintura a Óleo',
}

export enum LightingStyle {
  NONE = 'Nenhum',
  NATURAL = 'Luz Natural',
  GOLDEN_HOUR = 'Golden Hour (Pôr do Sol)',
  STUDIO = 'Luz de Estúdio',
  NEON = 'Luzes Neon',
  DRAMATIC = 'Dramático/Cinematográfico',
  LOW_KEY = 'Low Key (Escuro)',
}

export enum CameraMovement {
  NONE = 'Nenhum',
  STATIC = 'Estático (Tripé)',
  PAN = 'Panorâmica Suave',
  ZOOM_IN = 'Zoom In Lento',
  ZOOM_OUT = 'Zoom Out',
  DRONE = 'Voo de Drone',
  HANDHELD = 'Câmera na Mão',
}

export interface ImageFile {
  file: File;
  base64: string;
}

export interface VideoFile {
  file: File;
  base64: string;
}

export interface GenerateVideoParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  mode: GenerationMode;
  visualStyle?: VisualStyle;
  lighting?: LightingStyle;
  cameraMovement?: CameraMovement;
  highFidelity?: boolean;
  textureLevel?: number; // 1 (Smooth) to 5 (Rough/Detailed)
  durationSeconds?: number; // 1 to 8 seconds
  startFrame?: ImageFile | null;
  endFrame?: ImageFile | null;
  referenceImages?: ImageFile[];
  styleImage?: ImageFile | null;
  inputVideo?: VideoFile | null;
  inputVideoObject?: Video | null;
  isLooping?: boolean;
  apiKey?: string;
  audioFile?: File | null; // Optional audio file for pass-through
}
