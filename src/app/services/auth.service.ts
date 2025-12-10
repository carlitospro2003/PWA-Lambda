import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment, API_ENDPOINTS } from '../../environments/environment';
import { FirebaseService } from './firebase.service';

// Interfaces para la API
export interface LoginRequest {
  USR_Email: string;
  USR_Password: string;
  fcm_token?: string;
  USR_2FA_Code?: string;
}

export interface RegisterRequest {
  USR_Name: string;
  USR_LastName: string;
  USR_Email: string;
  USR_Phone: string;
  USR_Password: string;
  USR_UserRole: 'trainer' | 'trainee';
  recaptcha_token: string;
}

export interface User {
  USR_ID: number;
  USR_Name: string;
  USR_LastName: string;
  USR_Email: string;
  USR_Phone: string;
  USR_UserRole: string;
  USR_FCM: string;
  USR_2FA_Enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: User;
  token?: string;
  errors?: any;
  requires_2fa?: boolean;
  email_sent?: boolean;
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
  private refreshTokenInterval: any = null;
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  // Constantes para el refresco de token
  private readonly TOKEN_LIFETIME = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
  private readonly REFRESH_BEFORE_EXPIRY = 2 * 60 * 60 * 1000; // Refrescar 2 horas antes de expirar
  private readonly REFRESH_CHECK_INTERVAL = 30 * 60 * 1000; // Verificar cada 30 minutos

  constructor(private http: HttpClient) {
    // Cargar datos guardados del localStorage al inicializar
    this.loadStoredAuth();
    
    // Iniciar sistema de refresco automático de token
    this.startTokenRefreshScheduler();
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
   * Verificar código 2FA
   */
  verify2FA(verifyData: { USR_Email: string; USR_2FA_Code: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}${API_ENDPOINTS.VERIFY_2FA}`, verifyData, { headers })
      .pipe(
        tap(response => {
          if (response.success && response.data && response.token) {
            this.setAuthData(response.data, response.token);
          }
        })
      );
  }

  /**
   * Cerrar sesión con la API
   * El backend limpiará el token FCM del usuario estableciéndolo como ' ' (espacio)
   * para que no reciba más notificaciones push
   */
  logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.post(`${this.apiUrl}${API_ENDPOINTS.LOGOUT}`, {}, { headers })
      .pipe(
        tap((response) => {
          console.log('AuthService Logout Response:', response);
          console.log('[AUTH] Backend ha limpiado el token FCM del usuario');
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
   * Refrescar el token de autenticación
   */
  refreshToken(): Observable<any> {
    const headers = this.getAuthHeaders();
    
    console.log('[AUTH] 🔄 Refrescando token de autenticación...');
    
    return this.http.post<any>(`${this.apiUrl}${API_ENDPOINTS.REFRESH_TOKEN}`, {}, { headers })
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            console.log('[AUTH] ✅ Token refrescado exitosamente');
            
            // Actualizar solo el token, mantener el usuario actual
            const currentUser = this.getCurrentUser();
            if (currentUser) {
              this.setAuthData(currentUser, response.token);
              
              // Guardar timestamp del último refresco
              localStorage.setItem('tokenRefreshedAt', Date.now().toString());
              
              console.log('[AUTH] 💾 Token actualizado en localStorage');
            }
          } else {
            console.warn('[AUTH] ⚠️ Respuesta de refresco sin token válido');
          }
        })
      );
  }

  /**
   * Iniciar programador de refresco automático de token
   */
  private startTokenRefreshScheduler(): void {
    // Limpiar intervalo anterior si existe
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }

    console.log('[AUTH] 🔁 Iniciando programador de refresco automático de token');
    console.log(`[AUTH] ⏰ Verificación cada ${this.REFRESH_CHECK_INTERVAL / 60000} minutos`);
    console.log(`[AUTH] 🕐 Token válido por 24 horas, se refrescará 2 horas antes de expirar`);

    // Verificar inmediatamente si necesita refresco
    this.checkAndRefreshToken();

    // Configurar intervalo para verificar periódicamente
    this.refreshTokenInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, this.REFRESH_CHECK_INTERVAL);
  }

  /**
   * Verificar si el token necesita ser refrescado y hacerlo si es necesario
   */
  private checkAndRefreshToken(): void {
    // Verificar si el usuario está autenticado
    if (!this.isAuthenticated()) {
      console.log('[AUTH] 👤 Usuario no autenticado, saltando verificación de token');
      return;
    }

    const tokenRefreshedAt = localStorage.getItem('tokenRefreshedAt');
    const lastRefreshTime = tokenRefreshedAt ? parseInt(tokenRefreshedAt) : 0;
    const currentTime = Date.now();
    const timeSinceLastRefresh = currentTime - lastRefreshTime;

    // Si no hay timestamp de refresco, establecer uno ahora (probablemente es un login reciente)
    if (!tokenRefreshedAt) {
      localStorage.setItem('tokenRefreshedAt', currentTime.toString());
      console.log('[AUTH] 📝 Estableciendo timestamp inicial de token');
      return;
    }

    // Calcular tiempo hasta la expiración
    const timeUntilExpiry = this.TOKEN_LIFETIME - timeSinceLastRefresh;
    const hoursUntilExpiry = (timeUntilExpiry / (60 * 60 * 1000)).toFixed(2);

    console.log(`[AUTH] ⏱️ Tiempo desde último refresco: ${(timeSinceLastRefresh / 60000).toFixed(0)} minutos`);
    console.log(`[AUTH] ⏳ Tiempo hasta expiración: ~${hoursUntilExpiry} horas`);

    // Si el token está cerca de expirar (menos de 2 horas), refrescarlo
    if (timeUntilExpiry <= this.REFRESH_BEFORE_EXPIRY) {
      console.log('[AUTH] ⚠️ Token cerca de expirar, iniciando refresco...');
      
      this.refreshToken().subscribe({
        next: (response) => {
          console.log('[AUTH] ✅ Token refrescado automáticamente');
        },
        error: (error) => {
          console.error('[AUTH] ❌ Error al refrescar token automáticamente:', error);
          
          // Si el token ya expiró o es inválido, cerrar sesión
          if (error.status === 401 || error.status === 500) {
            console.error('[AUTH] 🚪 Token inválido o expirado, cerrando sesión...');
            this.logoutLocal();
          }
        }
      });
    } else {
      console.log('[AUTH] ✅ Token válido, no necesita refresco aún');
    }
  }

  /**
   * Detener el programador de refresco de token
   */
  private stopTokenRefreshScheduler(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
      console.log('[AUTH] 🛑 Programador de refresco de token detenido');
    }
  }

  /**
   * Limpiar datos de autenticación
   * Nota: El token FCM ya fue limpiado en el backend por el método logout()
   */
  private clearAuthData(): void {
    // Detener programador de refresco de token
    this.stopTokenRefreshScheduler();
    
    // Detener listener de notificaciones Firebase y limpiar token FCM
    try {
      const firebaseService = (window as any).firebaseServiceInstance;
      if (firebaseService) {
        if (firebaseService.clearFCMToken) {
          firebaseService.clearFCMToken();
          console.log('[AUTH] Token FCM limpiado en Firebase');
        }
        if (firebaseService.stopListening) {
          firebaseService.stopListening();
          console.log('[AUTH] Listener de Firebase detenido');
        }
      }
    } catch (error) {
      console.log('[AUTH] No se pudo detener listener de Firebase:', error);
    }

    // Nota: No desregistramos el Service Worker para mantener la funcionalidad PWA
    // El backend ya limpió el token FCM del usuario (USR_FCM = ' ')
    // por lo que no recibirá más notificaciones push

    // Limpiar notificaciones primero
    try {
      // Intentar obtener el NotificationService si está disponible
      const injector = (window as any).ngInjector;
      if (injector) {
        const notificationService = injector.get('NotificationService');
        if (notificationService) {
          notificationService.clear();
          console.log('Notificaciones limpiadas');
        }
      }
    } catch (error) {
      // Si no se puede acceder al servicio, continuar
      console.log('No se pudo limpiar notificaciones en logout');
    }
    
    // Limpiar localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenRefreshedAt');
    
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
    localStorage.setItem('tokenRefreshedAt', Date.now().toString());
    
    // Actualizar subjects
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
    
    // Reiniciar programador de refresco con el nuevo token
    this.startTokenRefreshScheduler();
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