import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { person, lockClosed, eye, eyeOff, fitness } from 'ionicons/icons';
import { AuthService, LoginRequest } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    FormsModule
  ]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      person,
      lockClosed,
      eye,
      eyeOff,
      fitness
    });
  }

  ngOnInit() {
    // Verificar si ya está autenticado y redirigir según el rol
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user?.USR_UserRole === 'trainer') {
        this.router.navigate(['/trainer/dashboard'], { replaceUrl: true });
      } else if (user?.USR_UserRole === 'trainee') {
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (!this.validateForm()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    const credentials: LoginRequest = {
      USR_Email: this.email.trim(),
      USR_Password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: async (response) => {
        await loading.dismiss();
        
        if (response.success) {
          await this.showToast('¡Bienvenido! Inicio de sesión exitoso', 'success');
          
          // Redirigir según el rol del usuario
          const user = this.authService.getCurrentUser();
          if (user?.USR_UserRole === 'trainer') {
            this.router.navigate(['/trainer/dashboard'], { replaceUrl: true });
          } else if (user?.USR_UserRole === 'trainee') {
            this.router.navigate(['/tabs/home'], { replaceUrl: true });
          } else {
            // Rol desconocido, redirigir a login
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        } else {
          this.errorMessage = response.message || 'Error al iniciar sesión';
          await this.showToast(this.errorMessage, 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error de login:', error);
        
        let errorMsg = 'Error de conexión. Verifica tu conexión a internet.';
        
        if (error.status === 401) {
          errorMsg = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (error.status === 422 && error.error?.errors) {
          // Mostrar errores de validación
          const validationErrors = error.error.errors;
          errorMsg = Object.values(validationErrors)[0] as string;
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        this.errorMessage = errorMsg;
        await this.showToast(errorMsg, 'danger');
      }
    });
  }

  private validateForm(): boolean {
    this.errorMessage = '';
    
    if (!this.email.trim()) {
      this.errorMessage = 'El email es requerido';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }
    
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Ingresa un email válido';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }
    
    if (!this.password || this.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }
    
    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  onRegister() {
    // Navegar a página de registro
    this.router.navigate(['/register']);
  }

  onForgotPassword() {
    // Navegar a página de recuperar contraseña (por implementar)
    console.log('Recuperar contraseña');
  }
}