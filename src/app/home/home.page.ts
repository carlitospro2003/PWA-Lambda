import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardContent,
  IonIcon,
  IonChip,
  IonLabel
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  peopleOutline,
  fitnessOutline,
  arrowForwardCircleOutline
} from 'ionicons/icons';

// Interfaz para las salas del usuario
interface UserRoom {
  id: number;
  name: string;
  code: string;
  totalMembers: number;
  totalExercises: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardContent,
    IonIcon,
    IonChip,
    IonLabel
  ]
})
export class HomePage implements OnInit {
  userName: string = 'Carlos';

  // Salas en las que está el usuario
  userRooms: UserRoom[] = [
    {
      id: 1,
      name: 'Grupo Principiantes',
      code: 'ROOM001',
      totalMembers: 12,
      totalExercises: 15
    },
    {
      id: 2,
      name: 'Entrenamiento Avanzado',
      code: 'ROOM003',
      totalMembers: 8,
      totalExercises: 22
    },
    {
      id: 3,
      name: 'HIIT Intensivo',
      code: 'ROOM007',
      totalMembers: 15,
      totalExercises: 18
    }
  ];

  constructor(private router: Router) {
    addIcons({
      peopleOutline,
      fitnessOutline,
      arrowForwardCircleOutline
    });
  }

  ngOnInit() {
    // Inicialización si es necesaria
  }

  enterRoom(room: UserRoom) {
    // Navegar a los ejercicios de la sala
    console.log('Entrando a la sala:', room.name);
    this.router.navigate(['/room-exercises', room.id]);
  }
}
