import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, openOutline, createOutline } from 'ionicons/icons';
import { Exercise } from '../../services/exercise.service';
import { environment } from '../../../environments/environment';

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
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip
  ]
})
export class ExerciseDetailModalComponent implements OnInit {
  @Input() exercise!: Exercise;
  @Input() totalImages: number = 0;
  @Input() totalUrls: number = 0;

  mediaItems: Array<{type: string, url: string}> = [];

  constructor(private modalController: ModalController) {
    addIcons({ close, openOutline, createOutline });
  }

  ngOnInit() {
    this.buildMediaItems();
  }

  buildMediaItems() {
    // Construir lista de imágenes con URLs completas
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
    if (this.exercise.EXC_URL1) this.mediaItems.push({ type: 'url', url: this.exercise.EXC_URL1 });
    if (this.exercise.EXC_URL2) this.mediaItems.push({ type: 'url', url: this.exercise.EXC_URL2 });

    console.log('Media items construidos:', this.mediaItems);
  }

  getImageUrl(relativePath: string | undefined | null): string | null {
    if (!relativePath) return null;
    
    // Limpiar barras escapadas que vienen del backend JSON
    const cleanPath = relativePath.replace(/\\/g, '');
    
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    }
    
    // Usa automáticamente la URL correcta según el environment
    const baseUrl = environment.apiUrl.replace('/api', '');
    
    if (cleanPath.startsWith('/storage/')) {
      return `${baseUrl}${cleanPath}`;
    }
    
    return `${baseUrl}/storage/${cleanPath}`;
  }

  openImageInNewTab(url: string) {
    window.open(url, '_blank');
  }

  dismiss(action?: string) {
    this.modalController.dismiss({
      action: action
    });
  }

  editExercise() {
    this.modalController.dismiss({
      action: 'edit',
      exercise: this.exercise
    });
  }

  getDifficultyColor(difficulty: string): string {
    const diff = difficulty.toLowerCase();
    switch (diff) {
      case 'principiante': return 'success';
      case 'intermedio': return 'warning';
      case 'avanzado': return 'danger';
      default: return 'medium';
    }
  }
}
