import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
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
      header: 'Nueva Versión Disponible',
      message: 'Hay una nueva actualización disponible.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Más Tarde',
          role: 'cancel',
          handler: () => {
            console.log('[VERSION] ⏰ Usuario pospuso actualización');
            // Recordar en 1 hora
            setTimeout(() => {
              this.checkForUpdates();
            }, 60 * 60 * 1000); // 1 hora
          }
        },
        {
          text: 'Actualizar Ahora',
          handler: () => {
            console.log('[VERSION] ✅ Usuario acepta actualización');
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
    const loading = await this.loadingCtrl.create({
      message: 'Actualizando Lambda Fitness...',
      spinner: 'crescent',
      backdropDismiss: false
    });
    await loading.present();

    try {
      console.log('[VERSION] 🔄 Iniciando proceso de actualización...');
      
      // Paso 1: Guardar datos de sesión antes de limpiar
      console.log('[VERSION] 📦 Guardando sesión del usuario...');
      const authToken = localStorage.getItem('authToken');
      const currentUser = localStorage.getItem('currentUser');
      
      // Paso 2: Limpiar todo el caché del Service Worker
      console.log('[VERSION] 🧹 Limpiando caché del Service Worker...');
      await this.clearServiceWorkerCache();
      
      // Paso 3: Activar la nueva versión
      console.log('[VERSION] ⚡ Activando nueva versión...');
      await this.swUpdate.activateUpdate();
      console.log('[VERSION] ✅ Nueva versión activada');
      
      // Paso 4: Desregistrar Service Workers antiguos
      console.log('[VERSION] 🔧 Actualizando Service Workers...');
      await this.unregisterAndReregisterServiceWorkers();
      
      // Paso 5: Restaurar datos de sesión
      if (authToken && currentUser) {
        console.log('[VERSION] 🔐 Restaurando sesión del usuario...');
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', currentUser);
      }
      
      await loading.dismiss();
      
      // Mostrar mensaje final
      const successAlert = await this.alertCtrl.create({
        header: '✅ Actualización Lista',
        message: 'Lambda Fitness se recargará para aplicar la nueva versión. Tu sesión se mantendrá activa.',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Recargar Ahora',
            handler: () => {
              console.log('[VERSION] 🚀 Recargando aplicación...');
              // Forzar recarga completa (bypass cache)
              window.location.href = window.location.href + '?v=' + new Date().getTime();
            }
          }
        ]
      });
      await successAlert.present();
      
    } catch (error) {
      console.error('[VERSION] ❌ Error durante actualización:', error);
      await loading.dismiss();
      
      // Mostrar error pero ofrecer recarga manual
      const errorAlert = await this.alertCtrl.create({
        header: '⚠️ Error en Actualización',
        message: 'Ocurrió un error durante la actualización. La app se recargará para intentar aplicar los cambios.',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Recargar',
            handler: () => {
              // Forzar recarga completa (bypass cache)
              window.location.href = window.location.href + '?v=' + new Date().getTime();
            }
          }
        ]
      });
      await errorAlert.present();
    }
  }

  /**
   * Limpiar todo el caché del Service Worker
   */
  private async clearServiceWorkerCache(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('[VERSION] 📋 Cachés encontrados:', cacheNames);
        
        // Eliminar todos los cachés
        const deletePromises = cacheNames.map(cacheName => {
          console.log('[VERSION] 🗑️ Eliminando caché:', cacheName);
          return caches.delete(cacheName);
        });
        
        await Promise.all(deletePromises);
        console.log('[VERSION] ✅ Todos los cachés eliminados');
      }
    } catch (error) {
      console.error('[VERSION] ❌ Error al limpiar caché:', error);
    }
  }

  /**
   * Desregistrar y re-registrar Service Workers
   */
  private async unregisterAndReregisterServiceWorkers(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('[VERSION] 📋 Service Workers encontrados:', registrations.length);
        
        // Desregistrar todos los Service Workers
        for (const registration of registrations) {
          console.log('[VERSION] 🔄 Desregistrando SW:', registration.scope);
          await registration.unregister();
        }
        
        console.log('[VERSION] ✅ Service Workers desregistrados');
        
        // El nuevo Service Worker se registrará automáticamente al recargar
      }
    } catch (error) {
      console.error('[VERSION] ❌ Error al gestionar Service Workers:', error);
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
