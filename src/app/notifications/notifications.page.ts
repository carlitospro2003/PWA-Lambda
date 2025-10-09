import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonCardContent
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
  ellipsisVerticalOutline
} from 'ionicons/icons';

// Interfaz para las notificaciones
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'exercise' | 'room';
  timestamp: Date;
  isRead: boolean;
  relatedId?: number;
}

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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonCard,
    IonCardContent
  ]
})
export class NotificationsPage implements OnInit {

  notifications: Notification[] = [
    {
      id: 1,
      title: 'Nueva sala disponible',
      message: 'El entrenador Carlos ha creado la sala "HIIT Intensivo". ¡Únete ahora!',
      type: 'room',
      timestamp: new Date(2025, 8, 27, 10, 30),
      isRead: false
    },
    {
      id: 2,
      title: 'Ejercicio completado',
      message: 'Has completado exitosamente el ejercicio "Burpees x20" en la sala Principiantes.',
      type: 'success',
      timestamp: new Date(2025, 8, 27, 9, 15),
      isRead: false
    },
    {
      id: 3,
      title: 'Nuevo ejercicio agregado',
      message: 'Se agregó el ejercicio "Sentadillas con salto" a tu sala "Entrenamiento Avanzado".',
      type: 'exercise',
      timestamp: new Date(2025, 8, 26, 18, 45),
      isRead: true
    },
    {
      id: 4,
      title: 'Recordatorio de entrenamiento',
      message: 'No olvides completar tu rutina diaria. ¡Llevas 5 días consecutivos!',
      type: 'info',
      timestamp: new Date(2025, 8, 26, 8, 0),
      isRead: true
    },
    {
      id: 5,
      title: 'Nuevo miembro en tu sala',
      message: 'Ana se unió a tu sala "Grupo Principiantes". Dale la bienvenida.',
      type: 'room',
      timestamp: new Date(2025, 8, 25, 16, 20),
      isRead: true
    },
    {
      id: 6,
      title: 'Meta semanal alcanzada',
      message: '¡Felicidades! Has completado tu meta semanal de 150 minutos de ejercicio.',
      type: 'success',
      timestamp: new Date(2025, 8, 25, 12, 0),
      isRead: true
    }
  ];

  constructor() {
    addIcons({
      notificationsOutline,
      timeOutline,
      peopleOutline,
      fitnessOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      informationCircleOutline,
      refreshOutline,
      ellipsisVerticalOutline
    });
  }

  ngOnInit() {
    // Inicialización si es necesaria
  }

  // Obtener icono según el tipo de notificación
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'room': return 'people-outline';
      case 'exercise': return 'fitness-outline';
      case 'success': return 'checkmark-circle-outline';
      case 'warning': return 'alert-circle-outline';
      default: return 'information-circle-outline';
    }
  }

  // Obtener color según el tipo de notificación
  getNotificationColor(type: string): string {
    switch (type) {
      case 'room': return 'primary';
      case 'exercise': return 'secondary';
      case 'success': return 'success';
      case 'warning': return 'warning';
      default: return 'medium';
    }
  }

  // Obtener etiqueta del tipo de notificación
  getNotificationTypeLabel(type: string): string {
    switch (type) {
      case 'room': return 'Sala';
      case 'exercise': return 'Ejercicio';
      case 'success': return 'Logro';
      case 'warning': return 'Aviso';
      default: return 'Info';
    }
  }

  // Función para trackBy en ngFor
  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }

  // Marcar notificación como leída
  markAsRead(notification: Notification) {
    notification.isRead = true;
  }

  // Marcar todas como leídas
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
  }

  // Obtener número de notificaciones no leídas
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Refrescar notificaciones
  handleRefresh(event: any) {
    setTimeout(() => {
      // Simular carga de nuevas notificaciones
      console.log('Refreshing notifications...');
      event.target.complete();
    }, 2000);
  }

  // Cargar más notificaciones
  loadMore(event: any) {
    setTimeout(() => {
      // Simular carga de más notificaciones
      console.log('Loading more notifications...');
      event.target.complete();
    }, 1000);
  }

  // Eliminar notificación
  deleteNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  // Formatear fecha
  formatTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  }
}