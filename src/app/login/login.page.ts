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
  IonCheckbox,
  ToastController,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { person, lockClosed, eye, eyeOff, fitness, fingerPrint } from 'ionicons/icons';
import { AuthService, LoginRequest } from '../services/auth.service';
import { BiometricService } from '../services/biometric.service';
import { FirebaseService } from '../services/firebase.service';
import { NotificationService } from '../services/notification.service';

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
    IonCheckbox,
    FormsModule
  ]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Biometric properties
  biometricAvailable: boolean = false;
  biometricEnabled: boolean = false;
  savedEmail: string | null = null;
  rememberBiometric: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private biometricService: BiometricService,
    private alertController: AlertController,
    private firebaseService: FirebaseService,
    private notificationService: NotificationService
  ) {
    addIcons({
      person,
      lockClosed,
      eye,
      eyeOff,
      fitness,
      fingerPrint
    });
  }

  async ngOnInit() {
    // Verificar si ya está autenticado y redirigir según el rol
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user?.USR_UserRole === 'trainer') {
        this.router.navigate(['/trainer/dashboard'], { replaceUrl: true });
      } else if (user?.USR_UserRole === 'trainee') {
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      }
    }
    
    // Verificar disponibilidad de biometría
    this.biometricAvailable = await this.biometricService.isAvailable();
    this.biometricEnabled = this.biometricService.isBiometricEnabled();
    this.savedEmail = this.biometricService.getSavedEmail();
    
    // Si hay biometría habilitada, pre-llenar el email
    if (this.biometricEnabled && this.savedEmail) {
      this.email = this.savedEmail;
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

    // Obtener FCM token antes de hacer login
    const fcmToken = await this.firebaseService.getFCMToken();

    const credentials: LoginRequest = {
      USR_Email: this.email.trim(),
      USR_Password: this.password
    };

    // Agregar fcm_token si está disponible
    if (fcmToken) {
      credentials.fcm_token = fcmToken;
      console.log('Enviando FCM token al backend:', fcmToken);
    }

    this.authService.login(credentials).subscribe({
      next: async (response) => {
        await loading.dismiss();
        
        if (response.success) {
          await this.showToast('¡Bienvenido! Inicio de sesión exitoso', 'success');
          
          // Activar listener de mensajes FCM después del login exitoso
          this.firebaseService.listenToMessages();
          console.log('✅ Listener de FCM activado después del login');
          
          // Sincronizar notificaciones después del login
          this.notificationService.syncNotificationsFromBackend();
          console.log('✅ Sincronización de notificaciones iniciada');
          
          // Si tiene biometría disponible y marcó "recordar", preguntar si quiere activarla
          if (this.biometricAvailable && !this.biometricEnabled && this.rememberBiometric) {
            await this.promptEnableBiometric();
          }
          
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

  /**
   * Login con huella digital
   */
  async onBiometricLogin() {
    if (!this.biometricAvailable) {
      await this.showToast('La autenticación biométrica no está disponible en este dispositivo', 'warning');
      return;
    }

    if (!this.biometricEnabled) {
      await this.showToast('Primero debes iniciar sesión normalmente y activar la huella', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Verificando huella...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const credentials = await this.biometricService.getCredentialsWithBiometric();
      
      if (!credentials) {
        await loading.dismiss();
        await this.showToast('No se pudo obtener las credenciales', 'danger');
        return;
      }

      // Obtener FCM token antes de hacer login
      const fcmToken = await this.firebaseService.getFCMToken();

      // Hacer login con las credenciales guardadas
      const loginRequest: LoginRequest = {
        USR_Email: credentials.email,
        USR_Password: credentials.password
      };

      // Agregar fcm_token si está disponible
      if (fcmToken) {
        loginRequest.fcm_token = fcmToken;
        console.log('Enviando FCM token al backend (biometric):', fcmToken);
      }

      this.authService.login(loginRequest).subscribe({
        next: async (response) => {
          await loading.dismiss();
          
          if (response.success) {
            await this.showToast('¡Bienvenido! Inicio de sesión con huella exitoso', 'success');
            
            const user = this.authService.getCurrentUser();
            if (user?.USR_UserRole === 'trainer') {
              this.router.navigate(['/trainer/dashboard'], { replaceUrl: true });
            } else if (user?.USR_UserRole === 'trainee') {
              this.router.navigate(['/tabs/home'], { replaceUrl: true });
            }
          } else {
            await this.showToast('Error al iniciar sesión', 'danger');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          console.error('Error biometric login:', error);
          await this.showToast('Error al iniciar sesión. Intenta con tu contraseña.', 'danger');
        }
      });
    } catch (error) {
      await loading.dismiss();
      console.error('Biometric authentication cancelled or failed:', error);
    }
  }

  /**
   * Preguntar si desea activar autenticación biométrica
   */
  async promptEnableBiometric() {
    const alert = await this.alertController.create({
      header: 'Activar Huella Digital',
      message: '¿Deseas usar tu huella digital para iniciar sesión más rápido en el futuro?',
      buttons: [
        {
          text: 'No, gracias',
          role: 'cancel'
        },
        {
          text: 'Activar',
          handler: async () => {
            const success = await this.biometricService.saveCredentials(this.email, this.password);
            if (success) {
              this.biometricEnabled = true;
              this.savedEmail = this.email;
              await this.showToast('Huella digital activada correctamente', 'success');
            } else {
              await this.showToast('No se pudo activar la huella. Intenta más tarde.', 'warning');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Desactivar autenticación biométrica
   */
  async disableBiometric() {
    const alert = await this.alertController.create({
      header: 'Desactivar Huella',
      message: '¿Estás seguro de que deseas desactivar el inicio de sesión con huella?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Desactivar',
          role: 'destructive',
          handler: () => {
            this.biometricService.disableBiometric();
            this.biometricEnabled = false;
            this.savedEmail = null;
            this.showToast('Huella digital desactivada', 'success');
          }
        }
      ]
    });

    await alert.present();
  }
}