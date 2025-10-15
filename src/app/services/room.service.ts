import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, API_ENDPOINTS } from '../../environments/environment';

// Interfaces para la API de salas
export interface CreateRoomRequest {
  ROO_Name: string;
}

export interface Room {
  ROO_ID: number;
  ROO_Name: string;
  ROO_Code: string;
  ROO_USR_ID: number;
  created_at: string;
  user?: {
    USR_ID: number;
    USR_Name: string;
    USR_LastName: string;
    USR_Email: string;
    USR_Phone: string;
    USR_UserRole: string;
    USR_FCM: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateRoomResponse {
  success: boolean;
  message: string;
  room?: Room;
  errors?: any;
}

export interface GetMyRoomsResponse {
  success: boolean;
  rooms: Room[];
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Crear una nueva sala
   */
  createRoom(roomData: CreateRoomRequest): Observable<CreateRoomResponse> {
    return this.http.post<CreateRoomResponse>(`${this.apiUrl}${API_ENDPOINTS.CREATE_ROOM}`, roomData);
  }

  /**
   * Obtener mis salas
   */
  getMyRooms(): Observable<GetMyRoomsResponse> {
    return this.http.get<GetMyRoomsResponse>(`${this.apiUrl}${API_ENDPOINTS.GET_MY_ROOMS}`);
  }
}