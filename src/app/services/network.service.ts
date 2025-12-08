import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public online$: Observable<boolean> = this.onlineSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.initNetworkListener();
  }

  /**
   * Inicializar listener de eventos de red
   */
  private initNetworkListener(): void {
    // Escuchar eventos online/offline
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(status => {
      this.ngZone.run(() => {
        console.log(`[NETWORK] Estado de red: ${status ? 'ONLINE' : 'OFFLINE'}`);
        this.onlineSubject.next(status);
      });
    });
  }

  /**
   * Verificar si hay conexión
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Verificar si está offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }
}
