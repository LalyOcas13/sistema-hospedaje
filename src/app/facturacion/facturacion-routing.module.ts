import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VenderComponent } from './vender.component';
import { ComprobanteComponent } from './comprobante/comprobante.component';

const routes: Routes = [
  {
    path: '',
    component: VenderComponent
  },
  {
    path: 'comprobante',
    component: ComprobanteComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturacionRoutingModule { }
