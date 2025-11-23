import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardContent,
  IonChip,
  IonLabel,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, imagesOutline, videocamOutline } from 'ionicons/icons';
import { environment } from '../../environments/environment';

interface ExerciseDetail {
  EXC_ID: number;
  EXC_Title: string;
  EXC_Type?: string;
  EXC_Instructions?: string;
  EXC_DifficultyLevel?: string;
  EXC_Media1?: string | null;
  EXC_Media2?: string | null;
  EXC_Media3?: string | null;
  EXC_Media4?: string | null;
  EXC_URL1?: string | null;
  EXC_URL2?: string | null;
  room?: {
    ROO_ID: number;
    ROO_Code: string;
    ROO_Name: string;
  };
}

@Component({
  selector: 'app-exercise-detail-modal',
  templateUrl: './exercise-detail-modal.component.html',
  styleUrls: ['./exercise-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardContent,
    IonChip,
    IonLabel
  ]
})
export class ExerciseDetailModalComponent {
  @Input() exercise!: ExerciseDetail;
  @Input() totalImages: number = 0;
  @Input() totalUrls: number = 0;

  mediaItems: Array<{type: string, url: string}> = [];

  constructor(private modalController: ModalController) {
    addIcons({ close, imagesOutline, videocamOutline });
  }

  ngOnInit() {
    this.buildMediaItems();
  }

  buildMediaItems() {
    this.mediaItems = [];

    // Agregar imágenes
    if (this.exercise.EXC_Media1) {
      const url = this.getImageUrl(this.exercise.EXC_Media1);
      if (url) this.mediaItems.push({ type: 'image', url });
    }
    if (this.exercise.EXC_Media2) {
      const url = this.getImageUrl(this.exercise.EXC_Media2);
      if (url) this.mediaItems.push({ type: 'image', url });
    }
    if (this.exercise.EXC_Media3) {
      const url = this.getImageUrl(this.exercise.EXC_Media3);
      if (url) this.mediaItems.push({ type: 'image', url });
    }
    if (this.exercise.EXC_Media4) {
      const url = this.getImageUrl(this.exercise.EXC_Media4);
      if (url) this.mediaItems.push({ type: 'image', url });
    }

    // Agregar URLs de videos
    if (this.exercise.EXC_URL1) {
      this.mediaItems.push({ type: 'url', url: this.exercise.EXC_URL1 });
    }
    if (this.exercise.EXC_URL2) {
      this.mediaItems.push({ type: 'url', url: this.exercise.EXC_URL2 });
    }
  }

  getImageUrl(relativePath: string | null | undefined): string | null {
    if (!relativePath) return null;

    // Si la ruta ya es completa (http/https), retornarla tal cual
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }

    // Construir URL para Laravel storage
    const baseUrl = environment.apiUrl.replace('/api', '');
    
    // Si la ruta ya tiene /storage, no duplicar
    if (relativePath.startsWith('/storage')) {
      return `${baseUrl}${relativePath}`;
    }
    
    return `${baseUrl}/storage/${relativePath}`;
  }

  openImageInNewTab(url: string) {
    window.open(url, '_blank');
  }

  getDifficultyColor(difficulty: string | undefined): string {
    if (!difficulty) return 'medium';
    const diff = difficulty.toLowerCase();
    switch (diff) {
      case 'principiante': return 'success';
      case 'intermedio': return 'warning';
      case 'avanzado': return 'danger';
      default: return 'medium';
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
