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

export interface GetMyRoomsDataResponse {
  success: boolean;
  data: {
    total_rooms: number;
    total_exercises: number;
    total_trainees: number;
  };
}

export interface EditRoomRequest {
  ROO_Name: string;
}

export interface EditRoomResponse {
  success: boolean;
  message: string;
  errors?: any;
}

export interface DeleteRoomResponse {
  success: boolean;
  message: string;
}

export interface SearchRoomRequest {
  ROO_Code: string;
}

export interface SearchRoomResponse {
  success: boolean;
  message?: string;
  room?: Room;
  errors?: any;
}

export interface JoinRoomRequest {
  URO_ROO_ID: number;
}

export interface JoinRoomResponse {
  success: boolean;
  message: string;
  errors?: any;
}

export interface GetMyJoinedRoomsResponse {
  success: boolean;
  message: string;
  rooms: Room[];
}

export interface LeaveRoomResponse {
  success: boolean;
  message: string;
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

  /**
   * Obtener estadísticas de mis salas
   */
  getMyRoomsData(): Observable<GetMyRoomsDataResponse> {
    return this.http.get<GetMyRoomsDataResponse>(`${this.apiUrl}${API_ENDPOINTS.GET_MY_ROOMS_DATA}`);
  }

  /**
   * Editar nombre de una sala
   */
  editRoom(roomId: number, roomData: EditRoomRequest): Observable<EditRoomResponse> {
    return this.http.put<EditRoomResponse>(`${this.apiUrl}${API_ENDPOINTS.EDIT_ROOM}/${roomId}`, roomData);
  }

  /**
   * Eliminar una sala y sus ejercicios
   */
  deleteRoom(roomId: number): Observable<DeleteRoomResponse> {
    return this.http.delete<DeleteRoomResponse>(`${this.apiUrl}${API_ENDPOINTS.DELETE_ROOM}/${roomId}`);
  }

  /**
   * Buscar una sala por código
   */
  searchRoom(roomCode: SearchRoomRequest): Observable<SearchRoomResponse> {
    return this.http.post<SearchRoomResponse>(`${this.apiUrl}${API_ENDPOINTS.SEARCH_ROOM}`, roomCode);
  }

  /**
   * Unirse a una sala
   */
  joinRoom(roomData: JoinRoomRequest): Observable<JoinRoomResponse> {
    return this.http.post<JoinRoomResponse>(`${this.apiUrl}${API_ENDPOINTS.JOIN_ROOM}`, roomData);
  }

  /**
   * Obtener las salas a las que el usuario se ha unido
   */
  getMyJoinedRooms(): Observable<GetMyJoinedRoomsResponse> {
    return this.http.get<GetMyJoinedRoomsResponse>(`${this.apiUrl}${API_ENDPOINTS.GET_MY_JOINED_ROOMS}`);
  }

  /**
   * Salir de una sala
   */
  leaveRoom(roomId: number): Observable<LeaveRoomResponse> {
    return this.http.post<LeaveRoomResponse>(`${this.apiUrl}${API_ENDPOINTS.LEAVE_ROOM}/${roomId}`, {});
  }
}