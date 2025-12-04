import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  home, 
  homeOutline, 
  people, 
  peopleOutline, 
  calendar, 
  calendarOutline, 
  person, 
  personOutline,
  notifications,
  notificationsOutline,
  heart,
  heartOutline
} from 'ionicons/icons';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge]
})
export class TabsPage implements OnInit {
  currentTab: string = 'home';
  unreadCount$: Observable<number>;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.unreadCount$ = this.notificationService.unreadCount$;
    
    // Add all required icons
    addIcons({
      home,
      homeOutline,
      people,
      peopleOutline,
      calendar,
      calendarOutline,
      person,
      personOutline,
      notifications,
      notificationsOutline,
      heart,
      heartOutline
    });
  }

  ngOnInit() {
    // Listen to route changes to update current tab
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateCurrentTab(event.url);
      });

    // Set initial tab based on current URL
    this.updateCurrentTab(this.router.url);
  }

  getCurrentTab(): string {
    return this.currentTab;
  }

  private updateCurrentTab(url: string): void {
    if (url.includes('/tabs/home')) {
      this.currentTab = 'home';
    } else if (url.includes('/tabs/notifications')) {
      this.currentTab = 'notifications';
    } else if (url.includes('/tabs/members')) {
      this.currentTab = 'members';
    } else if (url.includes('/tabs/stats')) {
      this.currentTab = 'stats';
    } else if (url.includes('/tabs/account')) {
      this.currentTab = 'account';
    }
  }
}