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
  IonGrid,
  IonRow,
  IonCol,
  IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  saveOutline,
  fitnessOutline
} from 'ionicons/icons';

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
    IonSelectOption,
    IonGrid,
    IonRow,
    IonCol,
    IonToggle
  ]
})
export class AddExercisePage implements OnInit {
  roomId: string = '';
  roomName: string = 'Sala de Entrenamiento';

  exerciseForm: ExerciseFormData = {
    EXC_Name: '',
    EXC_Description: '',
    EXC_Instructions: '',
    EXC_MuscleGroup: '',
    EXC_Equipment: '',
    EXC_Difficulty: '',
    EXC_Type: '',
    EXC_Status: true,
    EXC_Duration: undefined,
    EXC_Repetitions: undefined,
    EXC_Sets: undefined,
    EXC_RestTime: undefined,
    EXC_CaloriesBurned: undefined,
    MED_Media1: undefined,
    MED_Media2: undefined,
    MED_Media3: undefined,
    MED_Media4: undefined,
    MED_URL1: '',
    MED_URL2: ''
  };

  muscleGroups: string[] = [
    'Pecho', 'Espalda', 'Piernas', 'Brazos', 'Hombros',
    'Abdomen', 'Glúteos', 'Pantorrillas', 'Cuerpo completo'
  ];

  equipmentOptions: string[] = [
    'Sin equipamiento', 'Mancuernas', 'Barra', 'Máquina',
    'Bandas elásticas', 'Kettlebell', 'Pelota de ejercicio',
    'Colchoneta', 'TRX', 'Banco'
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
    { value: 'resistencia', label: 'Resistencia' },
    { value: 'equilibrio', label: 'Equilibrio' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ saveOutline, fitnessOutline });
  }

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
    this.loadRoomData();
  }

  loadRoomData() {
    const rooms = [
      { id: '1', name: 'Sala de Cardio' },
      { id: '2', name: 'Sala de Fuerza' },
      { id: '3', name: 'Sala HIIT' }
    ];
    
    const room = rooms.find(r => r.id === this.roomId);
    this.roomName = room ? room.name : 'Sala Desconocida';
  }

  onFileSelected(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      (this.exerciseForm as any)[fieldName] = file;
      console.log(`Archivo seleccionado para ${fieldName}: ${file.name}`);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.exerciseForm.EXC_Name?.trim() &&
      this.exerciseForm.EXC_Description?.trim() &&
      this.exerciseForm.EXC_Instructions?.trim() &&
      this.exerciseForm.EXC_MuscleGroup &&
      this.exerciseForm.EXC_Equipment &&
      this.exerciseForm.EXC_Difficulty &&
      this.exerciseForm.EXC_Type
    );
  }

  saveExercise() {
    if (this.isFormValid()) {
      console.log('Guardando ejercicio:', this.exerciseForm);
      setTimeout(() => {
        console.log('Ejercicio guardado exitosamente');
        this.router.navigate([`/trainer/room-exercises/${this.roomId}`]);
      }, 1000);
    } else {
      console.log('Formulario no válido');
    }
  }

  cancel() {
    this.router.navigate([`/trainer/room-exercises/${this.roomId}`]);
  }
}
