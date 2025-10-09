import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
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
        catchError((error: HttpErrorResponse) => {
          // Si el token está expirado o es inválido (401), cerrar sesión
          if (error.status === 401 && !isPublicUrl) {
            this.authService.logoutLocal();
            this.router.navigate(['/login'], { replaceUrl: true });
          }
          return throwError(() => error);
        })
      );
    }
    
    // Si no hay token o es una petición pública, enviar la petición original
    return next.handle(req);
  }
}