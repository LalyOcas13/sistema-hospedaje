import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HabitacionesRoutingModule } from './habitaciones-routing.module';
import { ListarHabitacionesComponent } from './listar-habitaciones/listar-habitaciones.component';
import { CrearHabitacionComponent } from './crear-habitacion/crear-habitacion.component';
import { EditarHabitacionComponent } from './editar-habitacion/editar-habitacion.component';
import { DetalleHabitacionComponent } from './detalle-habitacion/detalle-habitacion.component';
import { ReservarHabitacionComponent } from './reservar-habitacion/reservar-habitacion.component';
import { DetalleReservaComponent } from './detalle-reserva/detalle-reserva.component';


@NgModule({
  declarations: [
    ListarHabitacionesComponent,
    CrearHabitacionComponent,
    EditarHabitacionComponent,
    DetalleHabitacionComponent,
    ReservarHabitacionComponent,
    DetalleReservaComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    HabitacionesRoutingModule
  ]
})
export class HabitacionesModule { }
