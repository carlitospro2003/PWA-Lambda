import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonButton, 
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { ExerciseService, CreateExerciseRequest } from '../../services/exercise.service';
import { RoomService } from '../../services/room.service';
import { addIcons } from 'ionicons';
import { 
  saveOutline,
  fitnessOutline
} from 'ionicons/icons';

interface ExerciseFormData {
  EXC_Title: string;
  EXC_Type: string;
  EXC_DifficultyLevel: string;
  EXC_Instructions: string;
  EXC_ROO_ID: number;
}

@Component({
  selector: 'app-add-exercise',
  templateUrl: './add-exercise.page.html',
  styleUrls: ['./add-exercise.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption
  ]
})
export class AddExercisePage implements OnInit {
  roomId: string = '';
  roomName: string = 'Sala de Entrenamiento';
  isCreating: boolean = false;

  exerciseForm: ExerciseFormData = {
    EXC_Title: '',
    EXC_Type: '',
    EXC_DifficultyLevel: '',
    EXC_Instructions: '',
    EXC_ROO_ID: 0
  };

  exerciseTypes = [
    { value: 'Calentamiento', label: 'Calentamiento' },
    { value: 'Calistenia', label: 'Calistenia' },
    { value: 'Musculatura', label: 'Musculatura' },
    { value: 'Elasticidad', label: 'Elasticidad' },
    { value: 'Resistencia', label: 'Resistencia' },
    { value: 'Médico', label: 'Médico' }
  ];

  difficultyLevels = [
    { value: 'PRINCIPIANTE', label: 'PRINCIPIANTE' },
    { value: 'INTERMEDIO', label: 'INTERMEDIO' },
    { value: 'AVANZADO', label: 'AVANZADO' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private exerciseService: ExerciseService,
    private roomService: RoomService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ saveOutline, fitnessOutline });
  }

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
    this.exerciseForm.EXC_ROO_ID = parseInt(this.roomId);
    this.loadRoomData();
  }

  loadRoomData() {
    // Cargar el nombre de la sala desde el servicio
    this.roomService.getMyRooms().subscribe({
      next: (response) => {
        if (response.success && response.rooms) {
          const room = response.rooms.find(r => r.ROO_ID.toString() === this.roomId);
          this.roomName = room ? room.ROO_Name : 'Sala Desconocida';
        }
      },
      error: (error) => {
        console.error('Error al cargar datos de la sala:', error);
        this.roomName = 'Sala Desconocida';
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.exerciseForm.EXC_Title?.trim());
  }

  async saveExercise() {
    if (!this.isFormValid()) {
      await this.showToast('El título del ejercicio es obligatorio', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando ejercicio...',
      duration: 10000
    });

    await loading.present();
    this.isCreating = true;

    // Preparar datos para enviar a la API
    const exerciseData: CreateExerciseRequest = {
      EXC_Title: this.exerciseForm.EXC_Title.trim(),
      EXC_ROO_ID: this.exerciseForm.EXC_ROO_ID
    };

    // Solo agregar campos opcionales si tienen valor
    if (this.exerciseForm.EXC_Type) {
      exerciseData.EXC_Type = this.exerciseForm.EXC_Type;
    }
    if (this.exerciseForm.EXC_DifficultyLevel) {
      exerciseData.EXC_DifficultyLevel = this.exerciseForm.EXC_DifficultyLevel;
    }
    if (this.exerciseForm.EXC_Instructions?.trim()) {
      exerciseData.EXC_Instructions = this.exerciseForm.EXC_Instructions.trim();
    }

    console.log('Creando ejercicio con datos:', exerciseData);

    this.exerciseService.createExercise(exerciseData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isCreating = false;

        console.log('Respuesta de creación de ejercicio:', response);

        if (response.success) {
          await this.showToast(response.message, 'success');
          this.router.navigate([`/trainer/room-exercises/${this.roomId}`]);
        } else {
          await this.showToast(response.message || 'Error al crear el ejercicio', 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isCreating = false;

        console.error('Error al crear ejercicio:', error);

        let errorMessage = 'Error al crear el ejercicio';
        
        if (error.status === 422 && error.error?.errors) {
          // Errores de validación
          const validationErrors = error.error.errors;
          errorMessage = Object.values(validationErrors)[0] as string;
        } else if (error.status === 403) {
          errorMessage = 'No tienes permiso para agregar ejercicios a esta sala';
        } else if (error.status === 404) {
          errorMessage = error.error?.message || 'Sala no encontrada';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        await this.showToast(errorMessage, 'danger');
      }
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  cancel() {
    this.router.navigate([`/trainer/room-exercises/${this.roomId}`]);
  }
}
