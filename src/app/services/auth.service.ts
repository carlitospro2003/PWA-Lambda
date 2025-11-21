import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment, API_ENDPOINTS } from '../../environments/environment';

// Interfaces para la API
export interface LoginRequest {
  USR_Email: string;
  USR_Password: string;
  fcm_token?: string;
}

export interface RegisterRequest {
  USR_Name: string;
  USR_LastName: string;
  USR_Email: string;
  USR_Phone: string;
  USR_Password: string;
  USR_UserRole: 'trainer' | 'trainee';
}

export interface User {
  USR_ID: number;
  USR_Name: string;
  USR_LastName: string;
  USR_Email: string;
  USR_Phone: string;
  USR_UserRole: string;
  USR_FCM: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: User;
  token?: string;
  errors?: any;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: User;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar datos guardados del localStorage al inicializar
    this.loadStoredAuth();
  }

  /**
   * Iniciar sesión con la API de Laravel
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<LoginResponse>(`${this.apiUrl}${API_ENDPOINTS.LOGIN}`, credentials, { headers })
      .pipe(
        tap(response => {
          if (response.success && response.data && response.token) {
            this.setAuthData(response.data, response.token);
          }
        })
      );
  }

  /**
   * Registrar nuevo usuario con la API de Laravel
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<RegisterResponse>(`${this.apiUrl}${API_ENDPOINTS.REGISTER}`, userData, { headers });
  }

  /**
   * Cerrar sesión con la API
   */
  logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.post(`${this.apiUrl}${API_ENDPOINTS.LOGOUT}`, {}, { headers })
      .pipe(
        tap((response) => {
          console.log('AuthService Logout Response:', response);
          this.clearAuthData();
        })
      );
  }

  /**
   * Cerrar sesión localmente (sin llamada a la API)
   */
  logoutLocal(): void {
    console.log('Local logout initiated');
    this.clearAuthData();
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuthData(): void {
    // Limpiar localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    // Limpiar subjects
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    
    console.log('Auth data cleared');
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && this.tokenSubject.value !== null;
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Obtener headers con autorización para las peticiones HTTP
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.USR_UserRole === role : false;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Verificar si el usuario es trainer
   */
  isTrainer(): boolean {
    return this.hasRole('trainer');
  }

  /**
   * Guardar datos de autenticación
   */
  private setAuthData(user: User, token: string): void {
    // Guardar en localStorage para persistencia
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
    
    // Actualizar subjects
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
  }

  /**
   * Cargar datos de autenticación guardados
   */
  private loadStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.tokenSubject.next(storedToken);
      } catch (error) {
        console.error('Error loading stored auth data:', error);
        this.logout(); // Limpiar datos corruptos
      }
    }
  }

  /**
   * Obtener el nombre completo del usuario
   */
  getFullName(): string {
    const user = this.getCurrentUser();
    return user ? `${user.USR_Name} ${user.USR_LastName}` : '';
  }

  /**
   * Actualizar información del usuario (para futuras funcionalidades)
   */
  updateUser(userData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }
}