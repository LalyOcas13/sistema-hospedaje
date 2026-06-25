import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportes',
  standalone: false,
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent {
  currentUser = {
    name: 'Administrador'
  };

  menuItems = [
    {
      title: 'Diario',
      description: 'Reportes diarios de operaciones y ventas del hotel',
      icon: 'fas fa-calendar-day',
      route: '/reportes/diario',
      color: 'primary'
    },
    {
      title: 'Mensual',
      description: 'Reportes mensuales consolidados y estadísticas',
      icon: 'fas fa-calendar-alt',
      route: '/reportes/mensual',
      color: 'success'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
