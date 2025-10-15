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
  ToastController
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
    private toastController: ToastController
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

  viewExerciseDetail(exercise: Exercise) {
    console.log('Ver detalle del ejercicio:', exercise);
  }

  addNewExercise() {
    // Navegar a la página para agregar un nuevo ejercicio
    this.router.navigate(['/trainer/add-exercise', this.roomId]);
  }

  goBack() {
    this.router.navigate(['/trainer/dashboard']);
  }
}
