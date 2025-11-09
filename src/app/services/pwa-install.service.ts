import { Injectable, signal } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  
  // Señales reactivas para el estado
  public installable = signal(false);
  public installed = signal(false);
  public platform = signal<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  constructor(private platformService: Platform) {
    this.detectPlatform();
    this.listenForInstallPrompt();
    this.checkIfInstalled();
  }

  /**
   * Detecta la plataforma del usuario
   */
  private detectPlatform(): void {
    if (this.platformService.is('ios')) {
      this.platform.set('ios');
    } else if (this.platformService.is('android')) {
      this.platform.set('android');
    } else if (this.platformService.is('desktop')) {
      this.platform.set('desktop');
    } else {
      this.platform.set('unknown');
    }
  }

  /**
   * Escucha el evento beforeinstallprompt de Chrome/Edge
   */
  private listenForInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevenir el mini-infobar automático de Chrome
      e.preventDefault();
      
      // Guardar el evento para usarlo después
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Indicar que la app es instalable
      this.installable.set(true);
      
      console.log('PWA: beforeinstallprompt event captured');
    });

    // Detectar cuando la app fue instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.installed.set(true);
      this.installable.set(false);
      this.deferredPrompt = null;
    });
  }

  /**
   * Verifica si la app ya está instalada
   */
  private checkIfInstalled(): void {
    // Detectar si se está ejecutando en modo standalone (instalada)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.installed.set(true);
      console.log('PWA: Running in standalone mode');
    }

    // Para iOS Safari
    if ((window.navigator as any).standalone === true) {
      this.installed.set(true);
      console.log('PWA: Running in iOS standalone mode');
    }
  }

  /**
   * Muestra el prompt de instalación
   */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('PWA: No install prompt available');
      return false;
    }

    try {
      // Mostrar el prompt nativo
      await this.deferredPrompt.prompt();
      
      // Esperar la respuesta del usuario
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        this.installable.set(false);
        return true;
      } else {
        console.log('PWA: User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Error showing install prompt:', error);
      return false;
    } finally {
      // Limpiar el prompt usado
      this.deferredPrompt = null;
    }
  }

  /**
   * Obtiene instrucciones de instalación para iOS
   */
  getIOSInstallInstructions(): string[] {
    return [
      'Toca el botón de compartir',
      'Desplázate y selecciona "Agregar a pantalla de inicio"',
      'Toca "Agregar" en la esquina superior derecha'
    ];
  }

  /**
   * Verifica si es iOS y puede mostrar instrucciones manuales
   */
  canShowIOSInstructions(): boolean {
    return this.platform() === 'ios' && !this.installed();
  }

  /**
   * Verifica si puede mostrar el prompt de instalación automático
   */
  canShowInstallPrompt(): boolean {
    return this.installable() && !this.installed() && this.platform() !== 'ios';
  }
}
