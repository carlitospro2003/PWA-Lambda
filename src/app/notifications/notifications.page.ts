import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonIcon,
  IonBadge,
  IonButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  AlertController,
  ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  timeOutline,
  peopleOutline,
  fitnessOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
  refreshOutline,
  ellipsisVerticalOutline,
  mailOpenOutline,
  mailUnreadOutline,
  trashOutline,
  checkmarkDoneOutline,
  notificationsOffOutline
} from 'ionicons/icons';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../services/notifications-api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonBadge,
    IonButton,
    IonButtons,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonItemSliding,
    IonItemOptions,
    IonItemOption
  ]
})
export class NotificationsPage implements OnInit, ViewWillEnter {
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
    
    addIcons({
      notificationsOutline,
      timeOutline,
      peopleOutline,
      fitnessOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      informationCircleOutline,
      refreshOutline,
      ellipsisVerticalOutline,
      mailOpenOutline,
      mailUnreadOutline,
      trashOutline,
      checkmarkDoneOutline,
      notificationsOffOutline
    });
  }

  ngOnInit() {
    // Este se ejecuta solo una vez al crear el componente
    console.log('[NOTIFICATIONS PAGE] ngOnInit ejecutado');
  }

  ionViewWillEnter() {
    // Este se ejecuta cada vez que entras a la página/tab
    console.log('[NOTIFICATIONS PAGE] ionViewWillEnter - Sincronizando notificaciones...');
    this.notificationService.syncNotificationsFromBackend();
  }

  /**
   * Manejar clic en una notificación
   */
  handleNotificationClick(notification: Notification) {
    // Marcar como leída si no lo está
    const isUnread = notification.NOT_Status === 'unread' || !notification.read;
    if (isUnread) {
      const notifId = notification.NOT_ID || notification.id!;
      this.notificationService.markAsRead(notifId);
    }

    // Navegar según el tipo
    const notifType = notification.NOT_Type || notification.type;
    const notifData = notification.NOT_Data || notification.data;
    
    switch (notifType) {
      case 'new_exercise':
        // Navegar al detalle del ejercicio
        if (notifData?.exercise_id) {
          this.router.navigate(['/room-exercises', notifData.room_id]);
        }
        break;
      
      case 'test':
        // Notificación de prueba, no hacer nada
        break;
      
      default:
        console.log('Tipo de notificación desconocido:', notifType);
    }
  }

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead() {
    const alert = await this.alertController.create({
      header: 'Marcar todas como leídas',
      message: '¿Estás seguro de marcar todas las notificaciones como leídas?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, marcar todas',
          handler: () => {
            this.notificationService.markAllAsRead();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation(); // Evitar que se dispare el click de la notificación

    const alert = await this.alertController.create({
      header: 'Eliminar notificación',
      message: '¿Estás seguro de eliminar esta notificación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const notifId = notification.NOT_ID || notification.id!;
            this.notificationService.deleteNotification(notifId);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Refrescar notificaciones
   */
  handleRefresh(event: any) {
    this.notificationService.syncNotificationsFromBackend();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  /**
   * Formatear fecha relativa (hace 5 minutos, hace 1 hora, etc.)
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString();
  }
}