
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Aquecendo o diretor digital...",
  "Coletando pixels e fótons...",
  "Criando o storyboard da sua visão...",
  "Consultando a musa da IA...",
  "Renderizando a primeira cena...",
  "Aplicando iluminação cinematográfica...",
  "Isso pode levar alguns minutos, prepare a pipoca!",
  "Adicionando um toque de magia do cinema...",
  "Compondo o corte final...",
  "Polindo a obra-prima...",
  "Ensinando a IA a dizer 'I'll be back'...",
  "Limpando a poeira digital...",
  "Calibrando os sensores de ironia...",
  "Desemaranhando as linhas do tempo...",
  "Aumentando para a velocidade da luz...",
  "Não se preocupe, os pixels são amigáveis.",
  "Colhendo bananas nano para energia...",
  "Pedindo permissão às estrelas do Gemini...",
  "Rascunhando seu discurso para o Oscar..."
];

const LoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
      <h2 className="text-2xl font-semibold mt-8 text-gray-200">Gerando seu Vídeo</h2>
      <p className="mt-2 text-gray-400 text-center transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;
