import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonButton
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  personOutline,
  schoolOutline,
  peopleOutline,
  trophyOutline,
  flameOutline,
  chatbubbleOutline,
  callOutline,
  mailOutline,
  timeOutline,
  statsChartOutline,
  ribbonOutline
} from 'ionicons/icons';

// Database interfaces matching the schema
interface User {
  USR_ID: number;
  USR_Name: string;
  USR_LastName: string;
  USR_Email: string;
  USR_Role: 'trainer' | 'trainee';
  USR_CreatedAt: Date;
}

interface Room {
  ROO_ID: number;
  ROO_Code: number;
  ROO_Name: string;
  ROO_USR_ID: number; // Trainer ID
  USR_CreatedAt: Date;
}

interface UserRoom {
  URO_ID: number;
  URO_ROO_ID: number;
  URO_USR_ID: number;
  USR_CreatedAt: Date;
}

interface Exercise {
  EXC_ID: number;
  EXC_Title: string;
  EXC_Instructions: string;
  EXC_StimatedTime: number;
  EXC_ROO_ID: number;
  USR_CreatedAt: Date;
}

interface Routine {
  ROU_ID: number;
  ROU_USR_ID: number;
  ROU_EXC_ID: number;
  ROU_Status: 'INICIADO' | 'FINALIZADO';
  ROU_Fav: boolean;
}

// Additional interfaces for UI
interface TrainerInfo {
  trainer: User;
  contactInfo: {
    phone?: string;
    schedule: string;
  };
}

interface Teammate {
  user: User;
  stats: {
    completedRoutines: number;
    totalRoutines: number;
    weeklyActive: boolean;
    streak: number;
  };
}

interface RoomStats {
  room: Room;
  memberCount: number;
  totalExercises: number;
  averageCompletion: number;
}

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonButton
  ]
})
export class MembersPage implements OnInit {

  // Current user (mock data)
  currentUser: User = {
    USR_ID: 1,
    USR_Name: 'Carlos',
    USR_LastName: 'García',
    USR_Email: 'carlos@fitness.com',
    USR_Role: 'trainee',
    USR_CreatedAt: new Date('2024-01-15')
  };

  // Trainer information
  trainerInfo: TrainerInfo = {
    trainer: {
      USR_ID: 10,
      USR_Name: 'María',
      USR_LastName: 'Rodríguez',
      USR_Email: 'maria.trainer@fitness.com',
      USR_Role: 'trainer',
      USR_CreatedAt: new Date('2023-06-01')
    },
    contactInfo: {
      phone: '+34 666 123 456',
      schedule: 'Lun-Vie 8:00-20:00'
    }
  };

  // Room information
  roomStats: RoomStats = {
    room: {
      ROO_ID: 5,
      ROO_Code: 2024,
      ROO_Name: 'Grupo Avanzado - Fuerza',
      ROO_USR_ID: 10,
      USR_CreatedAt: new Date('2024-01-01')
    },
    memberCount: 12,
    totalExercises: 45,
    averageCompletion: 78
  };

  // Teammates in the same room
  teammates: Teammate[] = [
    {
      user: {
        USR_ID: 2,
        USR_Name: 'Ana',
        USR_LastName: 'López',
        USR_Email: 'ana@fitness.com',
        USR_Role: 'trainee',
        USR_CreatedAt: new Date('2024-01-10')
      },
      stats: {
        completedRoutines: 45,
        totalRoutines: 50,
        weeklyActive: true,
        streak: 12
      }
    },
    {
      user: {
        USR_ID: 3,
        USR_Name: 'Miguel',
        USR_LastName: 'Fernández',
        USR_Email: 'miguel@fitness.com',
        USR_Role: 'trainee',
        USR_CreatedAt: new Date('2024-01-08')
      },
      stats: {
        completedRoutines: 38,
        totalRoutines: 45,
        weeklyActive: true,
        streak: 8
      }
    },
    {
      user: {
        USR_ID: 4,
        USR_Name: 'Elena',
        USR_LastName: 'Martín',
        USR_Email: 'elena@fitness.com',
        USR_Role: 'trainee',
        USR_CreatedAt: new Date('2024-02-01')
      },
      stats: {
        completedRoutines: 32,
        totalRoutines: 40,
        weeklyActive: false,
        streak: 5
      }
    },
    {
      user: {
        USR_ID: 5,
        USR_Name: 'David',
        USR_LastName: 'Santos',
        USR_Email: 'david@fitness.com',
        USR_Role: 'trainee',
        USR_CreatedAt: new Date('2024-01-20')
      },
      stats: {
        completedRoutines: 42,
        totalRoutines: 48,
        weeklyActive: true,
        streak: 15
      }
    }
  ];

  constructor() {
    addIcons({
      personOutline,
      schoolOutline,
      peopleOutline,
      trophyOutline,
      flameOutline,
      chatbubbleOutline,
      callOutline,
      mailOutline,
      timeOutline,
      statsChartOutline,
      ribbonOutline
    });
  }

  ngOnInit() {
    // Sort teammates by completion rate
    this.teammates.sort((a, b) => {
      const rateA = (a.stats.completedRoutines / a.stats.totalRoutines) * 100;
      const rateB = (b.stats.completedRoutines / b.stats.totalRoutines) * 100;
      return rateB - rateA;
    });
  }

  getCompletionRate(teammate: Teammate): number {
    return Math.round((teammate.stats.completedRoutines / teammate.stats.totalRoutines) * 100);
  }

  getRankPosition(teammate: Teammate): number {
    return this.teammates.indexOf(teammate) + 1;
  }

  get topPerformersCount(): number {
    return this.teammates.filter(t => this.getCompletionRate(t) >= 90).length;
  }

  get weeklyActiveCount(): number {
    return this.teammates.filter(t => t.stats.weeklyActive).length;
  }

  get totalCompanions(): number {
    return this.teammates.length + 1; // +1 para incluir al usuario actual
  }

  contactTrainer() {
    // Implementation for contacting trainer
    console.log('Contacting trainer:', this.trainerInfo.trainer.USR_Email);
  }

  viewTeammateProfile(teammate: Teammate) {
    // Implementation for viewing teammate profile
    console.log('Viewing profile:', teammate.user.USR_Name);
  }

}