import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'] as string;
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    
    const user = this.authService.getCurrentUser();
    
    // Si se requiere un rol específico y el usuario no lo tiene
    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      // Redirigir según el rol del usuario actual
      if (user?.USR_UserRole === 'trainer') {
        this.router.navigate(['/trainer/dashboard']);
      } else if (user?.USR_UserRole === 'trainee') {
        this.router.navigate(['/tabs/home']);
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }
    
    return true;
  }
}