import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListarHabitacionesComponent } from './listar-habitaciones/listar-habitaciones.component';
import { CrearHabitacionComponent } from './crear-habitacion/crear-habitacion.component';
import { EditarHabitacionComponent } from './editar-habitacion/editar-habitacion.component';
import { DetalleHabitacionComponent } from './detalle-habitacion/detalle-habitacion.component';
import { ReservarHabitacionComponent } from './reservar-habitacion/reservar-habitacion.component';
import { DetalleReservaComponent } from './detalle-reserva/detalle-reserva.component';

const routes: Routes = [
  {
    path: '',
    component: ListarHabitacionesComponent,
    data: { title: 'Habitaciones' }
  },
  {
    path: 'crear',
    component: CrearHabitacionComponent,
    data: { title: 'Crear Habitación' }
  },
  {
    path: 'editar/:id',
    component: EditarHabitacionComponent,
    data: { title: 'Editar Habitación' }
  },
  {
    path: 'detalle/:id',
    component: DetalleHabitacionComponent,
    data: { title: 'Detalle Habitación' }
  },
  {
    path: 'reservar/:id',
    component: ReservarHabitacionComponent,
    data: { title: 'Reserva de Habitación' }
  },
  {
    path: 'detalle-reserva/:id',
    component: DetalleReservaComponent,
    data: { title: 'Detalles de Reserva' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HabitacionesRoutingModule { }
