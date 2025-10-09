import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonButton, 
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonChip,
  IonProgressBar,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  people, 
  settings,
  add,
  checkmarkCircle,
  eyeOutline,
  createOutline,
  trashOutline,
  copyOutline
} from 'ionicons/icons';

interface TrainerRoom {
  id: number;
  code: string;
  name: string;
  description: string;
  activeMembers: number;
  totalMembers: number;
  completedWorkouts: number;
  averageProgress: number;
  createdDate: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-trainer-rooms',
  templateUrl: './trainer-rooms.page.html',
  styleUrls: ['./trainer-rooms.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonChip,
    IonProgressBar,
    IonFab,
    IonFabButton
  ]
})
export class TrainerRoomsPage implements OnInit {

  rooms: TrainerRoom[] = [
    {
      id: 1,
      code: 'ROOM001',
      name: 'Grupo Principiantes',
      description: 'Rutinas básicas para iniciarse en el fitness',
      activeMembers: 8,
      totalMembers: 10,
      completedWorkouts: 45,
      averageProgress: 65,
      createdDate: '15 Sep 2025',
      status: 'active'
    },
    {
      id: 2,
      code: 'ROOM002', 
      name: 'Grupo Avanzado',
      description: 'Entrenamientos intensivos para atletas experimentados',
      activeMembers: 12,
      totalMembers: 15,
      completedWorkouts: 78,
      averageProgress: 82,
      createdDate: '10 Sep 2025',
      status: 'active'
    },
    {
      id: 3,
      code: 'ROOM003',
      name: 'Grupo Personalizado',
      description: 'Rutinas adaptadas individualmente',
      activeMembers: 4,
      totalMembers: 5,
      completedWorkouts: 23,
      averageProgress: 91,
      createdDate: '20 Sep 2025',
      status: 'active'
    },
    {
      id: 4,
      code: 'ROOM004',
      name: 'Rehabilitación',
      description: 'Ejercicios de recuperación y fisioterapia',
      activeMembers: 0,
      totalMembers: 3,
      completedWorkouts: 12,
      averageProgress: 45,
      createdDate: '05 Sep 2025',
      status: 'inactive'
    }
  ];

  constructor(private router: Router) {
    addIcons({
      people,
      settings,
      add,
      checkmarkCircle,
      eyeOutline,
      createOutline,
      trashOutline,
      copyOutline
    });
  }

  ngOnInit() {}

  createNewRoom() {
    console.log('Crear nueva sala');
  }

  viewRoomDetail(room: TrainerRoom) {
    console.log('Ver detalle de sala:', room);
  }

  editRoom(room: TrainerRoom) {
    console.log('Editar sala:', room);
  }

  deleteRoom(room: TrainerRoom) {
    console.log('Eliminar sala:', room);
  }

  copyRoomCode(code: string) {
    // Copiar código al portapapeles
    navigator.clipboard.writeText(code);
    console.log('Código copiado:', code);
  }

  getStatusColor(status: string): string {
    return status === 'active' ? 'success' : 'warning';
  }

  getStatusText(status: string): string {
    return status === 'active' ? 'Activa' : 'Inactiva';
  }

  getActiveRoomsCount(): number {
    return this.rooms.filter(room => room.status === 'active').length;
  }

  getTotalActiveMembers(): number {
    return this.rooms.reduce((sum, room) => sum + room.activeMembers, 0);
  }
}