import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  ToastController,
  AlertController,
  ModalController
} from '@ionic/angular/standalone';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { RoomService } from '../../services/room.service';
import { ExerciseDetailModalComponent } from './exercise-detail-modal.component';
import { environment } from '../../../environments/environment';
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
  chevronForward,
  createOutline,
  trashOutline,
  close,
  cloudUploadOutline,
  saveOutline
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
    FormsModule,
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
    IonModal,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption
  ]
})
export class RoomExercisesPage implements OnInit {
  roomId: number = 0;
  roomInfo: RoomInfo | null = null;
  exercises: Exercise[] = [];
  isLoadingExercises: boolean = false;

  // Variables para el modal de edición
  isEditModalOpen = false;
  editingExercise: Exercise | null = null;
  editForm = {
    EXC_Title: '',
    EXC_Type: '',
    EXC_DifficultyLevel: '',
    EXC_Instructions: '',
    EXC_URL1: '',
    EXC_URL2: ''
  };

  // Opciones para los selects
  exerciseTypes = [
    'Calentamiento',
    'Calistenia',
    'Musculatura',
    'Elasticidad',
    'Resistencia',
    'Médico'
  ];

  difficultyLevels = [
    { value: 'PRINCIPIANTE', label: 'Principiante' },
    { value: 'INTERMEDIO', label: 'Intermedio' },
    { value: 'AVANZADO', label: 'Avanzado' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private exerciseService: ExerciseService,
    private roomService: RoomService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController
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
      chevronForward,
      createOutline,
      trashOutline,
      close,
      cloudUploadOutline,
      saveOutline
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

        // Crear modal personalizado con los detalles completos
        const modal = await this.modalController.create({
          component: ExerciseDetailModalComponent,
          componentProps: {
            exercise: response.data,
            totalImages: response.total_images,
            totalUrls: response.total_urls
          }
        });

        await modal.present();

        // Capturar resultado del modal (si el usuario quiere editar)
        const { data } = await modal.onWillDismiss();
        if (data?.action === 'edit' && data?.exercise) {
          await this.editExercise(data.exercise);
        }
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

  async editExercise(exercise: Exercise) {
    // Evitar propagación del click
    event?.stopPropagation();

    // Guardar ejercicio en edición
    this.editingExercise = exercise;

    // Pre-llenar el formulario
    this.editForm = {
      EXC_Title: exercise.EXC_Title,
      EXC_Type: exercise.EXC_Type || '',
      EXC_DifficultyLevel: exercise.EXC_DifficultyLevel || '',
      EXC_Instructions: exercise.EXC_Instructions || '',
      EXC_URL1: exercise.EXC_URL1 || '',
      EXC_URL2: exercise.EXC_URL2 || ''
    };

    // Abrir modal
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingExercise = null;
  }

  async saveExerciseFromModal() {
    if (!this.editingExercise) return;

    await this.saveExerciseEdits(this.editingExercise.EXC_ID, this.editForm);
    this.closeEditModal();
  }

  async openFilePickerForEdit() {
    if (!this.editingExercise) return;

    // Crear input file oculto para seleccionar archivos
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/jpeg,image/png,image/jpg,image/webp,video/mp4,video/mov';
    
    fileInput.onchange = async (e: any) => {
      const files = e.target.files;
      if (files && files.length > 0 && this.editingExercise) {
        await this.uploadExerciseFiles(this.editingExercise.EXC_ID, files, this.editForm);
        this.closeEditModal();
      }
    };
    
    fileInput.click();
  }

  async uploadExerciseFiles(exerciseId: number, files: FileList, textData: any) {
    const formData = new FormData();

    // Agregar _method para Laravel (PUT via POST)
    formData.append('_method', 'PUT');

    // Agregar campos de texto
    Object.keys(textData).forEach(key => {
      const value = textData[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        formData.append(key, String(value));
      }
    });

    // Agregar archivos (máximo 4)
    const maxFiles = Math.min(files.length, 4);
    for (let i = 0; i < maxFiles; i++) {
      formData.append(`EXC_Media${i + 1}`, files[i]);
    }

    // Debug: ver qué se está enviando
    console.log('FormData a enviar:');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    try {
      const response = await this.exerciseService.editExerciseWithMedia(exerciseId, formData).toPromise();
      
      if (response && response.success) {
        await this.showToast('Ejercicio actualizado exitosamente', 'success');
        // Recargar lista de ejercicios
        await this.loadExercises();
      } else {
        await this.showToast(response?.message || 'Error al actualizar ejercicio', 'danger');
      }
    } catch (error: any) {
      console.error('Error al actualizar ejercicio:', error);
      const errorMsg = error?.error?.message || 'Error al actualizar ejercicio';
      await this.showToast(errorMsg, 'danger');
    }
  }

  async saveExerciseEdits(exerciseId: number, data: any) {
    const formData = new FormData();

    // Agregar _method para Laravel (PUT via POST)
    formData.append('_method', 'PUT');

    // Solo agregar campos que tienen valor
    Object.keys(data).forEach(key => {
      const value = data[key];
      // Agregar si tiene valor (incluso strings vacíos se envían como vacíos)
      if (value !== null && value !== undefined) {
        const stringValue = String(value).trim();
        if (stringValue !== '') {
          formData.append(key, stringValue);
        }
      }
    });

    // Debug: ver qué se está enviando
    console.log('FormData a enviar (sin archivos):');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    try {
      const response = await this.exerciseService.editExerciseWithMedia(exerciseId, formData).toPromise();
      
      if (response && response.success) {
        await this.showToast('Ejercicio actualizado exitosamente', 'success');
        // Recargar lista de ejercicios
        await this.loadExercises();
      } else {
        await this.showToast(response?.message || 'Error al actualizar ejercicio', 'danger');
      }
    } catch (error: any) {
      console.error('Error al actualizar ejercicio:', error);
      const errorMsg = error?.error?.message || 'Error al actualizar ejercicio';
      await this.showToast(errorMsg, 'danger');
    }
  }

  // Construir URL completa de la imagen desde Laravel storage
  getImageUrl(relativePath: string | undefined | null): string | null {
    if (!relativePath) return null;
    
    // Si la ruta ya es completa (http/https), retornarla tal cual
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // Usa automáticamente la URL correcta según el environment
    // En desarrollo: http://127.0.0.1:8000
    // En producción: https://api.safekids.site
    const baseUrl = environment.apiUrl.replace('/api', '');
    
    // Si la ruta ya empieza con /storage/, solo agregar el dominio
    if (relativePath.startsWith('/storage/')) {
      return `${baseUrl}${relativePath}`;
    }
    
    // Si no tiene /storage/, agregarlo
    return `${baseUrl}/storage/${relativePath}`;
  }

  async showExerciseDetailsModal(exercise: Exercise, totalImages?: number, totalUrls?: number) {
    const mediaItems: Array<{type: string, url: string}> = [];
    
    // Construir lista de imágenes con URLs completas
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

    // Mostrar datos en alert simple (temporal para debug)
    let alertMessage = `
Título: ${exercise.EXC_Title}
Tipo: ${exercise.EXC_Type || 'N/A'}
Dificultad: ${exercise.EXC_DifficultyLevel || 'N/A'}
Instrucciones: ${exercise.EXC_Instructions || 'N/A'}

Archivos multimedia: ${totalImages || 0} imagen(es)
URLs externas: ${totalUrls || 0} video(s)

Para ver las imágenes, abre la consola (F12) y copia estas URLs:
${mediaItems.filter(m => m.type === 'image').map((m, i) => `\nImagen ${i+1}: ${m.url}`).join('')}
    `.trim();

    const alert = await this.alertController.create({
      header: 'Detalles del Ejercicio',
      message: alertMessage,
      buttons: [
        {
          text: 'Abrir Primera Imagen',
          handler: () => {
            const firstImage = mediaItems.find(m => m.type === 'image');
            if (firstImage) {
              window.open(firstImage.url, '_blank');
            }
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async deleteExercise(exercise: Exercise) {
    // Evitar propagación del click
    event?.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el ejercicio "${exercise.EXC_Title}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'danger',
          handler: async () => {
            await this.confirmDeleteExercise(exercise.EXC_ID, exercise.EXC_Title);
          }
        }
      ],
      cssClass: 'delete-exercise-alert'
    });

    await alert.present();
  }

  async confirmDeleteExercise(exerciseId: number, exerciseTitle: string) {
    try {
      const response = await this.exerciseService.deleteExercise(exerciseId).toPromise();
      
      if (response && response.success) {
        await this.showToast(
          `Ejercicio "${exerciseTitle}" eliminado exitosamente. Quedan ${response.remaining_exercises_in_room || 0} ejercicios en esta sala.`,
          'success'
        );
        // Recargar lista de ejercicios
        await this.loadExercises();
      } else {
        await this.showToast(response?.message || 'Error al eliminar ejercicio', 'danger');
      }
    } catch (error: any) {
      console.error('Error al eliminar ejercicio:', error);
      
      let errorMessage = 'Error al eliminar ejercicio';
      if (error.status === 403) {
        errorMessage = 'No tienes permiso para eliminar este ejercicio';
      } else if (error.status === 404) {
        errorMessage = 'Ejercicio no encontrado';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      await this.showToast(errorMessage, 'danger');
    }
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
