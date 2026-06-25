import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroConsumoComponent } from './registro-consumo/registro-consumo.component';

const routes: Routes = [
  {
    path: '',
    component: RegistroConsumoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsumoRoutingModule { }
