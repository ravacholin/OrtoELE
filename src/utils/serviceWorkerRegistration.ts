// Service Worker Registration and Network Status Helper for Ortografía Lab

type StatusChangeCallback = (isOnline: boolean, isOfflineReady: boolean) => void;

class ServiceWorkerManager {
  private isOfflineReady = false;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<StatusChangeCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleNetworkChange);
      window.addEventListener('offline', this.handleNetworkChange);
    }
  }

  private handleNetworkChange = () => {
    this.isOnline = navigator.onLine;
    this.notify();
  };

  private notify() {
    this.listeners.forEach((cb) => cb(this.isOnline, this.isOfflineReady));
  }

  public subscribe(callback: StatusChangeCallback): () => void {
    this.listeners.add(callback);
    callback(this.isOnline, this.isOfflineReady);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public register() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[SW] Service Workers are not supported in this browser.');
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker registrado exitosamente con alcance:', registration.scope);

          if (registration.installing) {
            console.log('[SW] Instalando Service Worker...');
          } else if (registration.active) {
            this.isOfflineReady = true;
            this.notify();
          }

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[SW] Nueva versión de Ortografía Lab disponible en caché.');
                } else {
                  console.log('[SW] Los activos están cacheados para uso sin conexión.');
                  this.isOfflineReady = true;
                  this.notify();
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[SW] Error al registrar el Service Worker:', error);
        });
    });
  }
}

export const swManager = new ServiceWorkerManager();
