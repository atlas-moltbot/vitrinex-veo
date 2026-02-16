
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { FilmIcon, TrashIcon, SparklesIcon, DownloadIcon } from './icons';
import Tooltip from './Tooltip';

interface HistoryItem {
  id: number;
  prompt: string;
  video_url: string;
  model: string;
  resolution: string;
  aspect_ratio: string;
  style: string;
  created_at: string;
}

const GalleryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('./api/history.php');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setHistory(data);
      }
    } catch (err) {
      setError('Erro ao carregar o histórico');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Carregando sua galeria...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold text-white">Minha Galeria</h2>
          <p className="text-gray-400 mt-2">Veja e baixe suas criações anteriores salvas no banco de dados.</p>
        </div>
        <button 
          onClick={fetchHistory}
          className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <SparklesIcon className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-xl text-red-400 text-center">
          {error}
        </div>
      )}

      {history.length === 0 && !error ? (
        <div className="text-center py-24 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
          <FilmIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum vídeo encontrado no histórico.</p>
          <p className="text-gray-600 text-sm mt-2">Suas criações aparecerão aqui automaticamente após serem geradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {history.map((item) => (
            <div key={item.id} className="bg-[#1f1f23] rounded-2xl border border-gray-800 overflow-hidden group hover:border-indigo-500/50 transition-all shadow-xl">
              <div className="aspect-video bg-black relative">
                <video 
                  src={item.video_url} 
                  className="w-full h-full object-contain"
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Tooltip content="Ver Vídeo">
                    <a href={item.video_url} target="_blank" className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform">
                      <FilmIcon className="w-5 h-5" />
                    </a>
                  </Tooltip>
                  <Tooltip content="Baixar MP4">
                    <a href={item.video_url} download={`veo-creation-${item.id}.mp4`} className="p-3 bg-indigo-600 text-white rounded-full hover:scale-110 transition-transform">
                      <DownloadIcon className="w-5 h-5" />
                    </a>
                  </Tooltip>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400 font-bold uppercase border border-gray-700">
                    {item.resolution}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400 font-bold uppercase border border-gray-700">
                    {item.aspect_ratio}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 italic">
                  "{item.prompt}"
                </p>
                <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500">
                   <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                   <span className="uppercase tracking-widest">{item.model.split('-')[1] || item.model}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
