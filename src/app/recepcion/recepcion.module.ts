import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RecepcionComponent } from './recepcion.component';
import { RecepcionRoutingModule } from './recepcion-routing.module';

@NgModule({
  declarations: [
    RecepcionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RecepcionRoutingModule
  ]
})
export class RecepcionModule { }
