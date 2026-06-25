import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarHabitacionComponent } from './editar-habitacion.component';

describe('EditarHabitacionComponent', () => {
  let component: EditarHabitacionComponent;
  let fixture: ComponentFixture<EditarHabitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarHabitacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarHabitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
