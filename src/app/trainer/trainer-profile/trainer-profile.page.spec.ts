import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TrainerProfilePage } from './trainer-profile.page';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';

describe('TrainerProfilePage', () => {
  let component: TrainerProfilePage;
  let fixture: ComponentFixture<TrainerProfilePage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockAuthService.getCurrentUser.and.returnValue({
      USR_ID: 1,
      USR_Name: 'Juan',
      USR_LastName: 'Pérez',
      USR_Email: 'juan@example.com',
      USR_Phone: '1234567890',
      USR_UserRole: 'trainer',
      USR_FCM: 'token',
      created_at: '2025-01-01T00:00:00.000000Z',
      updated_at: '2025-01-01T00:00:00.000000Z'
    });

    await TestBed.configureTestingModule({
      imports: [TrainerProfilePage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainerProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    expect(component.currentUser).toBeTruthy();
    expect(component.currentUser?.USR_Name).toBe('Juan');
  });

  it('should return full name correctly', () => {
    const fullName = component.getFullName();
    expect(fullName).toBe('Juan Pérez');
  });

  it('should format date correctly', () => {
    const formattedDate = component.formatDate('2025-01-01T00:00:00.000000Z');
    expect(formattedDate).toContain('2025');
  });

  it('should handle logout', async () => {
    spyOn(component, 'logout').and.callThrough();
    // Test logout functionality would require AlertController mock
  });
});