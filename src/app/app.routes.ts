import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'verify-2fa',
    loadComponent: () => import('./verify-2fa/verify-2fa.page').then(m => m.Verify2FAPage)
  },
  //VISTA PARA EL USUARIO TRAINER
  {
    path: 'trainer',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'trainer' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./trainer/trainer-dashboard/trainer-dashboard.page').then(m => m.TrainerDashboardPage),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'trainer' }
      },
      {
        path: 'rooms',
        loadComponent: () => import('./trainer/trainer-rooms/trainer-rooms.page').then(m => m.TrainerRoomsPage),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'trainer' }
      },
      {
        path: 'room-exercises/:id',
        loadComponent: () => import('./trainer/room-exercises/room-exercises.page').then(m => m.RoomExercisesPage),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'trainer' }
      },
      {
        path: 'add-exercise/:roomId',
        loadComponent: () => import('./trainer/add-exercise/add-exercise.page').then(m => m.AddExercisePage),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'trainer' }
      },
      {
        path: 'profile',
        loadComponent: () => import('./trainer/trainer-profile/trainer-profile.page').then(m => m.TrainerProfilePage),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'trainer' }
      },
      {
        path: 'edit-profile',
        loadComponent: () => import('./trainer/trainer-edit-profile/trainer-edit-profile.page').then(m => m.TrainerEditProfilePage),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'trainer' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  //VISTA PARA EL USUARIO TRAINEE
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
        canActivate: [AuthGuard]
      },
      {
        path: 'favorites',
        loadComponent: () => import('./favorites/favorites.page').then(m => m.FavoritesPage),
        canActivate: [AuthGuard]
      },
      {
        path: 'members',
        loadComponent: () => import('./members/members.page').then(m => m.MembersPage),
        canActivate: [AuthGuard]
      },
      {
        path: 'stats',
        loadComponent: () => import('./stats/stats.page').then(m => m.StatsPage),
        canActivate: [AuthGuard]
      },
      {
        path: 'account',
        loadComponent: () => import('./account/account.page').then(m => m.AccountPage),
        canActivate: [AuthGuard]
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notifications.page').then(m => m.NotificationsPage),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  //RUTAS PARA TRAINEE - FUERA DE TABS
  {
    path: 'edit-profile',
    loadComponent: () => import('./edit-profile/edit-profile.page').then(m => m.EditProfilePage),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'trainee' }
  },
  {
    path: 'room-exercises/:id',
    loadComponent: () => import('./room-exercises/room-exercises.page').then(m => m.RoomExercisesPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'trainee' }
  },

  //ESTA NO SE USA
  {
    path: 'add-exercise/:roomId',
    loadComponent: () => import('./add-exercise/add-exercise.page').then(m => m.AddExercisePage),
    canActivate: [AuthGuard]
  }
];
