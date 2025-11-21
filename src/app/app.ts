import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaInstallBannerComponent } from './components/pwa-install-banner.component';
import { PwaInstallService } from './services/pwa-install.service';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('lambda');

  constructor(
    private pwaInstallService: PwaInstallService,
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit() {
    console.log('App initialized - PWA install service active');
    
    // Inicializar Firebase Cloud Messaging
    this.initializeFirebaseMessaging();
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
