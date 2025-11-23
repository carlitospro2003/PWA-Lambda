import { Injectable } from '@angular/core';
import { Routine } from './routine.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbName = 'LambdaDB';
  private dbVersion = 1;
  private storeName = 'favorites';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  /**
   * Inicializar IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Error al abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB inicializado correctamente');
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        // Crear object store si no existe
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'ROU_ID' });
          objectStore.createIndex('ROU_EXC_ID', 'ROU_EXC_ID', { unique: false });
          objectStore.createIndex('ROU_Fav', 'ROU_Fav', { unique: false });
          console.log('Object store creado:', this.storeName);
        }
      };
    });
  }

  /**
   * Asegurar que la base de datos esté inicializada
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  /**
   * Guardar favoritos en IndexedDB
   */
  async saveFavorites(routines: Routine[]): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);

      // Limpiar store antes de guardar nuevos datos
      objectStore.clear();

      // Guardar cada rutina
      routines.forEach(routine => {
        objectStore.add(routine);
      });

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log(`${routines.length} favoritos guardados en IndexedDB`);
          resolve();
        };
        transaction.onerror = () => {
          console.error('Error al guardar favoritos:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Error en saveFavorites:', error);
      throw error;
    }
  }

  /**
   * Obtener favoritos desde IndexedDB
   */
  async getFavorites(): Promise<Routine[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const routines = request.result as Routine[];
          console.log(`${routines.length} favoritos obtenidos de IndexedDB`);
          resolve(routines);
        };
        request.onerror = () => {
          console.error('Error al obtener favoritos:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error en getFavorites:', error);
      return [];
    }
  }

  /**
   * Agregar un favorito a IndexedDB
   */
  async addFavorite(routine: Routine): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      
      objectStore.put(routine); // Usa put para actualizar si ya existe

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log('Favorito agregado a IndexedDB');
          resolve();
        };
        transaction.onerror = () => {
          console.error('Error al agregar favorito:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Error en addFavorite:', error);
      throw error;
    }
  }

  /**
   * Eliminar un favorito de IndexedDB
   */
  async removeFavorite(routineId: number): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      
      objectStore.delete(routineId);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log('Favorito eliminado de IndexedDB');
          resolve();
        };
        transaction.onerror = () => {
          console.error('Error al eliminar favorito:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Error en removeFavorite:', error);
      throw error;
    }
  }

  /**
   * Limpiar todos los favoritos
   */
  async clearFavorites(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      
      objectStore.clear();

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log('Favoritos limpiados de IndexedDB');
          resolve();
        };
        transaction.onerror = () => {
          console.error('Error al limpiar favoritos:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Error en clearFavorites:', error);
      throw error;
    }
  }

  /**
   * Verificar si hay conexión a internet
   */
  isOnline(): boolean {
    return navigator.onLine;
  }
}
