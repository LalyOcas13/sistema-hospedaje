import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { DiarioComponent } from './diario/diario.component';
import { MensualComponent } from './mensual/mensual.component';

const routes: Routes = [
  {
    path: '',
    component: ReportesComponent,
    children: [
      {
        path: 'diario',
        component: DiarioComponent
      },
      {
        path: 'mensual',
        component: MensualComponent
      },
      {
        path: '',
        redirectTo: 'diario',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesRoutingModule { }
