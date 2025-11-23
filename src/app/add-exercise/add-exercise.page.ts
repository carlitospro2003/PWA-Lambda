import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '../services/exercise.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonIcon,
  IonBackButton,
  IonList,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  ToastController,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline,
  fitnessOutline,
  informationCircleOutline,
  timeOutline,
  barbellOutline,
  cameraOutline,
  linkOutline,
  documentTextOutline,
  bodyOutline,
  constructOutline,
  trendingUpOutline,
  flashOutline,
  refreshOutline,
  checkmarkCircleOutline,
  cloudUploadOutline,
  closeOutline
} from 'ionicons/icons';

// Interface para el formulario de ejercicio
interface ExerciseFormData {
  EXC_Name: string;
  EXC_Description: string;
  EXC_Instructions: string;
  EXC_MuscleGroup: string;
  EXC_Equipment: string;
  EXC_Difficulty: string;
  EXC_Type: string;
  EXC_Duration?: number;
  EXC_Repetitions?: number;
  EXC_Sets?: number;
  EXC_RestTime?: number;
  EXC_CaloriesBurned?: number;
  EXC_Status: boolean;
  MED_Media1?: File;
  MED_Media2?: File;
  MED_Media3?: File;
  MED_Media4?: File;
  MED_URL1?: string;
  MED_URL2?: string;
}

@Component({
  selector: 'app-add-exercise',
  templateUrl: './add-exercise.page.html',
  styleUrls: ['./add-exercise.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    IonIcon,
    IonBackButton,
    IonList,
    IonNote,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class AddExercisePage implements OnInit {
  roomId!: number;
  exerciseForm: FormGroup;
  isLoading: boolean = false;
  uploadedFiles: { [key: string]: File } = {};

  // Opciones para los selectores
  muscleGroups = [
    'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abdomen', 'Glúteos', 'Pantorrillas', 'Core', 'Todo el cuerpo'
  ];

  equipmentOptions = [
    'Sin equipamiento', 'Mancuernas', 'Barra', 'Máquina', 'Bandas elásticas', 'Kettlebell', 'TRX', 'Balón medicinal', 'Colchoneta', 'Banco', 'Otro'
  ];

  difficultyLevels = [
    { value: 'PRINCIPIANTE', label: 'Principiante' },
    { value: 'INTERMEDIO', label: 'Intermedio' },
    { value: 'AVANZADO', label: 'Avanzado' }
  ];

  exerciseTypes = [
    { value: 'Calentamiento', label: 'Calentamiento' },
    { value: 'Calistenia', label: 'Calistenia' },
    { value: 'Musculatura', label: 'Musculatura' },
    { value: 'Elasticidad', label: 'Elasticidad' },
    { value: 'Resistencia', label: 'Resistencia' },
    { value: 'Médico', label: 'Médico' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    // Inicializar el formulario
    this.exerciseForm = this.formBuilder.group({
      // Campos obligatorios
      EXC_Title: ['', [Validators.required, Validators.minLength(3)]],
      EXC_Type: [''],
      EXC_Instructions: [''],
      EXC_DifficultyLevel: [''],

      // URLs externas
      EXC_URL1: [''],
      EXC_URL2: ['']
    });

    addIcons({
      saveOutline,
      fitnessOutline,
      informationCircleOutline,
      timeOutline,
      barbellOutline,
      cameraOutline,
      linkOutline,
      documentTextOutline,
      bodyOutline,
      constructOutline,
      trendingUpOutline,
      flashOutline,
      refreshOutline,
      checkmarkCircleOutline,
      cloudUploadOutline,
      closeOutline
    });
  }

  ngOnInit() {
    // Obtener el ID de la sala desde los parámetros de la ruta
    this.roomId = Number(this.route.snapshot.paramMap.get('roomId'));
  }

  // Verificar si un campo tiene errores
  hasError(fieldName: string): boolean {
    const field = this.exerciseForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const field = this.exerciseForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['email']) {
        return 'Ingresa un formato válido';
      }
    }
    return '';
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

  // Mostrar toast
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  // Resetear formulario
  resetForm() {
    this.exerciseForm.reset();
    this.uploadedFiles = {};
    
    // Resetear todos los inputs de archivos
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => {
      input.value = '';
    });
    
    this.showToast('Formulario reseteado', 'medium');
  }

  // Guardar ejercicio
  async saveExercise() {
    if (this.exerciseForm.valid) {
      this.isLoading = true;

      // Mostrar loading
      const loading = await this.loadingController.create({
        message: 'Guardando ejercicio...',
        duration: 30000
      });
      await loading.present();

      try {
        // Crear FormData para enviar archivos
        const formData = new FormData();
        
        // Agregar campos del formulario
        const formValues = this.exerciseForm.value;
        
        // Campo obligatorio
        formData.append('EXC_Title', formValues.EXC_Title);
        formData.append('EXC_ROO_ID', this.roomId.toString());
        
        // Campos opcionales
        if (formValues.EXC_Type) {
          formData.append('EXC_Type', formValues.EXC_Type);
        }
        if (formValues.EXC_Instructions) {
          formData.append('EXC_Instructions', formValues.EXC_Instructions);
        }
        if (formValues.EXC_DifficultyLevel) {
          formData.append('EXC_DifficultyLevel', formValues.EXC_DifficultyLevel);
        }
        if (formValues.EXC_URL1) {
          formData.append('EXC_URL1', formValues.EXC_URL1);
        }
        if (formValues.EXC_URL2) {
          formData.append('EXC_URL2', formValues.EXC_URL2);
        }
        
        // Agregar archivos multimedia
        for (let i = 1; i <= 4; i++) {
          const mediaKey = `EXC_Media${i}`;
          if (this.uploadedFiles[mediaKey]) {
            formData.append(mediaKey, this.uploadedFiles[mediaKey]);
          }
        }

        console.log('Creando ejercicio para sala ID:', this.roomId);

        // Llamar al servicio
        this.exerciseService.createExerciseWithMedia(formData).subscribe({
          next: async (response) => {
            this.isLoading = false;
            await loading.dismiss();

            console.log('Respuesta de creación de ejercicio:', response);

            if (response.success) {
              await this.showToast(response.message, 'success');
              
              // Volver a la página de ejercicios de la sala
              this.router.navigate(['/trainer/room-exercises', this.roomId]);
            } else {
              await this.showToast(response.message || 'Error al crear el ejercicio', 'danger');
            }
          },
          error: async (error) => {
            this.isLoading = false;
            await loading.dismiss();

            console.error('Error al crear ejercicio:', error);

            let errorMessage = 'Error al crear el ejercicio';
            
            if (error.status === 422 && error.error?.errors) {
              // Errores de validación
              const validationErrors = error.error.errors;
              const firstError = Object.values(validationErrors)[0];
              errorMessage = Array.isArray(firstError) ? firstError[0] : firstError as string;
            } else if (error.status === 404) {
              errorMessage = error.error?.message || 'Sala no encontrada';
            } else if (error.status === 403) {
              errorMessage = 'No tienes permiso para agregar ejercicios a esta sala';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }

            await this.showToast(errorMessage, 'danger');
          }
        });

      } catch (error) {
        this.isLoading = false;
        await loading.dismiss();
        console.error('Error inesperado:', error);
        await this.showToast('Error inesperado al crear el ejercicio', 'danger');
      }

    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.exerciseForm.markAllAsTouched();
      await this.showToast('Por favor completa todos los campos obligatorios', 'danger');
    }
  }

  // Cancelar y volver
  async cancelCreation() {
    if (this.exerciseForm.dirty || Object.keys(this.uploadedFiles).length > 0) {
      const alert = await this.alertController.create({
        header: 'Cancelar creación',
        message: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
        buttons: [
          {
            text: 'Seguir editando',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'Salir sin guardar',
            cssClass: 'danger',
            handler: () => {
              this.router.navigate(['/room-exercises', this.roomId]);
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.router.navigate(['/room-exercises', this.roomId]);
    }
  }

  // Obtener nombre del archivo seleccionado
  getFileName(mediaField: string): string {
    return this.uploadedFiles[mediaField]?.name || 'Ningún archivo seleccionado';
  }

  // Verificar si hay archivo seleccionado
  hasFile(mediaField: string): boolean {
    return !!this.uploadedFiles[mediaField];
  }
}