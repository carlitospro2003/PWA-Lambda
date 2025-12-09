import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonBackButton,
  IonButtons,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, timeOutline, chevronBack } from 'ionicons/icons';
import { AuthService, LoginRequest } from '../services/auth.service';
import { FirebaseService } from '../services/firebase.service';
import { NotificationService } from '../services/notification.service';
import { VersionService } from '../services/version.service';

interface Verify2FARequest {
  USR_Email: string;
  USR_2FA_Code: string;
}

interface Verify2FAResponse {
  success: boolean;
  message: string;
  data?: any;
  token?: string;
  verified_at?: string;
}

@Component({
  selector: 'app-verify-2fa',
  templateUrl: './verify-2fa.page.html',
  styleUrls: ['./verify-2fa.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonBackButton,
    IonButtons
  ]
})
export class Verify2FAPage implements OnInit {
  email: string = '';
  code: string = '';
  isVerifying: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private firebaseService: FirebaseService,
    private notificationService: NotificationService,
    private versionService: VersionService
  ) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      timeOutline,
      chevronBack
    });
  }

  ngOnInit() {
    // Obtener email guardado en sessionStorage
    const savedEmail = sessionStorage.getItem('pending_2fa_email');
    
    if (!savedEmail) {
      // Si no hay email guardado, redirigir al login
      this.showToast('Sesión expirada. Inicia sesión nuevamente.', 'warning');
      this.router.navigate(['/login']);
      return;
    }
    
    this.email = savedEmail;
  }

  async verifyCode() {
    if (!this.validateCode()) {
      return;
    }

    this.isVerifying = true;
    const loading = await this.loadingController.create({
      message: 'Verificando código...',
      spinner: 'crescent'
    });
    await loading.present();

    const verifyRequest: Verify2FARequest = {
      USR_Email: this.email,
      USR_2FA_Code: this.code.trim()
    };

    this.authService.verify2FA(verifyRequest).subscribe({
      next: async (response: Verify2FAResponse) => {
        await loading.dismiss();
        this.isVerifying = false;

        if (response.success && response.token) {
          // Limpiar sessionStorage
          sessionStorage.removeItem('pending_2fa_email');
          sessionStorage.removeItem('pending_2fa_password');

          await this.showToast('¡Verificación exitosa! Bienvenido.', 'success');

          // Ejecutar lógica post-login
          await this.handleSuccessfulLogin();
        } else {
          this.errorMessage = response.message || 'Código inválido';
          await this.showToast(this.errorMessage, 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isVerifying = false;

        console.error('Error al verificar código 2FA:', error);

        let errorMsg = 'Error al verificar código';
        if (error.status === 401) {
          errorMsg = 'Código inválido o expirado';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }

        this.errorMessage = errorMsg;
        await this.showToast(errorMsg, 'danger');
      }
    });
  }

  async resendCode() {
    const savedEmail = sessionStorage.getItem('pending_2fa_email');
    const savedPassword = sessionStorage.getItem('pending_2fa_password');

    if (!savedEmail || !savedPassword) {
      await this.showToast('Sesión expirada. Vuelve al login.', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Reenviando código...',
      spinner: 'crescent'
    });
    await loading.present();

    // Obtener FCM token
    const fcmToken = await this.firebaseService.getFCMToken();

    const credentials: LoginRequest = {
      USR_Email: savedEmail,
      USR_Password: savedPassword
    };

    if (fcmToken) {
      credentials.fcm_token = fcmToken;
    }

    this.authService.login(credentials).subscribe({
      next: async (response) => {
        await loading.dismiss();
        
        if ((response as any).requires_verification && (response as any).email_sent) {
          await this.showToast('Código reenviado a tu email', 'success');
        } else if ((response as any).requires_verification) {
          await this.showToast('Ingresa el código de verificación', 'warning');
        } else {
          await this.showToast('Error al reenviar código', 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error al reenviar código:', error);
        await this.showToast('Error al reenviar código', 'danger');
      }
    });
  }

  cancelVerification() {
    // Limpiar sessionStorage y volver al login
    sessionStorage.removeItem('pending_2fa_email');
    sessionStorage.removeItem('pending_2fa_password');
    this.router.navigate(['/login']);
  }

  private validateCode(): boolean {
    this.errorMessage = '';

    if (!this.code.trim()) {
      this.errorMessage = 'El código es requerido';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (this.code.trim().length !== 6) {
      this.errorMessage = 'El código debe tener 6 dígitos';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    if (!/^\d{6}$/.test(this.code.trim())) {
      this.errorMessage = 'El código solo debe contener números';
      this.showToast(this.errorMessage, 'warning');
      return false;
    }

    return true;
  }

  onCodeInput(event: any) {
    const value = event.target.value;
    this.code = value.replace(/[^0-9]/g, '').slice(0, 6);
  }

  private async handleSuccessfulLogin() {
    // Activar listener de mensajes FCM
    this.firebaseService.listenToMessages();
    console.log('✅ Listener de FCM activado después del login');

    // Sincronizar notificaciones
    this.notificationService.syncNotificationsFromBackend();
    console.log('✅ Sincronización de notificaciones iniciada');

    // Verificar actualizaciones
    await this.versionService.checkForUpdates();
    console.log('✅ Verificación de versión completada');

    // Redirigir según el rol del usuario
    const user = this.authService.getCurrentUser();
    if (user?.USR_UserRole === 'trainer') {
      this.router.navigate(['/trainer/dashboard'], { replaceUrl: true });
    } else if (user?.USR_UserRole === 'trainee') {
      this.router.navigate(['/tabs/home'], { replaceUrl: true });
    } else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
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
}
