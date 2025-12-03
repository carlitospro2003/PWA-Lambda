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
    console.log('🖼️ Building media items for exercise:', this.exercise.EXC_ID);
    console.log('Raw media values:', {
      EXC_Media1: this.exercise.EXC_Media1,
      EXC_Media2: this.exercise.EXC_Media2,
      EXC_Media3: this.exercise.EXC_Media3,
      EXC_Media4: this.exercise.EXC_Media4
    });

    // Construir lista de imágenes con URLs completas
    if (this.exercise.EXC_Media1) {
      const url = this.getImageUrl(this.exercise.EXC_Media1);
      console.log('Media1 URL result:', url);
      if (url) this.mediaItems.push({ type: 'image', url });
    }
    if (this.exercise.EXC_Media2) {
      const url = this.getImageUrl(this.exercise.EXC_Media2);
      console.log('Media2 URL result:', url);
      if (url) this.mediaItems.push({ type: 'image', url });
    }
    if (this.exercise.EXC_Media3) {
      const url = this.getImageUrl(this.exercise.EXC_Media3);
      console.log('Media3 URL result:', url);
      if (url) this.mediaItems.push({ type: 'image', url });
    }
    if (this.exercise.EXC_Media4) {
      const url = this.getImageUrl(this.exercise.EXC_Media4);
      console.log('Media4 URL result:', url);
      if (url) this.mediaItems.push({ type: 'image', url });
    }
    
    // Agregar URLs de videos
    if (this.exercise.EXC_URL1) this.mediaItems.push({ type: 'url', url: this.exercise.EXC_URL1 });
    if (this.exercise.EXC_URL2) this.mediaItems.push({ type: 'url', url: this.exercise.EXC_URL2 });

    console.log('📋 Final mediaItems:', this.mediaItems);
  }

  getImageUrl(relativePath: string | undefined | null): string | null {
    if (!relativePath) {
      return null;
    }
    
    // Limpiar barras escapadas que vienen del backend JSON
    const cleanPath = relativePath.replace(/\\/g, '');
    
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    }
    
    // Remover /api solo del FINAL de la URL, no del subdominio
    // De https://api.safekids.site/api -> https://api.safekids.site
    let baseUrl = environment.apiUrl;
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4); // Remueve los últimos 4 caracteres '/api'
    }
    
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
