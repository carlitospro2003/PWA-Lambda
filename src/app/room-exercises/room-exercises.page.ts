import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonLabel,
  IonIcon,
  IonButton,
  IonButtons,
  IonBackButton,
  IonChip,
  IonSpinner,
  ToastController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  fitnessOutline,
  timeOutline,
  barbellOutline,
  flashOutline,
  checkmarkCircleOutline,
  playCircleOutline,
  informationCircleOutline,
  peopleOutline,
  trophyOutline,
  refreshOutline,
  personOutline,
  heart,
  heartOutline,
  imagesOutline,
  closeCircle
} from 'ionicons/icons';
import { RoomService, Exercise as ApiExercise } from '../services/room.service';
import { ExerciseService, Exercise as FullExercise } from '../services/exercise.service';
import { RoutineService } from '../services/routine.service';
import { StorageService } from '../services/storage.service';
import { ExerciseDetailModalComponent } from './exercise-detail-modal.component';
import { environment } from '../../environments/environment';

// Interfaces
interface Exercise {
  id: number;
  name: string;
  description: string;
  type?: string;
  difficulty?: string;
  sets: number;
  repetitions: number;
  roomId: number;
  createdAt: string;
  isFavorite?: boolean;
  completed?: boolean;
  completedAt?: Date;
}

interface RoomDetails {
  id: number;
  name: string;
  code: string;
  description: string;
  totalMembers: number;
  totalExercises: number;
  completedExercises: number;
  trainerName: string;
}

@Component({
  selector: 'app-room-exercises',
  templateUrl: './room-exercises.page.html',
  styleUrls: ['./room-exercises.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonLabel,
    IonIcon,
    IonButton,
    IonButtons,
    IonBackButton,
    IonChip,
    IonSpinner
  ]
})
export class RoomExercisesPage implements OnInit {
  roomId!: number;
  roomDetails: RoomDetails = {} as RoomDetails;
  exercises: Exercise[] = [];
  isLoadingExercises: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private modalController: ModalController,
    private roomService: RoomService,
    private exerciseService: ExerciseService,
    private routineService: RoutineService,
    private storageService: StorageService
  ) {
    addIcons({
      fitnessOutline,
      timeOutline,
      barbellOutline,
      flashOutline,
      checkmarkCircleOutline,
      playCircleOutline,
      informationCircleOutline,
      peopleOutline,
      trophyOutline,
      refreshOutline,
      personOutline,
      heart,
      heartOutline,
      imagesOutline,
      closeCircle
    });
  }

  ngOnInit() {
    // Obtener el ID de la sala desde los parámetros de la ruta
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRoomData();
  }

  loadRoomData() {
    this.isLoadingExercises = true;

    // Primero obtenemos las salas unidas del usuario para obtener los detalles reales
    this.roomService.getMyJoinedRooms()
      .subscribe({
        next: (roomsResponse) => {
          // Buscar la sala actual en las salas unidas
          const currentRoom = roomsResponse.rooms?.find(room => room.ROO_ID === this.roomId);
          
          // Ahora obtenemos los ejercicios
          this.roomService.getExercisesByRoom(this.roomId)
            .subscribe({
              next: (response) => {
                if (response.success && response.data) {
                  // Mapear los ejercicios de la API a la interfaz local
                  this.exercises = response.data.map(exercise => ({
                    id: exercise.EXC_ID,
                    name: exercise.EXC_Title, // Corregido: usar EXC_Title en lugar de EXC_Name
                    description: exercise.EXC_Instructions, // Corregido: usar EXC_Instructions
                    type: exercise.EXC_Type,
                    difficulty: exercise.EXC_DifficultyLevel,
                    sets: 0, // La API no devuelve sets en esta respuesta
                    repetitions: 0, // La API no devuelve reps en esta respuesta
                    roomId: exercise.EXC_ROO_ID,
                    createdAt: exercise.created_at,
                    isFavorite: false,
                    completed: false
                  }));

                  // Actualizar detalles de la sala con datos reales
                  this.roomDetails = {
                    id: this.roomId,
                    name: currentRoom?.ROO_Name || 'Sala de Entrenamiento',
                    code: currentRoom?.ROO_Code || 'N/A',
                    description: 'Sala de entrenamiento',
                    totalMembers: 0,
                    totalExercises: response.total_exercises,
                    completedExercises: 0,
                    trainerName: currentRoom?.user?.USR_Name || 'Entrenador'
                  };

                  // Cargar favoritos del usuario para marcar los corazones
                  this.loadFavorites();
                } else {
                  this.isLoadingExercises = false;
                }
              },
              error: async (error) => {
                this.isLoadingExercises = false;
                console.error('Error loading exercises:', error);

                if (error.status === 404) {
                  if (error.error?.message?.includes('Usuario')) {
                    await this.showToast('Usuario no encontrado', 'danger');
                  } else {
                    await this.showToast('Sala no encontrada', 'danger');
                  }
                } else {
                  await this.showToast('Error al cargar los ejercicios', 'danger');
                }
              }
            });
        },
        error: async (error) => {
          this.isLoadingExercises = false;
          console.error('Error loading rooms:', error);
          await this.showToast('Error al cargar información de la sala', 'danger');
        }
      });
  }

  // Cargar favoritos del usuario
  loadFavorites() {
    this.routineService.getMyRoutines().subscribe({
      next: (response) => {
        this.isLoadingExercises = false;
        
        if (response && response.success && response.data) {
          // Crear un Set con los IDs de ejercicios favoritos
          const favoriteExerciseIds = new Set(
            response.data
              .filter(routine => routine.ROU_Fav === true)
              .map(routine => routine.ROU_EXC_ID)
          );

          // Marcar los ejercicios que ya son favoritos
          this.exercises.forEach(exercise => {
            exercise.isFavorite = favoriteExerciseIds.has(exercise.id);
          });

          console.log('Favoritos cargados:', favoriteExerciseIds.size);
        }
      },
      error: (error) => {
        this.isLoadingExercises = false;
        console.error('Error loading favorites:', error);
        // No mostramos error al usuario, solo log
      }
    });
  }

  // Método para alternar favoritos
  async toggleFavorite(exercise: Exercise) {
    // Evitar que se ejecute múltiples veces
    if (exercise.isFavorite) {
      await this.showToast('Este ejercicio ya está en tus favoritos', 'warning');
      return;
    }

    try {
      // 1. Primero crear la rutina
      const createResponse = await this.routineService.createRoutine(exercise.id).toPromise();
      
      if (!createResponse || !createResponse.success) {
        await this.showToast(createResponse?.message || 'Error al crear rutina', 'danger');
        return;
      }

      console.log('Rutina creada:', createResponse.data);

      // 2. Luego marcar como favorito
      const favoriteResponse = await this.routineService.addFavorite(exercise.id).toPromise();
      
      if (favoriteResponse && favoriteResponse.success) {
        exercise.isFavorite = true;
        await this.showToast('✅ Ejercicio agregado a favoritos', 'success');
        console.log('Marcado como favorito:', favoriteResponse.data);
        
        // Guardar en cache local para uso offline
        if (favoriteResponse.data) {
          await this.storageService.addFavorite(favoriteResponse.data);
        }
      } else {
        await this.showToast(favoriteResponse?.message || 'Error al marcar como favorito', 'warning');
      }

    } catch (error: any) {
      console.error('Error al procesar favorito:', error);
      
      let errorMessage = 'Error al agregar a favoritos';
      
      // Si la rutina ya existe (409), intentar solo marcar como favorito
      if (error.status === 409) {
        try {
          const favoriteResponse = await this.routineService.addFavorite(exercise.id).toPromise();
          
          if (favoriteResponse && favoriteResponse.success) {
            exercise.isFavorite = true;
            await this.showToast('✅ Ejercicio agregado a favoritos', 'success');
            
            // Guardar en cache local para uso offline
            if (favoriteResponse.data) {
              await this.storageService.addFavorite(favoriteResponse.data);
            }
            return;
          }
        } catch (favError: any) {
          console.error('Error al marcar como favorito:', favError);
          errorMessage = favError.error?.message || 'Error al marcar como favorito';
        }
      } else if (error.status === 404) {
        errorMessage = error.error?.message || 'Ejercicio no encontrado';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      await this.showToast(errorMessage, 'danger');
    }
  }

  // Obtener progreso de la sala
  getRoomProgress(): number {
    return Math.round((this.roomDetails.completedExercises / this.roomDetails.totalExercises) * 100);
  }

  // Iniciar ejercicio
  async startExercise(exercise: Exercise) {
    const toast = await this.toastController.create({
      message: `Iniciando ejercicio: ${exercise.name}`,
      duration: 2000,
      position: 'top',
      color: 'primary',
      icon: 'play-circle-outline'
    });
    await toast.present();

    // Aquí se podría navegar a una vista de ejercicio individual
    console.log('Iniciando ejercicio:', exercise.name);
  }

  // Marcar ejercicio como completado
  async markAsCompleted(exercise: Exercise) {
    exercise.completed = true;
    exercise.completedAt = new Date();
    this.roomDetails.completedExercises++;

    const toast = await this.toastController.create({
      message: `¡Ejercicio completado! 🎉`,
      duration: 2000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  // Ver detalles del ejercicio
  async viewExerciseDetails(exercise: Exercise) {
    try {
      const response = await this.exerciseService.getExercise(exercise.id).toPromise();
      
      if (response && response.success && response.data) {
        const modal = await this.modalController.create({
          component: ExerciseDetailModalComponent,
          componentProps: {
            exercise: response.data,
            totalImages: response.total_images,
            totalUrls: response.total_urls
          }
        });
        
        await modal.present();
      } else {
        await this.showToast('No se pudieron cargar los detalles', 'warning');
      }
    } catch (error: any) {
      console.error('Error al cargar detalles del ejercicio:', error);
      
      let errorMessage = 'Error al cargar detalles del ejercicio';
      if (error.status === 404) {
        errorMessage = 'Ejercicio no encontrado';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      await this.showToast(errorMessage, 'danger');
    }
  }

  // Formatear tiempo
  formatTime(completedAt: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - completedAt.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  }

  // Track by function para ngFor
  trackByExerciseId(index: number, exercise: Exercise): number {
    return exercise.id;
  }

  // Obtener color según dificultad
  getDifficultyColor(difficulty: string | undefined): string {
    if (!difficulty) return 'medium';
    const diff = difficulty.toLowerCase();
    switch (diff) {
      case 'principiante': return 'success';
      case 'intermedio': return 'warning';
      case 'avanzado': return 'danger';
      default: return 'medium';
    }
  }

  // Mostrar toast con mensaje
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