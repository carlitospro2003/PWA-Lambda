import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { NotificationService } from './notification.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private wasOffline = false;

  constructor(
    private networkService: NetworkService,
    private notificationService: NotificationService,
    private toastController: ToastController
  ) {
    this.initNetworkMonitoring();
  }

  /**
   * Monitorear cambios en el estado de la red
   */
  private initNetworkMonitoring(): void {
    this.networkService.online$.subscribe(async (isOnline) => {
      if (isOnline && this.wasOffline) {
        // Reconectado después de estar offline
        console.log('[SYNC] Reconectado - sincronizando datos...');
        await this.showReconnectedToast();
        await this.syncAllData();
        this.wasOffline = false;
      } else if (!isOnline) {
        // Perdió conexión
        console.log('[SYNC] Conexión perdida - modo offline');
        await this.showOfflineToast();
        this.wasOffline = true;
      }
    });
  }

  /**
   * Sincronizar todos los datos cuando regrese la conexión
   */
  private async syncAllData(): Promise<void> {
    try {
      // Sincronizar notificaciones
      this.notificationService.syncNotificationsFromBackend();
      
      // Aquí puedes agregar más sincronizaciones
      // Por ejemplo: salas, ejercicios, rutinas, etc.
      
      console.log('[SYNC] Sincronización completada');
      
      // Esperar un momento y mostrar toast de éxito
      setTimeout(async () => {
        await this.showSyncSuccessToast();
      }, 1000);
    } catch (error) {
      console.error('[SYNC] Error al sincronizar:', error);
      await this.showSyncErrorToast();
    }
  }

  /**
   * Mostrar toast cuando se pierde la conexión
   */
  private async showOfflineToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: '📡 Sin conexión - Modo offline activado',
      duration: 3000,
      position: 'bottom',
      color: 'warning',
      icon: 'cloud-offline-outline'
    });
    await toast.present();
  }

  /**
   * Mostrar toast cuando se reconecta
   */
  private async showReconnectedToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: '✅ Conexión restablecida - Sincronizando...',
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'cloud-done-outline'
    });
    await toast.present();
  }

  /**
   * Mostrar toast cuando la sincronización es exitosa
   */
  private async showSyncSuccessToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: '🔄 Datos sincronizados',
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  /**
   * Mostrar toast cuando falla la sincronización
   */
  private async showSyncErrorToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: '⚠️ Error al sincronizar datos',
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      icon: 'alert-circle-outline'
    });
    await toast.present();
  }

  /**
   * Forzar sincronización manual
   */
  async forceSyncAll(): Promise<void> {
    if (this.networkService.isOnline()) {
      await this.syncAllData();
    } else {
      await this.showOfflineToast();
    }
  }
}
