import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationsApiService, Notification } from './notifications-api.service';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Observable de notificaciones
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  
  // Observable de contador no leídas
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  private syncInterval: any;
  private readonly SYNC_INTERVAL_MS = 30000; // 30 segundos

  constructor(
    private notificationsApi: NotificationsApiService,
    private authService: AuthService,
    private ngZone: NgZone,
    private firebaseService: FirebaseService
  ) {
    // Inyectar este servicio en FirebaseService para evitar dependencia circular
    this.firebaseService.setNotificationService(this);
    this.initAutoSync();
  }

  /**
   * Inicializar sincronización automática cada 30 segundos
   */
  private initAutoSync(): void {
    // Sincronizar inmediatamente si está autenticado
    if (this.authService.isAuthenticated()) {
      this.syncNotificationsFromBackend();
    }

    // Configurar intervalo de sincronización
    this.ngZone.runOutsideAngular(() => {
      this.syncInterval = setInterval(() => {
        if (this.authService.isAuthenticated()) {
          this.ngZone.run(() => {
            this.syncNotificationsFromBackend();
          });
        }
      }, this.SYNC_INTERVAL_MS);
    });
  }

  /**
   * Sincronizar notificaciones desde el backend
   */
  syncNotificationsFromBackend(): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationsSubject.next([]);
      this.unreadCountSubject.next(0);
      return;
    }

    this.notificationsApi.getNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          // Mapear notificaciones del backend al formato del frontend
          const mappedNotifications = response.data.map(notif => ({
            ...notif,
            id: notif.NOT_ID,
            read: notif.NOT_Status === 'read',
            title: notif.NOT_Title,
            body: notif.NOT_Body,
            type: notif.NOT_Type,
            data: notif.NOT_Data,
            read_at: notif.NOT_ReadAt,
            NOT_CreatedAt: notif.created_at // Mapear created_at a NOT_CreatedAt también
          }));
          
          console.log('[NOTIFICATIONS] Sincronizadas:', mappedNotifications.length);
          this.notificationsSubject.next(mappedNotifications);
          this.unreadCountSubject.next(response.unread_count);
        }
      },
      error: (error) => {
        console.error('[NOTIFICATIONS] Error al sincronizar:', error);
      }
    });
  }

  /**
   * Marcar notificación como leída
   */
  markAsRead(id: number): void {
    this.notificationsApi.markAsRead(id).subscribe({
      next: (response) => {
        if (response.success) {
          // Actualizar localmente
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map(n => 
            (n.NOT_ID === id || n.id === id) ? { 
              ...n, 
              NOT_Status: 'read' as const,
              read: true, 
              NOT_ReadAt: new Date().toISOString(),
              read_at: new Date().toISOString() 
            } : n
          );
          this.notificationsSubject.next(updated);
          
          // Actualizar contador
          const unreadCount = updated.filter(n => n.NOT_Status === 'unread' || !n.read).length;
          this.unreadCountSubject.next(unreadCount);
          
          console.log('[NOTIFICATIONS] Notificación marcada como leída:', id);
        }
      },
      error: (error) => {
        console.error('[NOTIFICATIONS] Error al marcar como leída:', error);
      }
    });
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead(): void {
    this.notificationsApi.markAllAsRead().subscribe({
      next: () => {
        // Actualizar localmente
        const notifications = this.notificationsSubject.value;
        const updated = notifications.map(n => ({ 
          ...n, 
          read: true, 
          read_at: new Date().toISOString() 
        }));
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(0);
      },
      error: (error) => {
        console.error('[NOTIFICATIONS] Error al marcar todas:', error);
      }
    });
  }

  /**
   * Eliminar notificación
   */
  deleteNotification(id: number): void {
    this.notificationsApi.deleteNotification(id).subscribe({
      next: () => {
        // Eliminar localmente
        const notifications = this.notificationsSubject.value;
        const updated = notifications.filter(n => n.id !== id);
        this.notificationsSubject.next(updated);
        
        // Actualizar contador
        const unreadCount = updated.filter(n => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
      },
      error: (error) => {
        console.error('[NOTIFICATIONS] Error al eliminar:', error);
      }
    });
  }

  /**
   * Limpiar notificaciones (al cerrar sesión)
   */
  clear(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  /**
   * Destruir servicio
   */
  ngOnDestroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}
