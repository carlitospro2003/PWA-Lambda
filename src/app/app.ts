import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaInstallBannerComponent } from './components/pwa-install-banner.component';
import { NetworkStatusComponent } from './components/network-status.component';
import { PwaInstallService } from './services/pwa-install.service';
import { FirebaseService } from './services/firebase.service';
import { VersionService } from './services/version.service';
import { AuthService } from './services/auth.service';
import { SyncService } from './services/sync.service';
import { NetworkService } from './services/network.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallBannerComponent, NetworkStatusComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('lambda');

  constructor(
    private pwaInstallService: PwaInstallService,
    private firebaseService: FirebaseService,
    private versionService: VersionService,
    private authService: AuthService,
    private syncService: SyncService,
    private networkService: NetworkService
  ) {
    // Guardar referencia global de FirebaseService para uso en logout
    (window as any).firebaseServiceInstance = this.firebaseService;
  }

  async ngOnInit() {
    console.log('App initialized - PWA install service active');
    
    // Inicializar monitoreo de red y sincronización
    console.log('[APP] Estado de red:', this.networkService.isOnline() ? 'ONLINE' : 'OFFLINE');
    
    // El versionService ya se inicializa automáticamente en su constructor
    // No es necesario llamar checkForUpdates aquí
    
    // Inicializar Firebase Cloud Messaging
    this.initializeFirebaseMessaging();
    
    // Configurar listener para verificación de sesión desde el Service Worker
    this.setupServiceWorkerSessionCheck();
  }

  /**
   * Inicializar Firebase Cloud Messaging
   */
  private async initializeFirebaseMessaging() {
    try {
      // Escuchar mensajes en primer plano
      this.firebaseService.listenToMessages();
      
      // Solicitar permiso y obtener token FCM
      const token = await this.firebaseService.requestPermission();
      
      if (token) {
        console.log('✅ Token FCM obtenido:', token);
        // Aquí puedes enviar el token a tu backend Laravel
        // await this.authService.saveFCMToken(token).toPromise();
      } else {
        console.log('⚠️ No se pudo obtener el token FCM (permiso denegado)');
      }
    } catch (error) {
      console.error('Error al inicializar Firebase Messaging:', error);
    }
  }

  /**
   * Configurar listener para responder a verificaciones de sesión desde el Service Worker
   * El Service Worker preguntará si hay sesión activa antes de mostrar notificaciones
   */
  private setupServiceWorkerSessionCheck() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CHECK_SESSION') {
          // Verificar si hay sesión activa (token y usuario en localStorage)
          const hasSession = this.authService.isAuthenticated();
          
          console.log('[APP] Service Worker preguntó por sesión. Estado:', hasSession ? '✅ ACTIVA' : '❌ NO ACTIVA');
          
          // Responder al Service Worker a través del MessageChannel
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ 
              hasSession: hasSession 
            });
          }
        }
      });
      
      console.log('[APP] ✅ Listener de verificación de sesión configurado');
    }
  }
}
