import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { downloadOutline, closeOutline, phonePortraitOutline, desktopOutline } from 'ionicons/icons';
import { PwaInstallService } from '../services/pwa-install.service';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle],
  template: `
    <!-- Banner para Android/Desktop (Chrome, Edge, etc) -->
    @if (showBanner()) {
      <div class="pwa-install-banner">
        <ion-card class="install-card">
          <ion-card-header>
            <div class="header-content">
              <ion-icon 
                [name]="pwaService.platform() === 'desktop' ? 'desktop-outline' : 'phone-portrait-outline'"
                class="app-icon"
              ></ion-icon>
              <ion-card-title>Instala Lambda Fitness</ion-card-title>
              <ion-button 
                fill="clear" 
                size="small" 
                (click)="dismissBanner()"
                class="close-btn"
              >
                <ion-icon name="close-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </ion-card-header>
          
          <ion-card-content>
            <p class="description">
              Instala nuestra app para un acceso rápido y una mejor experiencia. 
              Funciona sin conexión y recibe notificaciones.
            </p>
            
            <div class="actions">
              <ion-button 
                expand="block" 
                (click)="install()"
                color="primary"
              >
                <ion-icon name="download-outline" slot="start"></ion-icon>
                Instalar App
              </ion-button>
              
              <ion-button 
                expand="block" 
                fill="outline" 
                (click)="dismissBanner()"
              >
                Ahora no
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    }

    <!-- Banner para iOS (Safari) -->
    @if (showIOSInstructions()) {
      <div class="pwa-install-banner ios-banner">
        <ion-card class="install-card">
          <ion-card-header>
            <div class="header-content">
              <ion-icon name="phone-portrait-outline" class="app-icon"></ion-icon>
              <ion-card-title>Instala Lambda Fitness</ion-card-title>
              <ion-button 
                fill="clear" 
                size="small" 
                (click)="dismissIOSBanner()"
                class="close-btn"
              >
                <ion-icon name="close-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </ion-card-header>
          
          <ion-card-content>
            <p class="description">
              Para instalar esta app en tu iPhone:
            </p>
            
            <ol class="ios-instructions">
              @for (instruction of iosInstructions; track instruction) {
                <li>{{ instruction }}</li>
              }
            </ol>
            
            <ion-button 
              expand="block" 
              fill="outline" 
              (click)="dismissIOSBanner()"
            >
              Entendido
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    }
  `,
  styles: [`
    .pwa-install-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      padding: 0;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .install-card {
      margin: 0;
      border-radius: 16px 16px 0 0;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .app-icon {
      font-size: 32px;
      color: var(--ion-color-primary);
    }

    ion-card-title {
      flex: 1;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      position: absolute;
      right: -8px;
      top: -8px;
      --padding-start: 8px;
      --padding-end: 8px;
    }

    .description {
      margin: 0 0 16px 0;
      color: var(--ion-color-medium);
      font-size: 14px;
      line-height: 1.5;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ios-instructions {
      margin: 16px 0;
      padding-left: 20px;
      color: var(--ion-color-medium);
      font-size: 14px;
      line-height: 1.6;
    }

    .ios-instructions li {
      margin-bottom: 8px;
    }

    /* Estilos para desktop */
    @media (min-width: 768px) {
      .pwa-install-banner {
        bottom: 20px;
        left: 20px;
        right: auto;
        max-width: 400px;
      }

      .install-card {
        border-radius: 16px;
      }
    }
  `]
})
export class PwaInstallBannerComponent implements OnInit {
  showBanner = signal(false);
  showIOSInstructions = signal(false);
  iosInstructions: string[] = [];

  constructor(
    public pwaService: PwaInstallService,
    private alertController: AlertController
  ) {
    // Registrar iconos
    addIcons({ downloadOutline, closeOutline, phonePortraitOutline, desktopOutline });
  }

  ngOnInit() {
    // Esperar un poco antes de mostrar el banner para no ser intrusivo
    setTimeout(() => {
      this.checkIfShouldShowBanner();
    }, 2000);
  }

  private checkIfShouldShowBanner() {
    // Verificar si ya fue descartado antes
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedDate = dismissed ? new Date(dismissed) : null;
    
    // Mostrar de nuevo después de 7 días
    const shouldShowAgain = !dismissedDate || 
      (Date.now() - dismissedDate.getTime() > 7 * 24 * 60 * 60 * 1000);

    if (this.pwaService.canShowInstallPrompt() && shouldShowAgain) {
      this.showBanner.set(true);
    } else if (this.pwaService.canShowIOSInstructions() && shouldShowAgain) {
      this.iosInstructions = this.pwaService.getIOSInstallInstructions();
      this.showIOSInstructions.set(true);
    }
  }

  async install() {
    const installed = await this.pwaService.promptInstall();
    
    if (installed) {
      this.showBanner.set(false);
      
      // Mostrar confirmación
      const alert = await this.alertController.create({
        header: '¡Instalación exitosa!',
        message: 'Lambda Fitness ha sido instalada. Ahora puedes acceder desde tu pantalla de inicio.',
        buttons: ['Genial']
      });
      await alert.present();
    }
  }

  dismissBanner() {
    this.showBanner.set(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  }

  dismissIOSBanner() {
    this.showIOSInstructions.set(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  }
}
