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
  fitnessOutline,
  cloudUploadOutline,
  closeOutline,
  linkOutline
} from 'ionicons/icons';

interface ExerciseFormData {
  EXC_Title: string;
  EXC_Type: string;
  EXC_DifficultyLevel: string;
  EXC_Instructions: string;
  EXC_ROO_ID: number;
  EXC_URL1?: string;
  EXC_URL2?: string;
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

  // Archivos multimedia seleccionados
  uploadedFiles: { [key: string]: File } = {};

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
    addIcons({ saveOutline, fitnessOutline, cloudUploadOutline, closeOutline, linkOutline });
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

  // Manejar selección de archivos
  onFileSelected(event: any, mediaField: string) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/mov'];
      if (!allowedTypes.includes(file.type)) {
        this.showToast('Solo se permiten archivos: JPEG, PNG, WEBP, MP4, MOV', 'danger');
        event.target.value = '';
        return;
      }

      // Validar tamaño (máximo 20MB)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        this.showToast('El archivo es muy grande. Máximo 20MB permitido', 'danger');
        event.target.value = '';
        return;
      }

      this.uploadedFiles[mediaField] = file;
      this.showToast(`Archivo seleccionado: ${file.name}`, 'success');
    }
  }

  // Eliminar archivo seleccionado
  removeFile(mediaField: string) {
    delete this.uploadedFiles[mediaField];
    // Resetear el input file
    const fileInput = document.querySelector(`input[data-field="${mediaField}"]`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.showToast('Archivo eliminado', 'medium');
  }

  // Obtener nombre del archivo seleccionado
  getFileName(mediaField: string): string {
    return this.uploadedFiles[mediaField]?.name || 'Ningún archivo seleccionado';
  }

  // Verificar si hay archivo seleccionado
  hasFile(mediaField: string): boolean {
    return !!this.uploadedFiles[mediaField];
  }

  async saveExercise() {
    if (!this.isFormValid()) {
      await this.showToast('El título del ejercicio es obligatorio', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando ejercicio...',
      duration: 30000
    });

    await loading.present();
    this.isCreating = true;

    // Crear FormData para enviar archivos
    const formData = new FormData();
    
    // Campo obligatorio - asegurar que sean strings simples
    const title = String(this.exerciseForm.EXC_Title || '').trim();
    const roomId = String(this.exerciseForm.EXC_ROO_ID || 0);
    
    formData.append('EXC_Title', title);
    formData.append('EXC_ROO_ID', roomId);
    
    // Campos opcionales - solo agregar si tienen valor
    if (this.exerciseForm.EXC_Type && String(this.exerciseForm.EXC_Type).trim() !== '') {
      formData.append('EXC_Type', String(this.exerciseForm.EXC_Type).trim());
    }
    if (this.exerciseForm.EXC_DifficultyLevel && String(this.exerciseForm.EXC_DifficultyLevel).trim() !== '') {
      formData.append('EXC_DifficultyLevel', String(this.exerciseForm.EXC_DifficultyLevel).trim());
    }
    if (this.exerciseForm.EXC_Instructions && String(this.exerciseForm.EXC_Instructions).trim() !== '') {
      formData.append('EXC_Instructions', String(this.exerciseForm.EXC_Instructions).trim());
    }
    if (this.exerciseForm.EXC_URL1 && String(this.exerciseForm.EXC_URL1).trim() !== '') {
      formData.append('EXC_URL1', String(this.exerciseForm.EXC_URL1).trim());
    }
    if (this.exerciseForm.EXC_URL2 && String(this.exerciseForm.EXC_URL2).trim() !== '') {
      formData.append('EXC_URL2', String(this.exerciseForm.EXC_URL2).trim());
    }
    
    // Agregar archivos multimedia
    for (let i = 1; i <= 4; i++) {
      const mediaKey = `EXC_Media${i}`;
      if (this.uploadedFiles[mediaKey]) {
        formData.append(mediaKey, this.uploadedFiles[mediaKey]);
      }
    }

    // Log para debugging - ver qué estamos enviando
    console.log('=== DATOS DEL FORMULARIO ===');
    console.log('EXC_Title (tipo):', typeof this.exerciseForm.EXC_Title, 'valor:', this.exerciseForm.EXC_Title);
    console.log('EXC_ROO_ID (tipo):', typeof this.exerciseForm.EXC_ROO_ID, 'valor:', this.exerciseForm.EXC_ROO_ID);
    console.log('EXC_Type:', this.exerciseForm.EXC_Type);
    console.log('EXC_DifficultyLevel:', this.exerciseForm.EXC_DifficultyLevel);
    console.log('EXC_Instructions:', this.exerciseForm.EXC_Instructions);
    console.log('EXC_URL1:', this.exerciseForm.EXC_URL1);
    console.log('EXC_URL2:', this.exerciseForm.EXC_URL2);
    console.log('Archivos cargados:', Object.keys(this.uploadedFiles));
    
    // Mostrar contenido del FormData
    console.log('=== CONTENIDO DE FORMDATA ===');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key} (tipo: ${typeof value}): ${value}`);
      }
    });
    console.log('===========================');

    console.log('Creando ejercicio con archivos multimedia para sala ID:', this.roomId);

    this.exerciseService.createExerciseWithMedia(formData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isCreating = false;

        console.log('Respuesta de creación de ejercicio:', response);

        if (response.success) {
          // Mensaje personalizado con información de archivos subidos
          let successMessage = response.message;
          if (response.uploaded_files && response.uploaded_files > 0) {
            successMessage += ` (${response.uploaded_files} archivo${response.uploaded_files > 1 ? 's' : ''} multimedia)`;
          }
          
          await this.showToast(successMessage, 'success');
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
          console.error('Errores de validación detallados:', validationErrors);
          
          // Mostrar cada error específico
          Object.keys(validationErrors).forEach(key => {
            console.error(`Campo ${key}:`, validationErrors[key]);
          });
          
          // Obtener el primer error
          const firstErrorKey = Object.keys(validationErrors)[0];
          const firstError = validationErrors[firstErrorKey];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          
          // Mostrar todos los campos con error
          console.error('Todos los campos con error:', Object.keys(validationErrors));
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
