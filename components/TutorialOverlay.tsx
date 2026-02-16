
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
} from './icons';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({onDismiss}) => {
  const features = [
    {
      icon: <TextModeIcon className="w-6 h-6 text-pink-400" />,
      title: 'Texto para Vídeo',
      description:
        'Gere vídeos de alta fidelidade a partir de descrições em texto. Suporta resoluções 1080p e 4K.',
    },
    {
      icon: <FileImageIcon className="w-6 h-6 text-emerald-400" />,
      title: 'Imagem para Vídeo',
      description:
        'Dê vida a uma imagem estática. Faça upload de uma foto e descreva como ela deve se mover.',
    },
    {
      icon: <FramesModeIcon className="w-6 h-6 text-purple-400" />,
      title: 'Quadros para Vídeo',
      description:
        'Controle o movimento definindo um quadro inicial, um quadro final opcional, ou crie loops perfeitos.',
    },
    {
      icon: <ReferencesModeIcon className="w-6 h-6 text-indigo-400" />,
      title: 'Referências para Vídeo',
      description:
        'Use imagens de referência para manter a consistência de personagens e estilo visual em toda a cena.',
    },
    {
      icon: <FilmIcon className="w-6 h-6 text-blue-400" />,
      title: 'Extender Vídeo',
      description:
        'Pegue qualquer vídeo gerado em 720p e adicione mais 7 segundos para contar uma história mais longa.',
    },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#18181b] border border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 md:p-8 text-center bg-gradient-to-b from-[#1f1f23] to-[#18181b] border-b border-gray-800 shrink-0">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/20 mb-4 ring-1 ring-indigo-500/50">
                <GraduationCapIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Bem-vindo ao VitrineX Veo
            </h2>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
            Crie vídeos cinematográficos impressionantes usando o poder do Gemini Veo 3.1. Veja o que você pode fazer:
            </p>
        </div>

        {/* Content Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#18181b] overflow-y-auto">
          {features.map((feature, idx) => (
            <div key={idx} className="flex gap-4 items-start group">
              <div className="shrink-0 p-3 bg-gray-800 rounded-lg border border-gray-700 group-hover:border-gray-600 transition-colors">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 text-sm mb-1 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-[#1f1f23] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <p className="text-xs text-gray-500">
            Você pode redefinir este tutorial limpando os dados do navegador.
          </p>
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
          >
            Começar Agora
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
