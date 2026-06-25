import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VenderComponent } from './vender.component';
import { ComprobanteComponent } from './comprobante/comprobante.component';
import { FacturacionRoutingModule } from './facturacion-routing.module';

@NgModule({
  declarations: [
    VenderComponent,
    ComprobanteComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FacturacionRoutingModule
  ],
  providers: [
    DecimalPipe,
    DatePipe
  ]
})
export class FacturacionModule { }