
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  FilmIcon,
  FramesModeIcon,
  FileImageIcon,
  GraduationCapIcon,
  ReferencesModeIcon,
  TextModeIcon,
  ArrowRightIcon,
  SparklesIcon,
  TvIcon,
  RectangleStackIcon,
  SlidersHorizontalIcon
} from './icons';
import { GenerateVideoParams, GenerationMode, VeoModel, AspectRatio, Resolution, VisualStyle, LightingStyle, CameraMovement } from '../types';
import Tooltip from './Tooltip';

interface HomePageProps {
  onStart: (initialParams?: Partial<GenerateVideoParams>) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  const creativeStarters = [
    {
      title: 'Continuar História',
      description: 'Importe um vídeo e gere a sequência perfeita a partir do último quadro.',
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30',
      icon: <FilmIcon className="w-6 h-6 text-cyan-400" />,
      tag: 'NOVO',
      params: {
        mode: GenerationMode.EXTEND_VIDEO,
        resolution: Resolution.P720,
      }
    },
    {
      title: 'Realismo Fotográfico',
      description: 'Crie cenas com texturas ultra-detalhadas e iluminação de estúdio.',
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      icon: <TvIcon className="w-6 h-6 text-emerald-400" />,
      params: {
        prompt: 'Extreme close up of a high-tech mechanical eye reflecting a futuristic city, macro photography, ultra detailed textures, 8k resolution, cinematic lighting.',
        visualStyle: VisualStyle.REALISTIC,
        lighting: LightingStyle.STUDIO,
        cameraMovement: CameraMovement.STATIC,
        highFidelity: true,
        textureLevel: 5
      }
    },
    {
      title: 'Consistência Visual',
      description: 'Use assets de referência para manter personagens e estilos iguais.',
      color: 'from-indigo-500/20 to-purple-500/20',
      borderColor: 'border-indigo-500/30',
      icon: <ReferencesModeIcon className="w-6 h-6 text-indigo-400" />,
      params: {
        mode: GenerationMode.REFERENCES_TO_VIDEO,
        prompt: 'The protagonist walking through the neon streets, maintaining character features from the reference images, cinematic wide shot.',
        visualStyle: VisualStyle.CYBERPUNK,
      }
    },
    {
      title: 'Animação Estilizada',
      description: 'Transforme conceitos em mundos de Anime ou Pintura vibrante.',
      color: 'from-pink-500/20 to-orange-500/20',
      borderColor: 'border-pink-500/30',
      icon: <SparklesIcon className="w-6 h-6 text-pink-400" />,
      params: {
        prompt: 'A magical library where books are flying and glowing, soft watercolor textures, Ghibli style, peaceful atmosphere, floating dust particles.',
        visualStyle: VisualStyle.ANIME,
        lighting: LightingStyle.NATURAL,
        cameraMovement: CameraMovement.PAN
      }
    }
  ];

  const features = [
    {
      icon: <TextModeIcon className="w-5 h-5" />,
      title: 'Prompt-to-Reality',
      desc: 'Modelos Veo 3.1 otimizados para entender nuances cinematográficas.'
    },
    {
      icon: <RectangleStackIcon className="w-5 h-5" />,
      title: 'Controle de Proporção',
      desc: 'Gere nativamente em 16:9 para cinema ou 9:16 para redes sociais.'
    },
    {
      icon: <SlidersHorizontalIcon className="w-5 h-5" />,
      title: 'Ajuste de Grão',
      desc: 'Controle granular de textura, desde o "dreamy" até o "raw detailed".'
    }
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-6 py-12 space-y-24 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-12 relative w-full">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] -z-10 rounded-full"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-4 animate-in slide-in-from-top-4 duration-1000">
            <SparklesIcon className="w-4 h-4" />
            Powered by Veo 3.1
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">Crie o Impossível.</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Gere com Veo.</span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
          VitrineX Veo combina a potência do Gemini com ferramentas de precisão cinematográfica. 
          De scripts curtos a extensões complexas, sua visão ganha vida em segundos.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
                onClick={() => onStart()}
                className="group relative px-10 py-5 bg-white text-black hover:bg-gray-100 font-bold text-lg rounded-2xl transition-all active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] flex items-center gap-3"
            >
                Entrar no Estúdio
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
                onClick={() => document.getElementById('creative-starters')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-5 bg-gray-900/50 hover:bg-gray-800 text-white font-semibold text-lg rounded-2xl border border-gray-700 transition-all active:scale-95"
            >
                Ver Templates
            </button>
        </div>
      </section>

      {/* Feature Pills */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-gray-900/20 border border-gray-800/50 hover:border-indigo-500/30 transition-colors group">
                <div className="p-3 bg-gray-800/50 rounded-xl text-gray-400 group-hover:text-indigo-400 transition-colors">
                    {f.icon}
                </div>
                <h3 className="font-bold text-gray-200">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
        ))}
      </section>

      {/* Creative Starters Grid */}
      <section id="creative-starters" className="w-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white">Atalhos Criativos</h2>
                <p className="text-gray-400">Comece com configurações pré-ajustadas para resultados profissionais.</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creativeStarters.map((starter, idx) => (
                <button
                    key={idx}
                    onClick={() => onStart(starter.params)}
                    className={`group relative text-left p-8 rounded-[2.5rem] border ${starter.borderColor} bg-gradient-to-br ${starter.color} hover:scale-[1.03] transition-all duration-300 shadow-2xl overflow-hidden flex flex-col h-full`}
                >
                    {/* Background Icon Decoration */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform -rotate-12 scale-150">
                        {starter.icon}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                {starter.icon}
                            </div>
                            {starter.tag && (
                                <span className="px-2 py-1 bg-cyan-500 text-[10px] font-black text-black rounded-lg">
                                    {starter.tag}
                                </span>
                            )}
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{starter.title}</h3>
                        <p className="text-sm text-gray-300/80 mb-8 leading-relaxed flex-grow">
                            {starter.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-white font-bold text-sm group-hover:gap-4 transition-all mt-auto">
                            Usar este Fluxo
                            <ArrowRightIcon className="w-4 h-4" />
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </section>

      {/* Footer Info */}
      <section className="w-full pt-12 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-8 text-gray-500 text-sm">
        <div className="flex items-center gap-3">
            <GraduationCapIcon className="w-5 h-5" />
            <span>Versão 1.0 Alpha • Studio Edition</span>
        </div>
        <div className="flex gap-8">
            <Tooltip content="Documentação técnica da API Veo">
                <a href="https://ai.google.dev/gemini-api/docs" target="_blank" className="hover:text-white transition-colors">Docs API</a>
            </Tooltip>
            <Tooltip content="Configurações de faturamento e limites">
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-white transition-colors">Billing Info</a>
            </Tooltip>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
