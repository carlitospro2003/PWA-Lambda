import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonLabel, 
  IonButton, 
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonChip,
  IonSpinner,
  ToastController,
  AlertController,
  ModalController
} from '@ionic/angular/standalone';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { RoomService } from '../../services/room.service';
import { addIcons } from 'ionicons';
import { 
  timeOutline,
  fitnessOutline,
  playCircleOutline,
  informationCircleOutline,
  barbell,
  walk,
  bicycle,
  add,
  chevronForward
} from 'ionicons/icons';

interface RoomInfo {
  id: number;
  code: string;
  name: string;
  description: string;
  activeMembers: number;
  totalMembers: number;
}

@Component({
  selector: 'app-room-exercises',
  templateUrl: './room-exercises.page.html',
  styleUrls: ['./room-exercises.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonLabel,
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonChip,
    IonSpinner
  ]
})
export class RoomExercisesPage implements OnInit {
  roomId: number = 0;
  roomInfo: RoomInfo | null = null;
  exercises: Exercise[] = [];
  isLoadingExercises: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private exerciseService: ExerciseService,
    private roomService: RoomService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      timeOutline,
      fitnessOutline,
      playCircleOutline,
      informationCircleOutline,
      barbell,
      walk,
      bicycle,
      add,
      chevronForward
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.roomId = parseInt(id);
      this.loadRoomInfo();
      this.loadExercises();
    }
  }

  loadRoomInfo() {
    // Simular carga de información de la sala (en producción sería una llamada a API)
    const rooms = [
      {
        id: 1,
        code: 'ROOM001',
        name: 'Grupo Principiantes',
        description: 'Rutinas básicas para iniciarse en el fitness',
        activeMembers: 8,
        totalMembers: 10
      },
      {
        id: 2,
        code: 'ROOM002',
        name: 'Grupo Avanzado',
        description: 'Entrenamientos intensivos para atletas experimentados',
        activeMembers: 12,
        totalMembers: 15
      },
      {
        id: 3,
        code: 'ROOM003',
        name: 'Grupo Personalizado',
        description: 'Rutinas adaptadas individualmente',
        activeMembers: 4,
        totalMembers: 5
      }
    ];

    this.roomInfo = rooms.find(room => room.id === this.roomId) || null;
  }

  async loadExercises() {
    this.isLoadingExercises = true;
    try {
      const response = await this.exerciseService.getExercisesByRoom(this.roomId).toPromise();
      if (response && response.success) {
        this.exercises = response.data;
      }
    } catch (error: any) {
      console.error('Error al cargar ejercicios:', error);
      const toast = await this.toastController.create({
        message: error?.error?.message || 'Error al cargar ejercicios',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isLoadingExercises = false;
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'cardio': return 'walk';
      case 'fuerza': return 'barbell';
      case 'hiit': return 'fitness-outline';
      case 'flexibilidad': return 'bicycle';
      case 'funcional': return 'fitness-outline';
      default: return 'fitness-outline';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'cardio': return 'success';
      case 'fuerza': return 'danger';
      case 'hiit': return 'warning';
      case 'flexibilidad': return 'secondary';
      case 'funcional': return 'primary';
      default: return 'medium';
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'principiante': return 'success';
      case 'intermedio': return 'warning';
      case 'avanzado': return 'danger';
      default: return 'medium';
    }
  }

  getDifficultyText(difficulty: string): string {
    switch (difficulty) {
      case 'principiante': return 'Principiante';
      case 'intermedio': return 'Intermedio';
      case 'avanzado': return 'Avanzado';
      default: return difficulty;
    }
  }

  async viewExerciseDetail(exercise: Exercise) {
    console.log('Cargando detalles del ejercicio ID:', exercise.EXC_ID);

    try {
      const response = await this.exerciseService.getExercise(exercise.EXC_ID).toPromise();

      if (response && response.success && response.data) {
        console.log('Detalles del ejercicio:', response.data);
        console.log('Total imágenes:', response.total_images);
        console.log('Total URLs:', response.total_urls);

        // Crear modal con los detalles completos
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

  async showExerciseDetailsModal(exercise: Exercise, totalImages?: number, totalUrls?: number) {
    const mediaItems = [];
    
    // Construir lista de medios
    if (exercise.EXC_Media1) mediaItems.push({ type: 'image', url: exercise.EXC_Media1 });
    if (exercise.EXC_Media2) mediaItems.push({ type: 'image', url: exercise.EXC_Media2 });
    if (exercise.EXC_Media3) mediaItems.push({ type: 'image', url: exercise.EXC_Media3 });
    if (exercise.EXC_Media4) mediaItems.push({ type: 'image', url: exercise.EXC_Media4 });
    if (exercise.EXC_URL1) mediaItems.push({ type: 'url', url: exercise.EXC_URL1 });
    if (exercise.EXC_URL2) mediaItems.push({ type: 'url', url: exercise.EXC_URL2 });

    // Construir mensaje HTML
    let message = `
      <div style="text-align: left;">
        <p><strong>Título:</strong> ${exercise.EXC_Title}</p>
        ${exercise.EXC_Type ? `<p><strong>Tipo:</strong> ${exercise.EXC_Type}</p>` : ''}
        ${exercise.EXC_DifficultyLevel ? `<p><strong>Dificultad:</strong> ${exercise.EXC_DifficultyLevel}</p>` : ''}
        ${exercise.EXC_Instructions ? `<p><strong>Instrucciones:</strong> ${exercise.EXC_Instructions}</p>` : ''}
        ${exercise.room ? `<p><strong>Sala:</strong> ${exercise.room.ROO_Name} (${exercise.room.ROO_Code})</p>` : ''}
        <p><strong>Archivos multimedia:</strong> ${totalImages || 0} imagen(es)</p>
        <p><strong>URLs externas:</strong> ${totalUrls || 0} video(s)</p>
    `;

    // Agregar medios si existen
    if (mediaItems.length > 0) {
      message += '<hr><p><strong>Multimedia:</strong></p><ul style="padding-left: 20px;">';
      mediaItems.forEach((item, index) => {
        if (item.type === 'image') {
          message += `<li>Imagen ${index + 1}: <a href="${item.url}" target="_blank">Ver</a></li>`;
        } else {
          message += `<li>Video ${index + 1}: <a href="${item.url}" target="_blank">Ver en YouTube</a></li>`;
        }
      });
      message += '</ul>';
    }

    message += '</div>';

    const alert = await this.alertController.create({
      header: 'Detalles del Ejercicio',
      message: message,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        },
        {
          text: 'Ver Multimedia',
          handler: () => {
            if (mediaItems.length > 0) {
              console.log('Abrir galería de multimedia');
              // Aquí podrías abrir un modal con galería de imágenes
            }
          }
        }
      ],
      cssClass: 'exercise-details-alert'
    });

    await alert.present();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  addNewExercise() {
    // Navegar a la página para agregar un nuevo ejercicio
    this.router.navigate(['/trainer/add-exercise', this.roomId]);
  }

  goBack() {
    this.router.navigate(['/trainer/dashboard']);
  }
}
