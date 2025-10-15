import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, API_ENDPOINTS } from '../../environments/environment';

export interface UpdateUserRequest {
  USR_Name?: string;
  USR_LastName?: string;
  USR_Email?: string;
  USR_Phone?: string;
  USR_Password?: string;
}

export interface User {
  USR_ID: number;
  USR_Name: string;
  USR_LastName: string;
  USR_Email: string;
  USR_Phone: string;
  USR_UserRole: string;
  USR_FCM?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data?: User;
  errors?: any;
}

export interface GetUserResponse {
  success: boolean;
  data: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  updateUser(data: UpdateUserRequest): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(
      `${this.apiUrl}${API_ENDPOINTS.EDIT_USER}`,
      data
    );
  }

  getUser(): Observable<GetUserResponse> {
    return this.http.get<GetUserResponse>(
      `${this.apiUrl}${API_ENDPOINTS.GET_USER}`
    );
  }
}
