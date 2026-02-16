
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { KeyIcon } from './icons';

interface ApiKeyDialogProps {
  onContinue: (manualKey?: string) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = () => {
    if (manualInput.trim().length > 5) {
        localStorage.setItem('veo_api_key', manualInput.trim());
        onContinue(manualInput.trim());
    } else {
        // Fallback to standard flow logic (likely opens AI studio selector)
        onContinue(); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center flex flex-col items-center">
        <div className="bg-indigo-600/20 p-4 rounded-full mb-6">
          <KeyIcon className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Chave de API Necessária</h2>
        <p className="text-gray-300 mb-6">
          Para utilizar os recursos do VitrineX Veo, você precisa de uma Chave de API válida.
        </p>
        
        <div className="w-full mb-6 text-left">
            <label className="block text-xs font-medium text-gray-400 mb-1">
                Cole sua chave de API (Google AI Studio / GCP):
            </label>
            <input 
                type="password"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>

        <div className="flex flex-col gap-3 w-full">
            <button
            onClick={handleManualSubmit}
            disabled={!manualInput && !window.aistudio}
            className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors text-lg ${manualInput ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
            {manualInput ? 'Salvar e Continuar' : 'Selecionar Automaticamente'}
            </button>
            
            {!manualInput && window.aistudio && (
                <p className="text-xs text-gray-500">
                    Se não colar uma chave, tentaremos abrir o seletor do AI Studio.
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyDialog;
