import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonChip, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { NetworkService } from '../services/network.service';
import { addIcons } from 'ionicons';
import { cloudDoneOutline, cloudOfflineOutline } from 'ionicons/icons';

@Component({
  selector: 'app-network-status',
  standalone: true,
  imports: [CommonModule, IonChip, IonIcon, IonLabel],
  template: `
    <ion-chip 
      *ngIf="!(isOnline$ | async)" 
      class="network-status offline"
      color="warning">
      <ion-icon name="cloud-offline-outline"></ion-icon>
      <ion-label>Modo Offline</ion-label>
    </ion-chip>
  `,
  styles: [`
    .network-status {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      
      &.offline {
        --background: var(--ion-color-warning);
        --color: var(--ion-color-warning-contrast);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NetworkStatusComponent implements OnInit {
  isOnline$!: Observable<boolean>;

  constructor(private networkService: NetworkService) {
    addIcons({
      cloudDoneOutline,
      cloudOfflineOutline
    });
  }

  ngOnInit() {
    this.isOnline$ = this.networkService.online$;
  }
}
