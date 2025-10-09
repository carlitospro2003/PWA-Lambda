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
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonSelect,
  IonSelectOption,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  person, 
  lockClosed, 
  eye, 
  eyeOff, 
  mail, 
  chevronBack,
  personAdd,
  fitness,
  call
} from 'ionicons/icons';
import { AuthService, RegisterRequest } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonSelect,
    IonSelectOption,
    FormsModule
  ]
})
export class RegisterPage implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  role: 'trainer' | 'trainee' = 'trainee'; // Por defecto trainee
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
      mail,
      chevronBack,
      personAdd,
      fitness,
      call
    });
  }

  ngOnInit() {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.firstName.trim()) {
      this.errorMessage = 'El nombre es requerido';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (this.firstName.trim().length < 2) {
      this.errorMessage = 'El nombre debe tener al menos 2 caracteres';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (!this.lastName.trim()) {
      this.errorMessage = 'El apellido es requerido';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (this.lastName.trim().length < 2) {
      this.errorMessage = 'El apellido debe tener al menos 2 caracteres';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'El email es requerido';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Ingresa un email válido';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (!this.phone.trim()) {
      this.errorMessage = 'El teléfono es requerido';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (this.phone.trim().length !== 10) {
      this.errorMessage = 'El teléfono debe tener exactamente 10 dígitos';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (!this.password) {
      this.errorMessage = 'La contraseña es requerida';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    return true;
  }

  async onRegister() {
    if (!this.validateForm()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando usuario...',
      spinner: 'crescent'
    });
    await loading.present();

    const registerData: RegisterRequest = {
      USR_Name: this.firstName.trim(),
      USR_LastName: this.lastName.trim(),
      USR_Email: this.email.trim(),
      USR_Phone: this.phone.trim(),
      USR_Password: this.password,
      USR_UserRole: this.role
    };

    this.authService.register(registerData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        
        if (response.success) {
          await this.showToast('¡Registro exitoso! Ahora puedes iniciar sesión', 'success');
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = response.message || 'Error al registrar usuario';
          await this.showToast(this.errorMessage, 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error de registro:', error);
        
        let errorMsg = 'Error de conexión. Verifica tu conexión a internet.';
        
        if (error.status === 422 && error.error?.errors) {
          // Mostrar errores de validación
          const validationErrors = error.error.errors;
          const firstError = Object.values(validationErrors)[0] as string[];
          errorMsg = firstError[0];
        } else if (error.status === 403) {
          errorMsg = 'No tienes permisos para registrarte con ese rol';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        this.errorMessage = errorMsg;
        await this.showToast(errorMsg, 'danger');
      }
    });
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

  onBackToLogin() {
    this.router.navigate(['/login']);
  }
}