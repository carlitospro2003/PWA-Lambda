import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonBackButton,
  IonList,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline,
  personOutline,
  mailOutline,
  phonePortraitOutline,
  personCircle,
  cameraOutline,
  refreshOutline,
  informationCircleOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { UserService, User } from '../services/user.service';
import { AuthService } from '../services/auth.service';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonIcon,
    IonBackButton,
    IonList
  ]
})
export class EditProfilePage implements OnInit {
  profileForm: FormGroup;
  isLoading: boolean = false;
  currentUser: User | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: ['', [Validators.required, Validators.maxLength(10)]],
      password: ['', [Validators.minLength(8), Validators.maxLength(255)]]
    });

    addIcons({
      saveOutline,
      personOutline,
      mailOutline,
      phonePortraitOutline,
      personCircle,
      cameraOutline,
      refreshOutline,
      informationCircleOutline,
      lockClosedOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    try {
      const response = await this.userService.getUser().toPromise();
      
      if (response && response.success && response.data) {
        this.currentUser = response.data;
        this.profileForm.patchValue({
          firstName: response.data.USR_Name,
          lastName: response.data.USR_LastName,
          email: response.data.USR_Email,
          phone: response.data.USR_Phone
        });
        
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('Datos del usuario cargados correctamente');
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      
      const user = this.authService.getCurrentUser();
      if (user) {
        this.currentUser = user;
        this.profileForm.patchValue({
          firstName: user.USR_Name,
          lastName: user.USR_LastName,
          email: user.USR_Email,
          phone: user.USR_Phone
        });
      }
    }
  }

  // Verificar si un campo tiene errores
  hasError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (field.errors['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  // Guardar los cambios
  async saveProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      
      const loading = await this.loadingController.create({
        message: 'Guardando cambios...'
      });
      await loading.present();

      const updateData: any = {};
      
      if (this.profileForm.value.firstName) {
        updateData.USR_Name = this.profileForm.value.firstName;
      }
      if (this.profileForm.value.lastName) {
        updateData.USR_LastName = this.profileForm.value.lastName;
      }
      if (this.profileForm.value.email) {
        updateData.USR_Email = this.profileForm.value.email;
      }
      if (this.profileForm.value.phone) {
        updateData.USR_Phone = this.profileForm.value.phone;
      }
      if (this.profileForm.value.password) {
        updateData.USR_Password = this.profileForm.value.password;
      }

      try {
        const response = await this.userService.updateUser(updateData).toPromise();
        
        if (response && response.success) {
          console.log('Success:', response.success);
          console.log('Message:', response.message);
          console.log('Usuario actualizado:', response.data);

          await loading.dismiss();
          this.isLoading = false;

          if (response.data) {
            this.currentUser = response.data;
            localStorage.setItem('user', JSON.stringify(response.data));
          }

          const toast = await this.toastController.create({
            message: response.message || 'Perfil actualizado exitosamente',
            duration: 3000,
            position: 'bottom',
            color: 'success'
          });
          await toast.present();

          this.router.navigate(['/tabs/account']);
        }
      } catch (error: any) {
        console.error('Error completo:', error);
        if (error?.error) {
          console.log('Respuesta del servidor:', error.error);
        }
        
        await loading.dismiss();
        this.isLoading = false;

        let errorMessage = 'Error al actualizar el perfil';
        
        if (error?.error?.errors) {
          const errors = error.error.errors;
          const firstError = Object.values(errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }

        const toast = await this.toastController.create({
          message: errorMessage,
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        await toast.present();
      }
    } else {
      this.profileForm.markAllAsTouched();
      
      const toast = await this.toastController.create({
        message: 'Por favor corrige los errores en el formulario',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  // Cancelar edición
  cancelEdit() {
    this.router.navigate(['/tabs/account']);
  }

  // Resetear formulario
  resetForm() {
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.USR_Name,
        lastName: this.currentUser.USR_LastName,
        email: this.currentUser.USR_Email,
        phone: this.currentUser.USR_Phone,
        password: ''
      });
    }
  }
}