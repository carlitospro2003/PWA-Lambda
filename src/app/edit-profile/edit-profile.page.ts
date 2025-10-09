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
  calendarOutline,
  locationOutline,
  personCircle,
  cameraOutline,
  refreshOutline,
  informationCircleOutline
} from 'ionicons/icons';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
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

  // Datos actuales del usuario (normalmente vendrían de un servicio)
  currentUserProfile: UserProfile = {
    firstName: 'Carlos',
    lastName: 'González Martínez',
    email: 'carlos.gonzalez@gmail.com',
    phone: '+58 412 123 4567',
    dateOfBirth: '1995-05-15',
    address: 'Caracas, Venezuela'
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    // Inicializar el formulario
    this.profileForm = this.formBuilder.group({
      firstName: [this.currentUserProfile.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.currentUserProfile.lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.currentUserProfile.email, [Validators.required, Validators.email]],
      phone: [this.currentUserProfile.phone],
      dateOfBirth: [this.currentUserProfile.dateOfBirth],
      address: [this.currentUserProfile.address]
    });

    addIcons({
      saveOutline,
      personOutline,
      mailOutline,
      phonePortraitOutline,
      calendarOutline,
      locationOutline,
      personCircle,
      cameraOutline,
      refreshOutline,
      informationCircleOutline
    });
  }

  ngOnInit() {
    // Inicialización adicional si es necesaria
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
    }
    return '';
  }

  // Guardar los cambios
  async saveProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      
      // Mostrar loading
      const loading = await this.loadingController.create({
        message: 'Guardando cambios...',
        duration: 2000
      });
      await loading.present();

      // Simular llamada a API
      setTimeout(async () => {
        this.isLoading = false;
        await loading.dismiss();

        // Mostrar mensaje de éxito
        const toast = await this.toastController.create({
          message: 'Perfil actualizado exitosamente',
          duration: 3000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle-outline'
        });
        await toast.present();

        // Volver a la página de cuenta
        this.router.navigate(['/tabs/account']);
      }, 2000);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.profileForm.markAllAsTouched();
      
      const toast = await this.toastController.create({
        message: 'Por favor corrige los errores en el formulario',
        duration: 3000,
        position: 'top',
        color: 'danger',
        icon: 'alert-circle-outline'
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
    this.profileForm.reset(this.currentUserProfile);
  }
}