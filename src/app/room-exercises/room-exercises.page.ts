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
  AlertController
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
import { environment } from '../../environments/environment';

// Interfaces
interface Exercise {
  id: number;
  name: string;
  description: string;
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
    private alertController: AlertController,
    private roomService: RoomService,
    private exerciseService: ExerciseService
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
                this.isLoadingExercises = false;
                if (response.success && response.data) {
                  // Mapear los ejercicios de la API a la interfaz local
                  this.exercises = response.data.map(exercise => ({
                    id: exercise.EXC_ID,
                    name: exercise.EXC_Name,
                    description: exercise.EXC_Description,
                    sets: exercise.EXC_Sets,
                    repetitions: exercise.EXC_Reps,
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

  // Método para alternar favoritos
  toggleFavorite(exercise: Exercise) {
    exercise.isFavorite = !exercise.isFavorite;
    console.log(`Ejercicio ${exercise.name} ${exercise.isFavorite ? 'agregado a' : 'removido de'} favoritos`);
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
        await this.showExerciseDetailsModal(response.data, response.total_images, response.total_urls);
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

  // Construir URL completa de la imagen desde Laravel storage
  getImageUrl(relativePath: string | undefined | null): string | null {
    if (!relativePath) return null;
    
    // Si la ruta ya es completa (http/https), retornarla tal cual
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // Construir URL para Laravel storage
    // Laravel storage público: http://127.0.0.1:8000/storage/exercises/...
    const baseUrl = environment.apiUrl.replace('/api', ''); // http://127.0.0.1:8000
    return `${baseUrl}/storage/${relativePath}`;
  }

  // Mostrar modal con detalles completos del ejercicio
  async showExerciseDetailsModal(exercise: FullExercise, totalImages?: number, totalUrls?: number) {
    const mediaItems: Array<{type: string, url: string}> = [];
    
    // Construir lista de imágenes
    if (exercise.EXC_Media1) {
      const url = this.getImageUrl(exercise.EXC_Media1);
      if (url) mediaItems.push({ type: 'image', url });
    }
    if (exercise.EXC_Media2) {
      const url = this.getImageUrl(exercise.EXC_Media2);
      if (url) mediaItems.push({ type: 'image', url });
    }
    if (exercise.EXC_Media3) {
      const url = this.getImageUrl(exercise.EXC_Media3);
      if (url) mediaItems.push({ type: 'image', url });
    }
    if (exercise.EXC_Media4) {
      const url = this.getImageUrl(exercise.EXC_Media4);
      if (url) mediaItems.push({ type: 'image', url });
    }
    
    // Agregar URLs de videos
    if (exercise.EXC_URL1) mediaItems.push({ type: 'url', url: exercise.EXC_URL1 });
    if (exercise.EXC_URL2) mediaItems.push({ type: 'url', url: exercise.EXC_URL2 });

    // Construir mensaje HTML
    let message = `
      <div style="text-align: left;">
        <p><strong>Título:</strong> ${exercise.EXC_Title || 'Sin título'}</p>
        ${exercise.EXC_Type ? `<p><strong>Tipo:</strong> ${exercise.EXC_Type}</p>` : ''}
        ${exercise.EXC_DifficultyLevel ? `<p><strong>Dificultad:</strong> ${exercise.EXC_DifficultyLevel}</p>` : ''}
        ${exercise.EXC_Instructions ? `<p><strong>Instrucciones:</strong> ${exercise.EXC_Instructions}</p>` : ''}
        <p><strong>Archivos multimedia:</strong> ${totalImages || 0} imagen(es)</p>
        <p><strong>URLs externas:</strong> ${totalUrls || 0} video(s)</p>
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
    `;

    // Agregar imágenes si existen
    if (mediaItems.length > 0) {
      message += '<p><strong>Multimedia:</strong></p><div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">';
      
      mediaItems.forEach((media, index) => {
        if (media.type === 'image') {
          message += `<img src="${media.url}" style="width: 100%; max-width: 200px; height: auto; border-radius: 8px; object-fit: cover;" onclick="window.open('${media.url}', '_blank')" />`;
        } else if (media.type === 'url') {
          message += `<p><a href="${media.url}" target="_blank" style="color: #fdbc22;">🎥 Ver Video ${index + 1}</a></p>`;
        }
      });
      
      message += '</div>';
    } else {
      message += '<p style="color: #999;">No hay multimedia disponible</p>';
    }

    message += '</div>';

    const alert = await this.alertController.create({
      header: 'Detalles del Ejercicio',
      message: message,
      cssClass: 'exercise-details-alert',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
          cssClass: 'secondary'
        }
      ]
    });

    await alert.present();
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