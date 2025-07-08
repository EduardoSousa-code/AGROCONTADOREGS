import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);
        
        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versão disponível
                console.log('🔄 Nova versão do app disponível');
                
                // Opcional: Mostrar notificação para o usuário
                if (confirm('Nova versão disponível! Deseja atualizar?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Falha ao registrar Service Worker:', error);
      });
  });

  // Escutar mudanças no Service Worker
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker atualizado, recarregando página...');
    window.location.reload();
  });
}

// Detectar se o app foi instalado como PWA
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('📱 PWA pode ser instalado');
  
  // Prevenir o prompt automático
  event.preventDefault();
  
  // Armazenar o evento para uso posterior
  (window as any).deferredPrompt = event;
  
  // Opcional: Mostrar botão de instalação customizado
  // showInstallButton();
});

// Detectar quando o PWA foi instalado
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA instalado com sucesso!');
  
  // Opcional: Esconder botão de instalação
  // hideInstallButton();
  
  // Opcional: Mostrar mensagem de boas-vindas
  // showWelcomeMessage();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
