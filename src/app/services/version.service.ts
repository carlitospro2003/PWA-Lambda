import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { SwUpdate } from '@angular/service-worker';
import { environment, API_ENDPOINTS } from '../../environments/environment';

interface VersionResponse {
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private readonly LOCAL_VERSION = environment.version;
  private readonly UPDATE_DISMISSED_KEY = 'updateDismissed';

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private swUpdate: SwUpdate
  ) {}

  /**
   * Verificar si hay actualizaciones disponibles
   */
  async checkForUpdates(): Promise<void> {
    try {
      // Obtener versión del servidor
      const serverVersion = await this.getServerVersion();
      
      if (!serverVersion) {
        console.warn('[VERSION] No se pudo obtener la versión del servidor');
        return;
      }

      console.log('[VERSION] Local:', this.LOCAL_VERSION, '| Server:', serverVersion);

      // Comparar versiones
      if (serverVersion !== this.LOCAL_VERSION) {
        console.log('[VERSION] Nueva versión disponible:', serverVersion);
        
        // Verificar si el usuario ya rechazó esta versión
        const dismissedVersion = localStorage.getItem(this.UPDATE_DISMISSED_KEY);
        
        if (dismissedVersion !== serverVersion) {
          await this.showUpdateAlert(serverVersion);
        } else {
          console.log('[VERSION] Usuario pospuso actualización para esta versión');
        }
      } else {
        console.log('[VERSION] App actualizada');
      }
    } catch (error) {
      console.error('[VERSION] Error al verificar actualizaciones:', error);
    }
  }

  /**
   * Obtener versión del servidor
   */
  private async getServerVersion(): Promise<string | null> {
    try {
      const response = await this.http.get<VersionResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.VERSION_CHECK}`
      ).toPromise();
      
      return response?.version || null;
    } catch (error) {
      console.error('[VERSION] Error al obtener versión del servidor:', error);
      return null;
    }
  }

  /**
   * Mostrar alerta de actualización
   */
  private async showUpdateAlert(newVersion: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: '🚀 Actualización Disponible',
      message: `Hay una nueva versión (${newVersion}) de Lambda Fitness. ¿Deseas actualizar ahora?`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Más Tarde',
          role: 'cancel',
          handler: () => {
            console.log('[VERSION] Usuario pospuso actualización');
            localStorage.setItem(this.UPDATE_DISMISSED_KEY, newVersion);
          }
        },
        {
          text: 'Actualizar',
          handler: () => {
            console.log('[VERSION] Usuario acepta actualización');
            this.updateApp();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Actualizar la aplicación
   */
  private async updateApp(): Promise<void> {
    try {
      // Limpiar el flag de actualización pospuesta
      localStorage.removeItem(this.UPDATE_DISMISSED_KEY);

      // Si hay Service Worker, activar actualización
      if (this.swUpdate.isEnabled) {
        console.log('[VERSION] Activando Service Worker actualizado...');
        await this.swUpdate.activateUpdate();
      }

      // Recargar la página para aplicar cambios
      console.log('[VERSION] Recargando aplicación...');
      window.location.reload();
    } catch (error) {
      console.error('[VERSION] Error al actualizar:', error);
      // Forzar recarga incluso si falla la actualización del SW
      window.location.reload();
    }
  }

  /**
   * Forzar verificación de actualizaciones (útil para desarrollo)
   */
  forceCheckForUpdates(): void {
    localStorage.removeItem(this.UPDATE_DISMISSED_KEY);
    this.checkForUpdates();
  }
}
