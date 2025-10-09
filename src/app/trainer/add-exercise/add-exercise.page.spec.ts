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
    expect(component.exerciseForm.EXC_Name).toBe('');
    expect(component.exerciseForm.EXC_Status).toBe(true);
  });

  it('should load room data on init', () => {
    component.ngOnInit();
    expect(component.roomName).toBe('Sala de Cardio');
  });

  it('should validate form correctly', () => {
    // Form should be invalid initially
    expect(component.isFormValid()).toBe(false);

    // Fill required fields
    component.exerciseForm.EXC_Name = 'Push-ups';
    component.exerciseForm.EXC_Description = 'Ejercicio de pecho';
    component.exerciseForm.EXC_Instructions = 'Mantener la espalda recta';
    component.exerciseForm.EXC_MuscleGroup = 'Pecho';
    component.exerciseForm.EXC_Equipment = 'Sin equipamiento';
    component.exerciseForm.EXC_Difficulty = 'principiante';
    component.exerciseForm.EXC_Type = 'fuerza';

    // Form should be valid now
    expect(component.isFormValid()).toBe(true);
  });

  it('should handle file selection', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    };

    spyOn(console, 'log');
    component.onFileSelected(mockEvent, 'MED_Media1');

    expect(component.exerciseForm.MED_Media1).toBe(mockFile);
    expect(console.log).toHaveBeenCalledWith('Archivo seleccionado para MED_Media1:', 'test.jpg');
  });

  it('should save exercise when form is valid', (done) => {
    // Fill required fields
    component.exerciseForm.EXC_Name = 'Squats';
    component.exerciseForm.EXC_Description = 'Ejercicio de piernas';
    component.exerciseForm.EXC_Instructions = 'Bajar hasta 90 grados';
    component.exerciseForm.EXC_MuscleGroup = 'Piernas';
    component.exerciseForm.EXC_Equipment = 'Sin equipamiento';
    component.exerciseForm.EXC_Difficulty = 'intermedio';
    component.exerciseForm.EXC_Type = 'fuerza';

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

    expect(console.log).toHaveBeenCalledWith('Formulario no válido');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should cancel and navigate back', () => {
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/trainer/room-exercises/1']);
  });

  it('should have correct muscle groups options', () => {
    expect(component.muscleGroups).toContain('Pecho');
    expect(component.muscleGroups).toContain('Espalda');
    expect(component.muscleGroups).toContain('Piernas');
  });

  it('should have correct equipment options', () => {
    expect(component.equipmentOptions).toContain('Sin equipamiento');
    expect(component.equipmentOptions).toContain('Mancuernas');
    expect(component.equipmentOptions).toContain('Barra');
  });

  it('should have correct difficulty levels', () => {
    expect(component.difficultyLevels).toEqual([
      { value: 'principiante', label: 'Principiante' },
      { value: 'intermedio', label: 'Intermedio' },
      { value: 'avanzado', label: 'Avanzado' }
    ]);
  });

  it('should have correct exercise types', () => {
    expect(component.exerciseTypes).toEqual([
      { value: 'cardio', label: 'Cardio' },
      { value: 'fuerza', label: 'Fuerza' },
      { value: 'flexibilidad', label: 'Flexibilidad' },
      { value: 'resistencia', label: 'Resistencia' },
      { value: 'equilibrio', label: 'Equilibrio' }
    ]);
  });
});