import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token del servicio de autenticación
    const token = this.authService.getToken();
    
    // Rutas que no necesitan token
    const publicUrls = ['/login', '/register'];
    const isPublicUrl = publicUrls.some(url => req.url.includes(url));
    
    // Si hay token y la petición no es pública, agregar el header de autorización
    if (token && !isPublicUrl) {
      const headers: { [key: string]: string } = {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      };
      
      // Solo agregar Content-Type si no está presente
      if (!req.headers.has('Content-Type')) {
        headers['Content-Type'] = 'application/json';
      }
      
      const authReq = req.clone({
        setHeaders: headers
      });
      return next.handle(authReq).pipe(
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // Mostrar respuestas exitosas de APIs importantes
            if (req.url.includes('/login') || req.url.includes('/logout') || req.url.includes('/register')) {
              console.log(`API Response [${req.method}] ${req.url}:`, event.body);
            }
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('AuthInterceptor Error:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error
          });
          
          // Si el token está expirado o es inválido (401), cerrar sesión
          if (error.status === 401 && !isPublicUrl) {
            console.log('Token inválido - cerrando sesión automáticamente');
            this.authService.logoutLocal();
            this.router.navigate(['/login'], { replaceUrl: true });
          }
          return throwError(() => error);
        })
      );
    }
    
    // Si no hay token o es una petición pública, enviar la petición original
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Mostrar respuestas exitosas de APIs públicas (login, register)
          if (req.url.includes('/login') || req.url.includes('/register')) {
            console.log(`API Response [${req.method}] ${req.url}:`, event.body);
          }
        }
      })
    );
  }
}