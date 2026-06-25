import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SidebarComponent } from './shared/sidebar.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { InicioComponent } from './auth/inicio/inicio.component';

const routes: Routes = [
  // Redirigir al login por defecto
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  
  // Rutas de autenticación
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  
  // Rutas protegidas con el sidebar
  {
    path: '',
    component: SidebarComponent,
    canActivate: [AuthGuard], // Proteger todas las rutas hijas con AuthGuard
    children: [
      // Ruta de inicio
      {
        path: 'inicio',
        component: InicioComponent
      },
      
      // Módulo de Usuarios (solo admin)
      {
        path: 'usuarios',
        data: { rol: 'admin' },
        loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule)
      },
      
      // Módulo de Clientes
      {
        path: 'clientes',
        loadChildren: () => import('./clientes/clientes.module').then(m => m.ClientesModule)
      },
      
      // Módulo de Habitaciones
      {
        path: 'habitaciones',
        loadChildren: () => import('./modules/habitaciones/habitaciones.module').then(m => m.HabitacionesModule)
      },
      
      // Módulo de Consumo
      {
        path: 'consumo',
        loadChildren: () => import('./consumo/consumo.module').then(m => m.ConsumoModule)
      },
      
      // Módulo de Facturación
      {
        path: 'facturacion',
        loadChildren: () => import('./facturacion/facturacion.module').then(m => m.FacturacionModule)
      },
      
      // Módulo de Recepción
      {
        path: 'recepcion',
        loadChildren: () => import('./recepcion/recepcion.module').then(m => m.RecepcionModule)
      },
      
      // Módulo de Reportes
      {
        path: 'reportes',
        loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule)
      }
    ]
  },
  
  // Ruta 404 - redirigir al login
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }