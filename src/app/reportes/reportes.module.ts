import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { DiarioComponent } from './diario/diario.component';
import { MensualComponent } from './mensual/mensual.component';
import { ReportesRoutingModule } from './reportes-routing.module';

@NgModule({
  declarations: [
    ReportesComponent,
    DiarioComponent,
    MensualComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReportesRoutingModule
  ]
})
export class ReportesModule { }
