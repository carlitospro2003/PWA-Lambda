import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle, 
  IonIcon, 
  IonButton,
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { UserService, User } from '../services/user.service';

import { addIcons } from 'ionicons';
import {
  personCircle,
  logOutOutline,
  createOutline
} from 'ionicons/icons';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonButton
  ]
})
export class AccountPage implements OnInit {

  userProfile: UserProfile = {
    firstName: '',
    lastName: '',
    email: ''
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private userService: UserService
  ) {
    addIcons({
      personCircle,
      logOutOutline,
      createOutline
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ionViewWillEnter() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      const response = await this.userService.getUser().toPromise();
      
      if (response && response.success && response.data) {
        const user = response.data;
        this.userProfile = {
          firstName: user.USR_Name,
          lastName: user.USR_LastName,
          email: user.USR_Email
        };
        
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userProfile = {
          firstName: user.USR_Name,
          lastName: user.USR_LastName,
          email: user.USR_Email
        };
      }
    }
  }

  openEditProfile() {
    // Navegar a la vista de edición de perfil
    this.router.navigate(['/edit-profile']);
  }

  async signOut() {
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

    this.authService.logout().subscribe({
      next: async (response) => {
        await loading.dismiss();
        
        // Limpiar localStorage y token SIEMPRE después del logout
        this.authService.logoutLocal();
        
        if (response.success) {
          const toast = await this.toastController.create({
            message: response.message || 'Sesión cerrada exitosamente',
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          await toast.present();
        }
        
        // Navegar al login
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error al cerrar sesión:', error);
        
        // Aunque falle la API, cerramos sesión localmente
        this.authService.logoutLocal();
        
        const toast = await this.toastController.create({
          message: 'Sesión cerrada localmente',
          duration: 2000,
          color: 'warning',
          position: 'bottom'
        });
        await toast.present();
        
        // Navegar al login
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }
}