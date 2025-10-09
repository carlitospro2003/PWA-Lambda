import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// Removidas todas las importaciones de iconos no utilizadas

// Interfaces simplificadas
interface FavoriteExercise {
  id: number;
  name: string;
}

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent
  ]
})
export class FavoritesPage implements OnInit {
  favorites: FavoriteExercise[] = [];

  constructor() {
    // Ya no necesitamos registrar iconos para la vista simplificada
  }

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    // Datos simulados simplificados
    this.favorites = [
      { id: 1, name: 'Burpees Completos' },
      { id: 2, name: 'Sentadillas con Salto' },
      { id: 3, name: 'Plancha con Elevación' },
      { id: 4, name: 'Flexiones de Brazos' },
      { id: 5, name: 'Mountain Climbers' }
    ];
  }

  // Track by function para ngFor
  trackByExerciseId(index: number, exercise: FavoriteExercise): number {
    return exercise.id;
  }
}