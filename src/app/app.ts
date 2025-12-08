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
  ) {}

  async ngOnInit() {
    console.log('App initialized - PWA install service active');
    
    // Inicializar monitoreo de red y sincronización
    console.log('[APP] Estado de red:', this.networkService.isOnline() ? 'ONLINE' : 'OFFLINE');
    
    // Verificar actualizaciones disponibles
    this.checkAppVersion();
    
    // Inicializar Firebase Cloud Messaging
    this.initializeFirebaseMessaging();
  }

  /**
   * Verificar si hay nueva versión disponible
   */
  private async checkAppVersion() {
    // Solo verificar si el usuario está autenticado y hay conexión
    if (this.authService.isAuthenticated() && this.networkService.isOnline()) {
      console.log('[APP] Verificando actualizaciones...');
      await this.versionService.checkForUpdates();
    }
  }

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
}
