import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  IonToggle,
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
  cloudUploadOutline
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
    IonToggle,
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
    { value: 'principiante', label: 'Principiante' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' }
  ];

  exerciseTypes = [
    { value: 'cardio', label: 'Cardio' },
    { value: 'fuerza', label: 'Fuerza' },
    { value: 'flexibilidad', label: 'Flexibilidad' },
    { value: 'equilibrio', label: 'Equilibrio' },
    { value: 'resistencia', label: 'Resistencia' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    // Inicializar el formulario
    this.exerciseForm = this.formBuilder.group({
      // Campos obligatorios
      EXC_Name: ['', [Validators.required, Validators.minLength(3)]],
      EXC_Description: ['', [Validators.required, Validators.minLength(10)]],
      EXC_Instructions: ['', [Validators.required, Validators.minLength(20)]],
      EXC_MuscleGroup: ['', Validators.required],
      EXC_Equipment: ['', Validators.required],
      EXC_Difficulty: ['', Validators.required],
      EXC_Type: ['', Validators.required],
      EXC_Status: [true],

      // Campos opcionales
      EXC_Duration: [''],
      EXC_Repetitions: [''],
      EXC_Sets: [''],
      EXC_RestTime: [''],
      EXC_CaloriesBurned: [''],

      // URLs externas
      MED_URL1: [''],
      MED_URL2: ['']
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
      cloudUploadOutline
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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        this.showToast('Solo se permiten archivos de imagen (JPG, PNG) o video (MP4, WebM)', 'danger');
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.showToast('El archivo es muy grande. Máximo 10MB permitido', 'danger');
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
    this.exerciseForm.reset({
      EXC_Status: true // Mantener el estado activo por defecto
    });
    this.uploadedFiles = {};
    this.showToast('Formulario reseteado', 'medium');
  }

  // Guardar ejercicio
  async saveExercise() {
    if (this.exerciseForm.valid) {
      this.isLoading = true;

      // Mostrar loading
      const loading = await this.loadingController.create({
        message: 'Guardando ejercicio...',
        duration: 3000
      });
      await loading.present();

      // Simular llamada a API
      setTimeout(async () => {
        this.isLoading = false;
        await loading.dismiss();

        // Obtener datos del formulario
        const formData = this.exerciseForm.value as ExerciseFormData;
        
        // Agregar archivos multimedia
        Object.keys(this.uploadedFiles).forEach(key => {
          (formData as any)[key] = this.uploadedFiles[key];
        });

        console.log('Ejercicio a guardar:', formData);
        console.log('ID de la sala:', this.roomId);

        // Mostrar mensaje de éxito
        await this.showToast('¡Ejercicio creado exitosamente! 🎉', 'success');

        // Volver a la página de ejercicios de la sala
        this.router.navigate(['/room-exercises', this.roomId]);
      }, 3000);

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