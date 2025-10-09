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
  ToastController
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
  heartOutline
} from 'ionicons/icons';

// Interfaces
interface Exercise {
  id: number;
  name: string;
  description: string;
  duration: number; // en minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  instructions: string[];
  completed: boolean;
  completedAt?: Date;
  repetitions?: number;
  sets?: number;
  isFavorite?: boolean; // Campo para favoritos
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
  ]
})
export class RoomExercisesPage implements OnInit {
  roomId!: number;
  roomDetails: RoomDetails = {} as RoomDetails;
  exercises: Exercise[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
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
      heartOutline
    });
  }

  ngOnInit() {
    // Obtener el ID de la sala desde los parámetros de la ruta
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRoomData();
  }

  loadRoomData() {
    // Simular datos de la sala (en una app real vendría de un servicio)
    this.roomDetails = {
      id: this.roomId,
      name: this.getRoomName(this.roomId),
      code: this.getRoomCode(this.roomId),
      description: 'Sala de entrenamiento diseñada para mejorar tu condición física',
      totalMembers: 12,
      totalExercises: 8,
      completedExercises: 3,
      trainerName: 'Carlos Rodríguez'
    };

    // Simular ejercicios de la sala
    this.exercises = [
      {
        id: 1,
        name: 'Burpees',
        description: 'Ejercicio completo que trabaja todo el cuerpo',
        duration: 10,
        difficulty: 'intermediate',
        category: 'Cardio',
        instructions: [
          'Ponte de pie con los pies separados al ancho de los hombros',
          'Baja a posición de sentadilla y coloca las manos en el suelo',
          'Salta hacia atrás para hacer una plancha',
          'Haz una flexión de pecho',
          'Salta hacia adelante y levántate con un salto'
        ],
        completed: true,
        completedAt: new Date(2025, 8, 26, 10, 30),
        repetitions: 15,
        sets: 3,
        isFavorite: false
      },
      {
        id: 2,
        name: 'Sentadillas',
        description: 'Fortalece piernas y glúteos',
        duration: 8,
        difficulty: 'beginner',
        category: 'Fuerza',
        instructions: [
          'Ponte de pie con los pies separados al ancho de los hombros',
          'Baja como si fueras a sentarte en una silla',
          'Mantén la espalda recta y el pecho hacia arriba',
          'Baja hasta que los muslos estén paralelos al suelo',
          'Empuja con los talones para volver a la posición inicial'
        ],
        completed: true,
        completedAt: new Date(2025, 8, 25, 15, 45),
        repetitions: 20,
        sets: 4,
        isFavorite: true
      },
      {
        id: 3,
        name: 'Planchas',
        description: 'Fortalece el core y brazos',
        duration: 5,
        difficulty: 'beginner',
        category: 'Core',
        instructions: [
          'Colócate boca abajo apoyándote en antebrazos y pies',
          'Mantén el cuerpo recto como una tabla',
          'Contrae el abdomen y mantén la posición',
          'Respira normalmente',
          'Mantén por el tiempo indicado'
        ],
        completed: true,
        completedAt: new Date(2025, 8, 24, 18, 20),
        repetitions: 60, // segundos
        sets: 3,
        isFavorite: false
      },
      {
        id: 4,
        name: 'Flexiones de Pecho',
        description: 'Fortalece pecho, hombros y tríceps',
        duration: 6,
        difficulty: 'intermediate',
        category: 'Fuerza',
        instructions: [
          'Colócate boca abajo con las manos apoyadas en el suelo',
          'Mantén el cuerpo recto',
          'Baja el pecho hasta casi tocar el suelo',
          'Empuja hacia arriba hasta extender completamente los brazos',
          'Repite el movimiento'
        ],
        completed: false,
        repetitions: 12,
        sets: 3,
        isFavorite: true
      },
      {
        id: 5,
        name: 'Mountain Climbers',
        description: 'Ejercicio cardiovascular de alta intensidad',
        duration: 8,
        difficulty: 'advanced',
        category: 'Cardio',
        instructions: [
          'Empieza en posición de plancha',
          'Lleva una rodilla hacia el pecho',
          'Cambia rápidamente de pierna',
          'Mantén un ritmo constante y rápido',
          'Mantén el core activado durante todo el ejercicio'
        ],
        completed: false,
        repetitions: 30,
        sets: 4
      },
      {
        id: 6,
        name: 'Jumping Jacks',
        description: 'Ejercicio de calentamiento y cardio',
        duration: 5,
        difficulty: 'beginner',
        category: 'Cardio',
        instructions: [
          'Ponte de pie con brazos a los lados',
          'Salta separando las piernas y levantando los brazos',
          'Regresa a la posición inicial con otro salto',
          'Mantén un ritmo constante',
          'Respira de forma controlada'
        ],
        completed: false,
        repetitions: 25,
        sets: 3
      },
      {
        id: 7,
        name: 'Lunges',
        description: 'Fortalece piernas y mejora el equilibrio',
        duration: 10,
        difficulty: 'intermediate',
        category: 'Fuerza',
        instructions: [
          'Ponte de pie con los pies separados al ancho de las caderas',
          'Da un paso grande hacia adelante',
          'Baja hasta que ambas rodillas estén en ángulo de 90°',
          'Empuja con el talón delantero para volver a la posición inicial',
          'Alterna las piernas'
        ],
        completed: false,
        repetitions: 15,
        sets: 3
      },
      {
        id: 8,
        name: 'Russian Twists',
        description: 'Fortalece los músculos oblicuos del abdomen',
        duration: 7,
        difficulty: 'intermediate',
        category: 'Core',
        instructions: [
          'Siéntate con las rodillas flexionadas',
          'Inclínate ligeramente hacia atrás',
          'Levanta los pies del suelo',
          'Gira el torso de lado a lado',
          'Mantén el equilibrio durante todo el ejercicio'
        ],
        completed: false,
        repetitions: 20,
        sets: 3,
        isFavorite: false
      }
    ];
  }

  // Obtener nombre de la sala basado en el ID
  getRoomName(id: number): string {
    const roomNames: { [key: number]: string } = {
      1: 'Grupo Principiantes',
      2: 'Entrenamiento Avanzado',
      3: 'HIIT Intensivo'
    };
    return roomNames[id] || 'Sala de Entrenamiento';
  }

  // Obtener código de la sala basado en el ID
  getRoomCode(id: number): string {
    const roomCodes: { [key: number]: string } = {
      1: 'ROOM001',
      2: 'ROOM003',
      3: 'ROOM007'
    };
    return roomCodes[id] || 'ROOM000';
  }

  // Método para alternar favoritos
  toggleFavorite(exercise: Exercise) {
    exercise.isFavorite = !exercise.isFavorite;
    console.log(`Ejercicio ${exercise.name} ${exercise.isFavorite ? 'agregado a' : 'removido de'} favoritos`);
  }

  // Obtener color de dificultad
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

  // Obtener etiqueta de dificultad
  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'Sin definir';
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
  viewExerciseDetails(exercise: Exercise) {
    // Aquí se podría abrir un modal o navegar a una página de detalles
    console.log('Ver detalles de:', exercise.name);
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
}