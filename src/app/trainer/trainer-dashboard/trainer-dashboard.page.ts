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
  IonInput,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { RoomService, CreateRoomRequest, Room } from '../../services/room.service';
import { AuthService } from '../../services/auth.service';
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
  trainerName: string = '';
  
  // Estado del modal
  isModalOpen: boolean = false;
  isCreating: boolean = false;
  isLoadingRooms: boolean = false;
  
  // Datos del formulario
  newRoom: NewRoomData = {
    name: ''
  };
  
  // Salas del entrenador
  rooms: TrainerRoom[] = [];

  constructor(
    private router: Router,
    private roomService: RoomService,
    private authService: AuthService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      add,
      close,
      peopleOutline,
      listOutline,
      personCircleOutline
    });
  }

  ngOnInit() {
    this.loadTrainerData();
    this.loadMyRooms();
  }

  loadTrainerData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.trainerName = `${user.USR_Name} ${user.USR_LastName}`;
    }
  }

  loadMyRooms() {
    this.isLoadingRooms = true;
    console.log('Cargando salas del entrenador...');

    this.roomService.getMyRooms().subscribe({
      next: (response) => {
        this.isLoadingRooms = false;
        console.log('Respuesta de mis salas:', response);

        if (response.success && response.rooms) {
          // Convertir las salas de la API al formato local
          this.rooms = response.rooms.map((room: Room) => ({
            id: room.ROO_ID,
            code: room.ROO_Code,
            name: room.ROO_Name,
            activeMembers: 0, // Por ahora en 0, se puede agregar esta info a la API después
            totalExercises: 0  // Por ahora en 0, se puede agregar esta info a la API después
          }));

          console.log('Salas cargadas:', this.rooms);
        }
      },
      error: (error) => {
        this.isLoadingRooms = false;
        console.error('Error al cargar salas:', error);
        this.showToast('Error al cargar las salas', 'danger');
      }
    });
  }

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
      await this.showToast('El nombre de la sala es requerido', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando sala...',
      duration: 10000
    });

    await loading.present();
    this.isCreating = true;

    const roomData: CreateRoomRequest = {
      ROO_Name: this.newRoom.name.trim()
    };

    console.log('Creando sala con datos:', roomData);

    this.roomService.createRoom(roomData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isCreating = false;

        console.log('Respuesta de creación de sala:', response);

        if (response.success && response.room) {
          await this.showToast(response.message, 'success');
          this.closeModal();
          
          // Recargar las salas para obtener la lista actualizada
          this.loadMyRooms();
        } else {
          await this.showToast(response.message || 'Error al crear la sala', 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isCreating = false;

        console.error('Error al crear sala:', error);

        let errorMessage = 'Error al crear la sala';
        
        if (error.status === 422 && error.error?.errors) {
          // Errores de validación
          const validationErrors = error.error.errors;
          errorMessage = Object.values(validationErrors)[0] as string;
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

  viewRoomDetail(room: TrainerRoom) {
    // Navegar a la vista de ejercicios de la sala
    this.router.navigate(['/trainer/room-exercises', room.id]);
  }
}