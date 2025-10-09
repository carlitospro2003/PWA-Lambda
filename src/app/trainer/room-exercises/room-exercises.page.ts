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
  IonChip
} from '@ionic/angular/standalone';
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

interface Exercise {
  id: number;
  title: string;
  description: string;
  category: 'cardio' | 'fuerza' | 'flexibilidad' | 'hiit' | 'funcional';
  duration: number; // en minutos
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  equipment: string[];
  instructions: string[];
  caloriesEstimate: number;
  muscleGroups: string[];
}

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
    IonChip
  ]
})
export class RoomExercisesPage implements OnInit {
  roomId: string = '';
  roomInfo: RoomInfo | null = null;

  exercises: Exercise[] = [
    {
      id: 1,
      title: 'Rutina de Cardio Básico',
      description: 'Ejercicios cardiovasculares para principiantes que ayudan a mejorar la resistencia',
      category: 'cardio',
      duration: 30,
      difficulty: 'principiante',
      equipment: ['Ninguno'],
      instructions: [
        'Realizar 5 minutos de calentamiento caminando',
        'Trotar en el lugar por 15 minutos',
        'Realizar jumping jacks por 5 minutos',
        '5 minutos de enfriamiento y estiramiento'
      ],
      caloriesEstimate: 250,
      muscleGroups: ['Cardiovascular', 'Piernas']
    },
    {
      id: 2,
      title: 'Entrenamiento de Fuerza Upper',
      description: 'Rutina enfocada en el fortalecimiento del tren superior',
      category: 'fuerza',
      duration: 45,
      difficulty: 'intermedio',
      equipment: ['Mancuernas', 'Banco'],
      instructions: [
        'Calentamiento de 5 minutos',
        'Press de banca 3x12',
        'Remo con mancuernas 3x10',
        'Press militar 3x8',
        'Curl de bíceps 3x12'
      ],
      caloriesEstimate: 300,
      muscleGroups: ['Pecho', 'Espalda', 'Hombros', 'Brazos']
    },
    {
      id: 3,
      title: 'HIIT Intenso',
      description: 'Entrenamiento de alta intensidad por intervalos',
      category: 'hiit',
      duration: 25,
      difficulty: 'avanzado',
      equipment: ['Ninguno'],
      instructions: [
        'Calentamiento 3 minutos',
        '8 rondas de: 30seg trabajo / 30seg descanso',
        'Ejercicios: Burpees, Mountain climbers, Jump squats',
        'Enfriamiento 3 minutos'
      ],
      caloriesEstimate: 400,
      muscleGroups: ['Cuerpo completo']
    },
    {
      id: 4,
      title: 'Flexibilidad y Movilidad',
      description: 'Rutina de estiramiento y mejora de la movilidad articular',
      category: 'flexibilidad',
      duration: 20,
      difficulty: 'principiante',
      equipment: ['Esterilla'],
      instructions: [
        'Estiramiento de cuello y hombros',
        'Movilidad de columna vertebral',
        'Estiramiento de piernas',
        'Relajación final'
      ],
      caloriesEstimate: 80,
      muscleGroups: ['Todo el cuerpo']
    },
    {
      id: 5,
      title: 'Entrenamiento Funcional',
      description: 'Ejercicios que mejoran los movimientos del día a día',
      category: 'funcional',
      duration: 40,
      difficulty: 'intermedio',
      equipment: ['Kettlebell', 'TRX'],
      instructions: [
        'Calentamiento dinámico',
        'Sentadillas funcionales',
        'Peso muerto con kettlebell',
        'Ejercicios con TRX'
      ],
      caloriesEstimate: 350,
      muscleGroups: ['Cuerpo completo']
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
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
    // Obtener el ID de la sala desde los parámetros de la ruta
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.loadRoomInfo();
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

    this.roomInfo = rooms.find(room => room.id.toString() === this.roomId) || null;
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