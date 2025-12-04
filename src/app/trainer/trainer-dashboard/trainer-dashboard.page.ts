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
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { RoomService, CreateRoomRequest, Room } from '../../services/room.service';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { 
  add,
  close,
  peopleOutline,
  listOutline,
  personCircleOutline,
  createOutline,
  trashOutline
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

interface EditRoomData {
  id: number;
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
  isEditModalOpen: boolean = false;
  isCreating: boolean = false;
  isEditing: boolean = false;
  isLoadingRooms: boolean = false;
  
  // Datos del formulario
  newRoom: NewRoomData = {
    name: ''
  };

  editRoom: EditRoomData = {
    id: 0,
    name: ''
  };
  
  // Salas del entrenador
  rooms: TrainerRoom[] = [];

  constructor(
    private router: Router,
    private roomService: RoomService,
    private authService: AuthService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    addIcons({
      add,
      close,
      peopleOutline,
      listOutline,
      personCircleOutline,
      createOutline,
      trashOutline
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
            activeMembers: room.trainees_count || 0,
            totalExercises: room.total_exercises || 0
          }));

          console.log('✅ Salas cargadas:', this.rooms);
          console.log('📊 Total de salas:', this.rooms.length);
          
          // Log detallado de cada sala
          this.rooms.forEach(room => {
            console.log(`  📍 Sala "${room.name}": ${room.activeMembers} miembros, ${room.totalExercises} ejercicios`);
          });
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

  async openEditModal(room: TrainerRoom, event?: Event) {
    // Prevenir que se dispare el click del card
    if (event) {
      event.stopPropagation();
    }

    this.editRoom = {
      id: room.id,
      name: room.name
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editRoom = {
      id: 0,
      name: ''
    };
  }

  async updateRoom() {
    // Validar que el nombre esté completo
    if (!this.editRoom.name.trim()) {
      await this.showToast('El nombre de la sala es requerido', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Actualizando sala...',
      duration: 10000
    });

    await loading.present();
    this.isEditing = true;

    const roomData = {
      ROO_Name: this.editRoom.name.trim()
    };

    console.log('Editando sala con ID:', this.editRoom.id, 'Datos:', roomData);

    this.roomService.editRoom(this.editRoom.id, roomData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isEditing = false;

        console.log('Respuesta de edición de sala:', response);

        if (response.success) {
          await this.showToast(response.message, 'success');
          this.closeEditModal();
          
          // Recargar las salas para obtener la lista actualizada
          this.loadMyRooms();
        } else {
          await this.showToast(response.message || 'Error al editar la sala', 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isEditing = false;

        console.error('Error al editar sala:', error);

        let errorMessage = 'Error al editar la sala';
        
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

  async confirmDeleteRoom(room: TrainerRoom, event?: Event) {
    // Prevenir que se dispare el click del card
    if (event) {
      event.stopPropagation();
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar la sala "${room.name}"? Esto también eliminará todos los ejercicios asociados.`,
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
            await this.deleteRoom(room.id);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteRoom(roomId: number) {
    const loading = await this.loadingController.create({
      message: 'Eliminando sala...',
      duration: 10000
    });

    await loading.present();

    console.log('Eliminando sala con ID:', roomId);

    this.roomService.deleteRoom(roomId).subscribe({
      next: async (response) => {
        await loading.dismiss();

        console.log('Respuesta de eliminación de sala:', response);

        if (response.success) {
          await this.showToast(response.message, 'success');
          
          // Recargar las salas para obtener la lista actualizada
          this.loadMyRooms();
        } else {
          await this.showToast(response.message || 'Error al eliminar la sala', 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();

        console.error('Error al eliminar sala:', error);

        let errorMessage = 'Error al eliminar la sala';
        
        if (error.status === 404) {
          errorMessage = 'Sala no encontrada';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permiso para eliminar esta sala';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        await this.showToast(errorMessage, 'danger');
      }
    });
  }
}