import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  constructor(
    private alertCtrl: AlertController,
    private swUpdate: SwUpdate
  ) {
    this.initializeVersionDetection();
  }

  /**
   * Inicializar detección automática de nuevas versiones
   */
  private initializeVersionDetection(): void {
    if (!this.swUpdate.isEnabled) {
      console.log('[VERSION] Service Worker no está habilitado');
      return;
    }

    console.log('[VERSION] Sistema de detección de actualizaciones iniciado');

    // Escuchar cuando hay una nueva versión disponible
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(event => {
        console.log('[VERSION] Nueva versión detectada');
        console.log('[VERSION] Versión actual:', event.currentVersion);
        console.log('[VERSION] Nueva versión:', event.latestVersion);
        this.showUpdateAlert();
      });

    // Verificar actualizaciones al inicio
    this.checkForUpdates();
  }

  /**
   * Verificar manualmente si hay actualizaciones
   */
  async checkForUpdates(): Promise<void> {
    if (!this.swUpdate.isEnabled) {
      console.log('[VERSION] Service Worker no está habilitado');
      return;
    }

    try {
      console.log('[VERSION] Verificando actualizaciones...');
      const updateAvailable = await this.swUpdate.checkForUpdate();
      
      if (updateAvailable) {
        console.log('[VERSION] Actualización disponible');
      } else {
        console.log('[VERSION] No hay actualizaciones disponibles');
      }
    } catch (error) {
      console.error('[VERSION] Error al verificar actualizaciones:', error);
    }
  }

  /**
   * Mostrar alerta de actualización
   */
  private async showUpdateAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: '🚀 Nueva Versión Disponible',
      message: 'Hay una nueva versión de Lambda Fitness disponible. Para obtener las últimas funciones y mejoras, actualiza ahora.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Más Tarde',
          role: 'cancel',
          handler: () => {
            console.log('[VERSION] Usuario pospuso actualización');
          }
        },
        {
          text: 'Actualizar Ahora',
          handler: () => {
            console.log('[VERSION] Usuario acepta actualización');
            this.activateUpdate();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Activar actualización y recargar la app
   */
  private async activateUpdate(): Promise<void> {
    try {
      console.log('[VERSION] Activando actualización...');
      await this.swUpdate.activateUpdate();
      console.log('[VERSION] Actualización activada, recargando app...');
      window.location.reload();
    } catch (error) {
      console.error('[VERSION] Error al activar actualización:', error);
      // Forzar recarga de todas formas
      window.location.reload();
    }
  }

  /**
   * Forzar verificación de actualizaciones (útil para desarrollo)
   */
  async forceCheckForUpdates(): Promise<void> {
    console.log('[VERSION] Forzando verificación de actualizaciones...');
    await this.checkForUpdates();
  }
}
