import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistroConsumoComponent } from './registro-consumo.component';
import { AgregarProductoModalComponent } from './agregar-producto-modal/agregar-producto-modal.component';

@NgModule({
  declarations: [
   
    AgregarProductoModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [


    AgregarProductoModalComponent
  ]
})
export class RegistroConsumoModule { }
