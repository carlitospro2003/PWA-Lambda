import { Injectable } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { NetworkService } from '../services/network.service';

/**
 * Interceptor para manejar caché offline y sincronización
 */
export const cacheInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const networkService = inject(NetworkService);

  // Si es una petición GET y estamos offline, intentar obtener del caché
  if (req.method === 'GET' && networkService.isOffline()) {
    console.log('[CACHE] Offline - intentando obtener del caché:', req.url);
  }

  return next(req).pipe(
    tap(event => {
      // Guardar en caché las respuestas exitosas (lo hace automáticamente el SW)
      console.log('[CACHE] Respuesta exitosa para:', req.url);
    }),
    catchError(error => {
      // Si falla y estamos offline, intentar del caché
      if (networkService.isOffline()) {
        console.warn('[CACHE] Error offline, usando caché si está disponible');
      }
      return throwError(() => error);
    })
  );
};
