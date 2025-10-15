import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AddExercisePage } from './add-exercise.page';
import { provideRouter } from '@angular/router';

describe('AddExercisePage', () => {
  let component: AddExercisePage;
  let fixture: ComponentFixture<AddExercisePage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [AddExercisePage],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddExercisePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.roomId).toBe('1');
    expect(component.exerciseForm.EXC_Title).toBe('');
    expect(component.exerciseForm.EXC_ROO_ID).toBe(1);
  });

  it('should load room data on init', () => {
    component.ngOnInit();
    expect(component.roomName).toBe('Sala de Cardio');
  });

  it('should validate form correctly', () => {
    // Form should be invalid initially
    expect(component.isFormValid()).toBe(false);

    // Fill required field
    component.exerciseForm.EXC_Title = 'Flexiones';

    // Form should be valid now
    expect(component.isFormValid()).toBe(true);
  });

  it('should save exercise when form is valid', (done) => {
    // Fill required field
    component.exerciseForm.EXC_Title = 'Sentadillas';

    spyOn(console, 'log');
    component.saveExercise();

    expect(console.log).toHaveBeenCalledWith('Guardando ejercicio:', component.exerciseForm);

    // Wait for setTimeout to complete
    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith('Ejercicio guardado exitosamente');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trainer/room-exercises/1']);
      done();
    }, 1100);
  });

  it('should not save exercise when form is invalid', () => {
    spyOn(console, 'log');
    component.saveExercise();

    expect(console.log).toHaveBeenCalledWith('Formulario no válido - El título es obligatorio');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should cancel and navigate back', () => {
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/trainer/room-exercises/1']);
  });

  it('should have correct exercise types', () => {
    expect(component.exerciseTypes).toEqual([
      { value: 'Calentamiento', label: 'Calentamiento' },
      { value: 'Calistenia', label: 'Calistenia' },
      { value: 'Musculatura', label: 'Musculatura' },
      { value: 'Elasticidad', label: 'Elasticidad' },
      { value: 'Resistencia', label: 'Resistencia' },
      { value: 'Médico', label: 'Médico' }
    ]);
  });

  it('should have correct difficulty levels', () => {
    expect(component.difficultyLevels).toEqual([
      { value: 'PRINCIPIANTE', label: 'PRINCIPIANTE' },
      { value: 'INTERMEDIO', label: 'INTERMEDIO' },
      { value: 'AVANZADO', label: 'AVANZADO' }
    ]);
  });
});