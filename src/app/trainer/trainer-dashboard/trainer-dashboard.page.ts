import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonButton, 
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonModal,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  add,
  close,
  peopleOutline,
  listOutline,
  personCircleOutline
} from 'ionicons/icons';

// Interfaces para datos del entrenador
interface TrainerRoom {
  id: number;
  code: string;
  name: string;
  activeMembers: number;
  totalExercises: number;
}

interface NewRoomData {
  name: string;
}

@Component({
  selector: 'app-trainer-dashboard',
  templateUrl: './trainer-dashboard.page.html',
  styleUrls: ['./trainer-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonModal,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput
  ]
})
export class TrainerDashboardPage implements OnInit {
  trainerName: string = 'Carlos Rodríguez';
  
  // Estado del modal
  isModalOpen: boolean = false;
  isCreating: boolean = false;
  
  // Datos del formulario
  newRoom: NewRoomData = {
    name: ''
  };
  
  // Salas del entrenador
  rooms: TrainerRoom[] = [
    {
      id: 1,
      code: 'ROOM001',
      name: 'Grupo Principiantes',
      activeMembers: 8,
      totalExercises: 12
    },
    {
      id: 2,
      code: 'ROOM002', 
      name: 'Grupo Avanzado',
      activeMembers: 15,
      totalExercises: 18
    },
    {
      id: 3,
      code: 'ROOM003',
      name: 'Grupo Personalizado',
      activeMembers: 4,
      totalExercises: 8
    }
  ];

  constructor(private router: Router) {
    addIcons({
      add,
      close,
      peopleOutline,
      listOutline,
      personCircleOutline
    });
  }

  ngOnInit() {}

  // Navegación al perfil
  goToProfile() {
    this.router.navigate(['/trainer/profile']);
  }

  // Métodos de navegación y modal
  createNewRoom() {
    // Abrir modal para crear nueva sala
    this.isModalOpen = true;
  }

  closeModal() {
    // Cerrar modal y resetear formulario
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    // Resetear datos del formulario
    this.newRoom = {
      name: ''
    };
  }

  async createRoom() {
    // Validar que el nombre esté completo
    if (!this.newRoom.name.trim()) {
      return;
    }

    this.isCreating = true;

    // Simular creación de sala (en producción sería una llamada a API)
    setTimeout(() => {
      // Generar código único para la sala
      const roomCode = `ROOM${String(this.rooms.length + 1).padStart(3, '0')}`;
      
      // Crear nueva sala
      const newRoom: TrainerRoom = {
        id: this.rooms.length + 1,
        code: roomCode,
        name: this.newRoom.name,
        activeMembers: 0,
        totalExercises: 0
      };

      // Agregar a la lista de salas
      this.rooms.push(newRoom);
      
      this.isCreating = false;
      this.closeModal();
      
      // Mostrar mensaje de éxito (en producción usar Toast)
      console.log('Sala creada exitosamente:', newRoom);
    }, 1000);
  }

  viewRoomDetail(room: TrainerRoom) {
    // Navegar a la vista de ejercicios de la sala
    this.router.navigate(['/trainer/room-exercises', room.id]);
  }
}