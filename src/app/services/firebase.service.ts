import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../environments/environment';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private messaging: Messaging | null = null;
  private notificationService: any = null; // Se inyectará después para evitar dependencia circular
  private unsubscribeMessages: (() => void) | null = null; // Guardar referencia para desuscribir

  constructor(private toastController: ToastController) {
    this.initializeFirebase();
  }

  /**
   * Inyectar el NotificationService después de la construcción
   * para evitar dependencias circulares
   */
  setNotificationService(service: any) {
    this.notificationService = service;
  }

  private initializeFirebase() {
    try {
      const app = initializeApp(environment.firebase);
      this.messaging = getMessaging(app);
      console.log('Firebase inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar Firebase:', error);
    }
  }

  async requestPermission(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.error('Firebase Messaging no está inicializado');
        return null;
      }

      console.log('Solicitando permiso para notificaciones...');
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Permiso de notificación concedido');
        
        // Obtener token FCM
        const token = await getToken(this.messaging, {
          vapidKey: environment.firebase.vapidKey
        });
        
        console.log('Token FCM obtenido:', token);
        return token;
      } else {
        console.log('Permiso de notificación denegado');
        return null;
      }
    } catch (error) {
      console.error('Error al solicitar permiso:', error);
      return null;
    }
  }

  listenToMessages() {
    if (!this.messaging) {
      console.error('Firebase Messaging no está inicializado');
      return;
    }

    console.log('[FIREBASE] Iniciando listener de notificaciones');
    this.unsubscribeMessages = onMessage(this.messaging, (payload) => {
      console.log('Mensaje recibido en primer plano:', payload);
      
      // Sincronizar notificaciones desde el backend para actualizar el badge
      if (this.notificationService) {
        console.log('[FCM] Sincronizando notificaciones después de recibir mensaje...');
        this.notificationService.syncNotificationsFromBackend();
      }
      
      // Mostrar notificación dentro de la app usando Toast de Ionic
      if (payload.notification) {
        this.showInAppNotification(
          payload.notification.title || 'Nueva notificación',
          payload.notification.body || ''
        );
      }
    });
  }

  private async showInAppNotification(title: string, body: string) {
    const toast = await this.toastController.create({
      header: title,
      message: body,
      duration: 5000,
      position: 'top',
      color: 'primary',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
  }

  async getFCMToken(): Promise<string | null> {
    return this.requestPermission();
  }

  /**
   * Detener listener de notificaciones (útil al cerrar sesión)
   */
  stopListening(): void {
    console.log('[FIREBASE] Deteniendo listener de notificaciones');
    // Limpiar referencia del listener si existe
    if (this.unsubscribeMessages) {
      // onMessage retorna una función pero no es directamente invocable para desuscribir
      // En Firebase Web v9+, onMessage no retorna unsubscribe, pero limpiamos la referencia
      this.unsubscribeMessages = null;
    }
    console.log('[FIREBASE] Listener detenido');
  }

  /**
   * Limpiar token FCM del usuario (útil al cerrar sesión)
   * El backend se encarga de limpiar el token en la base de datos
   */
  async clearFCMToken(): Promise<void> {
    try {
      if (!this.messaging) {
        console.log('[FIREBASE] Messaging no inicializado, no hay token que limpiar');
        return;
      }

      // Detener el listener primero
      this.stopListening();
      
      console.log('[FIREBASE] Token FCM será limpiado por el backend en el logout');
      
      // Desregistrar el Service Worker de Firebase
      await this.unregisterFirebaseServiceWorker();
      
    } catch (error) {
      console.error('[FIREBASE] Error al limpiar token FCM:', error);
    }
  }

  /**
   * Desregistrar el Service Worker de Firebase al cerrar sesión
   * Esto evita que se reciban notificaciones cuando no hay sesión activa
   */
  private async unregisterFirebaseServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          // Buscar el Service Worker de Firebase
          if (registration.active?.scriptURL.includes('firebase-messaging-sw')) {
            console.log('[FIREBASE] Desregistrando Service Worker de Firebase...');
            const success = await registration.unregister();
            
            if (success) {
              console.log('[FIREBASE] ✅ Service Worker desregistrado exitosamente');
            } else {
              console.log('[FIREBASE] ⚠️ No se pudo desregistrar el Service Worker');
            }
          }
        }
      }
    } catch (error) {
      console.error('[FIREBASE] Error al desregistrar Service Worker:', error);
    }
  }
}

