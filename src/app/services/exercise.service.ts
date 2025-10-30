import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, API_ENDPOINTS } from '../../environments/environment';

// Interfaces para la API de ejercicios
export interface CreateExerciseRequest {
  EXC_Title: string;
  EXC_Type?: string;
  EXC_Instructions?: string;
  EXC_DifficultyLevel?: string;
  EXC_ROO_ID: number;
}

export interface Exercise {
  EXC_ID: number;
  EXC_Title: string;
  EXC_Type?: string;
  EXC_Instructions?: string;
  EXC_DifficultyLevel?: string;
  EXC_ROO_ID: number;
  EXC_Media1?: string;
  EXC_Media2?: string;
  EXC_Media3?: string;
  EXC_Media4?: string;
  EXC_URL1?: string;
  EXC_URL2?: string;
  created_at: string;
  updated_at: string;
  room?: {
    ROO_ID: number;
    ROO_Code: string;
    ROO_Name: string;
    ROO_USR_ID: number;
    created_at: string;
    updated_at: string;
  };
}

export interface GetExerciseResponse {
  success: boolean;
  message: string;
  data?: Exercise;
  total_images?: number;
  total_urls?: number;
}

export interface CreateExerciseResponse {
  success: boolean;
  message: string;
  data?: Exercise;
  uploaded_files?: number;
  errors?: any;
}

export interface GetExercisesByRoomResponse {
  success: boolean;
  message: string;
  total_exercises: number;
  data: Exercise[];
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo ejercicio
   */
  createExercise(exerciseData: CreateExerciseRequest): Observable<CreateExerciseResponse> {
    return this.http.post<CreateExerciseResponse>(`${this.apiUrl}${API_ENDPOINTS.CREATE_EXERCISE}`, exerciseData);
  }

  /**
   * Crear un nuevo ejercicio con archivos multimedia (FormData)
   */
  createExerciseWithMedia(formData: FormData): Observable<CreateExerciseResponse> {
    return this.http.post<CreateExerciseResponse>(`${this.apiUrl}${API_ENDPOINTS.CREATE_EXERCISE}`, formData);
  }

  /**
   * Obtener ejercicios por sala
   */
  getExercisesByRoom(roomId: number): Observable<GetExercisesByRoomResponse> {
    return this.http.get<GetExercisesByRoomResponse>(`${this.apiUrl}${API_ENDPOINTS.GET_EXERCISES_BY_ROOM}/${roomId}`);
  }

  /**
   * Obtener detalles completos de un ejercicio específico
   */
  getExercise(exerciseId: number): Observable<GetExerciseResponse> {
    return this.http.get<GetExerciseResponse>(`${this.apiUrl}${API_ENDPOINTS.GET_EXERCISE}/${exerciseId}`);
  }
}
