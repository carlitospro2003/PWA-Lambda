import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardContent,
  IonIcon,
  IonChip,
  IonLabel,
  IonSearchbar,
  IonButton,
  IonSpinner,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  peopleOutline,
  fitnessOutline,
  arrowForwardCircleOutline,
  searchOutline,
  exitOutline
} from 'ionicons/icons';

import { RoomService, Room } from '../services/room.service';

// Interfaz para las salas del usuario
interface UserRoom {
  id: number;
  name: string;
  code: string;
  totalMembers: number;
  totalExercises: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardContent,
    IonIcon,
    IonChip,
    IonLabel,
    IonSearchbar,
    IonButton,
    IonSpinner
  ]
})
export class HomePage implements OnInit {
  userName: string = 'Carlos';
  searchCode: string = '';
  isSearching: boolean = false;
  searchedRoom: Room | null = null;
  isLoadingRooms: boolean = false;

  // Salas en las que está el usuario
  userRooms: UserRoom[] = [];

  constructor(
    private router: Router,
    private roomService: RoomService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      peopleOutline,
      fitnessOutline,
      arrowForwardCircleOutline,
      searchOutline,
      exitOutline
    });
  }

  ngOnInit() {
    this.loadMyJoinedRooms();
  }

  /**
   * Cargar las salas a las que el usuario está unido
   */
  loadMyJoinedRooms() {
    this.isLoadingRooms = true;

    this.roomService.getMyJoinedRooms()
      .subscribe({
        next: (response) => {
          this.isLoadingRooms = false;
          if (response.success && response.rooms) {
            this.userRooms = response.rooms.map(room => ({
              id: room.ROO_ID,
              name: room.ROO_Name,
              code: room.ROO_Code,
              totalMembers: 0,
              totalExercises: 0
            }));
          }
        },
        error: async (error) => {
          this.isLoadingRooms = false;
          console.error('Error loading joined rooms:', error);
          
          if (error.status === 403) {
            await this.showToast('Solo los trainees tienen rooms unidas', 'warning');
          } else if (error.status === 404) {
            await this.showToast('Usuario no encontrado', 'danger');
          } else {
            await this.showToast('Error al cargar las salas', 'danger');
          }
        }
      });
  }

  enterRoom(room: UserRoom) {
    // Navegar a los ejercicios de la sala
    console.log('Entrando a la sala:', room.name);
    this.router.navigate(['/room-exercises', room.id]);
  }

  /**
   * Buscar sala por código
   */
  async searchRoom() {
    // Validar que el código tenga 7 caracteres
    if (!this.searchCode || this.searchCode.trim().length !== 7) {
      await this.showToast('El código debe tener exactamente 7 caracteres', 'warning');
      return;
    }

    this.isSearching = true;
    this.searchedRoom = null;

    this.roomService.searchRoom({ ROO_Code: this.searchCode.trim().toUpperCase() })
      .subscribe({
        next: async (response) => {
          this.isSearching = false;
          if (response.success && response.room) {
            this.searchedRoom = response.room;
            await this.showToast('Sala encontrada: ' + response.room.ROO_Name, 'success');
          } else {
            await this.showToast(response.message || 'Sala no encontrada', 'warning');
          }
        },
        error: async (error) => {
          this.isSearching = false;
          console.error('Error searching room:', error);
          
          if (error.status === 404) {
            await this.showToast('Room no encontrado con ese código', 'danger');
          } else if (error.status === 422) {
            const errorMsg = error.error?.errors?.ROO_Code?.[0] || 'Error de validación';
            await this.showToast(errorMsg, 'danger');
          } else {
            await this.showToast('Error al buscar la sala', 'danger');
          }
        }
      });
  }

  /**
   * Unirse a la sala encontrada
   */
  async joinSearchedRoom() {
    if (!this.searchedRoom) return;

    this.isSearching = true;

    this.roomService.joinRoom({ URO_ROO_ID: this.searchedRoom.ROO_ID })
      .subscribe({
        next: async (response) => {
          this.isSearching = false;
          if (response.success) {
            await this.showToast(response.message, 'success');
            // Recargar las salas después de unirse
            this.loadMyJoinedRooms();
            this.clearSearch();
          } else {
            await this.showToast(response.message, 'warning');
          }
        },
        error: async (error) => {
          this.isSearching = false;
          console.error('Error joining room:', error);
          
          if (error.status === 403) {
            await this.showToast('Solo los trainees pueden unirse a rooms', 'danger');
          } else if (error.status === 400) {
            await this.showToast('Ya estás unido a este room', 'warning');
          } else if (error.status === 422) {
            const errorMsg = error.error?.errors?.URO_ROO_ID?.[0] || 'Error de validación';
            await this.showToast(errorMsg, 'danger');
          } else if (error.status === 404) {
            await this.showToast('Usuario no encontrado', 'danger');
          } else {
            await this.showToast('Error al unirse al room', 'danger');
          }
        }
      });
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch() {
    this.searchCode = '';
    this.searchedRoom = null;
  }

  /**
   * Mostrar confirmación para salir de una sala
   */
  async leaveRoom(room: UserRoom, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Salir de la sala',
      message: `¿Estás seguro de que deseas salir de "${room.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          role: 'destructive',
          handler: () => {
            this.confirmLeaveRoom(room.id, room.name);
          }
        }
      ],
      cssClass: 'leave-room-alert'
    });

    await alert.present();
  }

  /**
   * Confirmar y ejecutar la salida de la sala
   */
  confirmLeaveRoom(roomId: number, roomName: string) {
    this.roomService.leaveRoom(roomId)
      .subscribe({
        next: async (response) => {
          if (response.success) {
            await this.showToast(response.message, 'success');
            // Recargar las salas después de salir
            this.loadMyJoinedRooms();
          } else {
            await this.showToast(response.message, 'warning');
          }
        },
        error: async (error) => {
          console.error('Error leaving room:', error);
          
          if (error.status === 400) {
            await this.showToast('No estás unido a este room', 'warning');
          } else if (error.status === 404) {
            await this.showToast('Usuario no encontrado', 'danger');
          } else {
            await this.showToast('Error al salir del room', 'danger');
          }
        }
      });
  }

  /**
   * Mostrar toast con mensaje
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}
