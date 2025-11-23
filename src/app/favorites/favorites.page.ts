import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, fitnessOutline, informationCircleOutline, cloudOfflineOutline } from 'ionicons/icons';
import { RoutineService, Routine } from '../services/routine.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonChip,
    IonIcon,
    IonSpinner
  ]
})
export class FavoritesPage implements OnInit {
  routines: Routine[] = [];
  isLoading: boolean = false;
  isOffline: boolean = false;

  constructor(
    private routineService: RoutineService,
    private storageService: StorageService,
    private toastController: ToastController
  ) {
    addIcons({
      heartOutline,
      fitnessOutline,
      informationCircleOutline,
      cloudOfflineOutline
    });
  }

  ngOnInit() {
    this.checkConnection();
    this.loadFavorites();
    
    // Escuchar cambios en la conexión
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  ngOnDestroy() {
    window.removeEventListener('online', () => this.handleOnline());
    window.removeEventListener('offline', () => this.handleOffline());
  }

  checkConnection() {
    this.isOffline = !this.storageService.isOnline();
  }

  async handleOnline() {
    this.isOffline = false;
    await this.showToast('✅ Conexión restaurada. Sincronizando...', 'success');
    this.loadFavorites();
  }

  async handleOffline() {
    this.isOffline = true;
    await this.showToast('📵 Sin conexión. Mostrando favoritos guardados', 'warning');
    await this.loadOfflineFavorites();
  }

  async loadFavorites() {
    this.isLoading = true;
    
    // Verificar si hay conexión
    if (!this.storageService.isOnline()) {
      console.log('Sin conexión, cargando desde IndexedDB');
      await this.loadOfflineFavorites();
      return;
    }

    try {
      const response = await this.routineService.getMyRoutines().toPromise();
      
      if (response && response.success) {
        this.routines = response.data;
        console.log('Rutinas cargadas desde API:', this.routines);
        
        // Guardar en IndexedDB para uso offline
        await this.storageService.saveFavorites(this.routines);
      } else {
        await this.showToast(response?.message || 'No se pudieron cargar los favoritos', 'warning');
        // Si falla la API, cargar desde cache
        await this.loadOfflineFavorites();
      }
    } catch (error: any) {
      console.error('Error al cargar rutinas desde API:', error);
      
      // Si hay error de red, cargar desde cache
      if (!navigator.onLine || error.status === 0) {
        console.log('Error de red, cargando desde cache');
        await this.loadOfflineFavorites();
      } else {
        let errorMessage = 'Error al cargar favoritos';
        if (error.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        await this.showToast(errorMessage, 'danger');
        // Intentar cargar desde cache como fallback
        await this.loadOfflineFavorites();
      }
    } finally {
      this.isLoading = false;
    }
  }

  async loadOfflineFavorites() {
    this.isLoading = true;
    
    try {
      this.routines = await this.storageService.getFavorites();
      
      if (this.routines.length > 0) {
        console.log(`${this.routines.length} favoritos cargados desde IndexedDB`);
        if (this.isOffline) {
          await this.showToast(`📱 ${this.routines.length} favoritos disponibles offline`, 'warning');
        }
      } else {
        if (this.isOffline) {
          await this.showToast('No hay favoritos guardados para modo offline', 'warning');
        }
      }
    } catch (error) {
      console.error('Error al cargar favoritos offline:', error);
      await this.showToast('Error al cargar favoritos guardados', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  getDifficultyColor(difficulty: string): string {
    const diff = difficulty?.toLowerCase() || '';
    switch (diff) {
      case 'principiante': return 'success';
      case 'intermedio': return 'warning';
      case 'avanzado': return 'danger';
      default: return 'medium';
    }
  }

  // Track by function para ngFor
  trackByRoutineId(index: number, routine: Routine): number {
    return routine.ROU_ID;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}