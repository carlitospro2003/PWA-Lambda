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

    onMessage(this.messaging, (payload) => {
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
}

