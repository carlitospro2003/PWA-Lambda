import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, API_ENDPOINTS } from '../../environments/environment';

export interface Notification {
  NOT_ID: number;
  NOT_USR_ID: number;
  NOT_Type: string;
  NOT_Title: string;
  NOT_Body: string;
  NOT_ROO_ID: number;
  NOT_Data: {
    type: string;
    exercise_id?: number;
    room_id?: number;
    room_name?: string;
    [key: string]: any;
  };
  NOT_Status: 'unread' | 'read';
  NOT_ReadAt: string | null;
  NOT_CreatedAt: string;
  created_at: string;
  updated_at: string;
  room?: {
    ROO_ID: number;
    ROO_Name: string;
  };
  
  // Propiedades compatibles con el frontend
  id?: number;
  read?: boolean;
  title?: string;
  body?: string;
  type?: string;
  data?: any;
  read_at?: string | null;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
  unread_count: number;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsApiService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las notificaciones del usuario
   */
  getNotifications(): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${environment.apiUrl}${API_ENDPOINTS.GET_NOTIFICATIONS}`);
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.apiUrl}/unread-count`);
  }

  /**
   * Marcar una notificación como leída
   */
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.MARK_NOTIFICATION_AS_READ}/${id}`, {});
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {});
  }

  /**
   * Eliminar una notificación
   */
  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
