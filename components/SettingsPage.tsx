
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { KeyIcon } from './icons';
import Tooltip from './Tooltip';

const SettingsPage: React.FC = () => {
  const [hasCloudKey, setHasCloudKey] = useState<boolean | null>(null);
  const [manualKey, setManualKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    checkCloudKeyStatus();
    const storedKey = localStorage.getItem('veo_api_key');
    if (storedKey) {
        setManualKey(storedKey);
    }
  }, []);

  const checkCloudKeyStatus = async () => {
    if (window.aistudio) {
      try {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasCloudKey(selected);
      } catch (e) {
        setHasCloudKey(false);
      }
    } else {
        setHasCloudKey(false);
    }
  };

  const handleSelectCloudKey = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            setTimeout(checkCloudKeyStatus, 1000); 
        } catch (e) {
            console.error(e);
        }
    }
  };

  const handleSaveManualKey = () => {
    localStorage.setItem('veo_api_key', manualKey.trim());
    alert('Chave de API salva localmente!');
  };

  const handleClearManualKey = () => {
    localStorage.removeItem('veo_api_key');
    setManualKey('');
  };

  const hasAnyKey = hasCloudKey || (manualKey.length > 10);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-white mb-8">Configurações</h2>
      
      <div className="w-full bg-[#1f1f23] border border-gray-700 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-lg">
                <KeyIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white">Chave de API do Google Cloud</h3>
                <p className="text-sm text-gray-400">Gerencie sua conexão com o Gemini Veo</p>
            </div>
        </div>

        <div className="border-t border-gray-800 my-6"></div>

        <p className="text-gray-300 mb-6 leading-relaxed">
           Você pode selecionar uma chave automaticamente (se estiver usando AI Studio) ou colar uma chave manualmente.
        </p>

        <div className="bg-gray-900/50 rounded-lg p-4 mb-8 border border-gray-800">
            <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Status da Conexão:</span>
                <Tooltip content="Indica se o aplicativo tem uma chave válida para operar.">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full cursor-help ${hasAnyKey ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {hasAnyKey ? 'Chave Configurada' : 'Nenhuma Chave'}
                    </span>
                </Tooltip>
            </div>
        </div>

        {/* Manual Key Section */}
        <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Chave Manual (Colar)
            </label>
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <input
                        type={showKey ? "text" : "password"}
                        value={manualKey}
                        onChange={(e) => setManualKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                    >
                        {showKey ? 'Ocultar' : 'Ver'}
                    </button>
                </div>
                <button
                    onClick={handleSaveManualKey}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Salvar
                </button>
                {manualKey && (
                    <button
                        onClick={handleClearManualKey}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                        title="Limpar chave"
                    >
                        X
                    </button>
                )}
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
                Sua chave será salva no armazenamento local do navegador para uso futuro.
            </p>
        </div>

        {/* AI Studio Section */}
        {window.aistudio && (
            <div className="border-t border-gray-800 pt-6">
                <p className="text-sm text-gray-400 mb-4">Ou use o seletor automático (AI Studio):</p>
                <Tooltip content="Abre a janela segura do Google AI Studio para selecionar ou criar uma chave de API.">
                    <button
                    onClick={handleSelectCloudKey}
                    className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all active:scale-95 border border-gray-600 flex justify-center items-center gap-2"
                    >
                    <KeyIcon className="w-4 h-4" />
                    {hasCloudKey ? 'Alterar Chave de Nuvem' : 'Selecionar Chave de Nuvem'}
                    </button>
                </Tooltip>
            </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
