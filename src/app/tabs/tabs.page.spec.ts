import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TabsPage } from './tabs.page';
import { provideRouter } from '@angular/router';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return current tab', () => {
    component.currentTab = 'home';
    expect(component.getCurrentTab()).toBe('home');
  });

  it('should initialize with home tab', () => {
    expect(component.getCurrentTab()).toBe('home');
  });

  it('should update current tab when URL changes', () => {
    // Test updateCurrentTab method directly
    component['updateCurrentTab']('/tabs/members');
    expect(component.getCurrentTab()).toBe('members');
  });

  it('should handle all tab routes correctly', () => {
    component['updateCurrentTab']('/tabs/home');
    expect(component.getCurrentTab()).toBe('home');

    component['updateCurrentTab']('/tabs/members');
    expect(component.getCurrentTab()).toBe('members');

    component['updateCurrentTab']('/tabs/stats');
    expect(component.getCurrentTab()).toBe('stats');

    component['updateCurrentTab']('/tabs/account');
    expect(component.getCurrentTab()).toBe('account');
  });
});