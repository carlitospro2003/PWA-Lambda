import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, API_ENDPOINTS } from '../../environments/environment';

// Interfaces
export interface Routine {
  ROU_ID: number;
  ROU_USR_ID: number;
  ROU_EXC_ID: number;
  ROU_Status: string;
  ROU_Fav: boolean;
  created_at: string;
  updated_at: string;
  excercise?: Exercise;
}

export interface Exercise {
  EXC_ID: number;
  EXC_Title: string;
  EXC_Type: string;
  EXC_Instructions: string;
  EXC_DifficultyLevel: string;
  EXC_Media1?: string;
  EXC_Media2?: string;
  EXC_Media3?: string;
  EXC_Media4?: string;
  EXC_URL1?: string;
  EXC_URL2?: string;
}

export interface CreateRoutineResponse {
  success: boolean;
  message: string;
  data?: Routine;
  exercise?: any;
}

export interface GetMyRoutinesResponse {
  success: boolean;
  message: string;
  data: Routine[];
  total_routines?: number;
}

export interface AddFavoriteResponse {
  success: boolean;
  message: string;
  data?: Routine;
}

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Crear una rutina (agregar ejercicio a favoritos)
   */
  createRoutine(exerciseId: number): Observable<CreateRoutineResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<CreateRoutineResponse>(
      `${this.apiUrl}${API_ENDPOINTS.CREATE_ROUTINE}/${exerciseId}`,
      {},
      { headers }
    );
  }

  /**
   * Obtener rutinas del usuario (favoritos)
   */
  getMyRoutines(): Observable<GetMyRoutinesResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<GetMyRoutinesResponse>(
      `${this.apiUrl}${API_ENDPOINTS.GET_MY_ROUTINES}`,
      { headers }
    );
  }

  /**
   * Marcar ejercicio como favorito
   */
  addFavorite(exerciseId: number): Observable<AddFavoriteResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<AddFavoriteResponse>(
      `${this.apiUrl}${API_ENDPOINTS.ADD_FAVORITE}/${exerciseId}`,
      {},
      { headers }
    );
  }
}
