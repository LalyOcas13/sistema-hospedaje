import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsumoRoutingModule } from './consumo-routing.module';
import { RegistroConsumoComponent } from './registro-consumo/registro-consumo.component';
import { AgregarProductoModalComponent } from './registro-consumo/agregar-producto-modal/agregar-producto-modal.component';

@NgModule({
  declarations: [
    RegistroConsumoComponent,
    AgregarProductoModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ConsumoRoutingModule
  ]
})
export class ConsumoModule { }
