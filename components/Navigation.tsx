
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { HomeIcon, LayoutGridIcon, SettingsIcon } from './icons';
import Tooltip from './Tooltip';

interface NavigationProps {
  currentView: 'home' | 'studio' | 'settings';
  onNavigate: (view: 'home' | 'studio' | 'settings') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Início', icon: HomeIcon, tooltip: 'Voltar para a tela inicial e galeria de templates.' },
    { id: 'studio', label: 'Estúdio', icon: LayoutGridIcon, tooltip: 'Área de criação e ferramentas de geração de vídeo.' },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon, tooltip: 'Gerenciar chaves de API e preferências do sistema.' },
  ] as const;

  return (
    <nav className="flex items-center justify-center py-4 px-6 border-b border-gray-800 bg-[#18181b]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex bg-[#27272a] rounded-full p-1 border border-gray-700 shadow-lg">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <Tooltip key={item.id} content={item.tooltip}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.label}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
