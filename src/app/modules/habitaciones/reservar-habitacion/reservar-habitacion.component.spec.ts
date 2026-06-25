import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarHabitacionComponent } from './reservar-habitacion.component';

describe('ReservarHabitacionComponent', () => {
  let component: ReservarHabitacionComponent;
  let fixture: ComponentFixture<ReservarHabitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservarHabitacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservarHabitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
