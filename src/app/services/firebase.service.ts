import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private messaging: Messaging | null = null;

  constructor() {
    this.initializeFirebase();
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
      
      // Mostrar notificación personalizada usando Service Worker
      if (payload.notification) {
        this.showNotification(
          payload.notification.title || 'Nueva notificación',
          payload.notification.body || '',
          payload.notification.icon
        );
      }
    });
  }

  private async showNotification(title: string, body: string, icon?: string) {
    try {
      // Usar Service Worker Registration para mostrar notificaciones
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        body,
        icon: icon || '/assets/icon/favicon.png',
        badge: '/assets/icon/favicon.png',
        tag: 'notification-' + Date.now()
      } as NotificationOptions);
      
      console.log('Notificación mostrada correctamente');
    } catch (error) {
      console.error('Error al mostrar notificación:', error);
    }
  }

  async getFCMToken(): Promise<string | null> {
    return this.requestPermission();
  }
}
