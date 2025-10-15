import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonChip,
  IonLabel,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  person,
  personOutline,
  mailOutline,
  callOutline,
  calendarOutline,
  statsChartOutline,
  homeOutline,
  peopleOutline,
  barbellOutline,
  createOutline,
  lockClosedOutline,
  logOutOutline,
  fitnessOutline
} from 'ionicons/icons';
import { AuthService, User } from '../../services/auth.service';

interface TrainerStats {
  totalRooms: number;
  totalStudents: number;
  totalExercises: number;
}

@Component({
  selector: 'app-trainer-profile',
  templateUrl: './trainer-profile.page.html',
  styleUrls: ['./trainer-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonChip,
    IonLabel
  ]
})
export class TrainerProfilePage implements OnInit {
  currentUser: User | null = null;
  
  trainerStats: TrainerStats = {
    totalRooms: 0,
    totalStudents: 0,
    totalExercises: 0
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      person,
      personOutline,
      mailOutline,
      callOutline,
      calendarOutline,
      statsChartOutline,
      homeOutline,
      peopleOutline,
      barbellOutline,
      createOutline,
      lockClosedOutline,
      logOutOutline,
      fitnessOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadTrainerStats();
  }

  loadUserData() {
    this.currentUser = this.authService.getCurrentUser();
  }

  loadTrainerStats() {
    // Aquí normalmente cargarías las estadísticas desde un servicio
    // Por ahora usamos datos simulados
    this.trainerStats = {
      totalRooms: 3,
      totalStudents: 45,
      totalExercises: 28
    };
  }

  getFullName(): string {
    if (this.currentUser) {
      return `${this.currentUser.USR_Name} ${this.currentUser.USR_LastName}`;
    }
    return 'Usuario';
  }

  getUserRole(): string {
    return 'Entrenador Personal';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'No disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'No disponible';
    }
  }

  editProfile() {
    // Implementar navegación a página de editar perfil
    console.log('Navegar a editar perfil');
    // this.router.navigate(['/trainer/edit-profile']);
    this.showToast('Función de editar perfil próximamente', 'medium');
  }

  changePassword() {
    // Implementar cambio de contraseña
    console.log('Cambiar contraseña');
    this.showToast('Función de cambiar contraseña próximamente', 'medium');
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          cssClass: 'danger',
          handler: async () => {
            await this.performLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  private async performLogout() {
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
      duration: 10000
    });
    
    await loading.present();
    console.log('Iniciando logout...');

    this.authService.logout().subscribe({
      next: async (response) => {
        await loading.dismiss();
        
        console.log('Logout Response:', response);
        
        if (response.success) {
          await this.showToast(response.message || 'Sesión cerrada exitosamente', 'success');
        } else {
          await this.showToast(response.message || 'Sesión cerrada', 'warning');
        }
        
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: async (error) => {
        await loading.dismiss();
        
        console.error('Logout Error:', error);
        
        // Aunque falle la API, cerramos sesión localmente
        this.authService.logoutLocal();
        
        let errorMessage = 'Error al cerrar sesión en el servidor, pero se cerró localmente';
        
        if (error.status === 401) {
          errorMessage = 'Token inválido - sesión cerrada localmente';
        } else if (error.status === 0) {
          errorMessage = 'Sin conexión al servidor - sesión cerrada localmente';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        await this.showToast(errorMessage, 'warning');
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}