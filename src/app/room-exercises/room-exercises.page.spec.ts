import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomExercisesPage } from './room-exercises.page';

describe('RoomExercisesPage', () => {
  let component: RoomExercisesPage;
  let fixture: ComponentFixture<RoomExercisesPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RoomExercisesPage]
    });
    fixture = TestBed.createComponent(RoomExercisesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});