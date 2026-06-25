import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recepcion',
  standalone: false,
  templateUrl: './recepcion.component.html',
  styleUrl: './recepcion.component.css'
})
export class RecepcionComponent {
  currentUser = {
    name: 'Administrador'
  };

  menuItems = [
    {
      title: 'Consumos',
      description: 'Gestión de consumos y productos del hotel',
      icon: 'fas fa-utensils',
      route: '/consumo',
      color: 'primary'
    },
    {
      title: 'Vender',
      description: 'Facturación y ventas del hotel',
      icon: 'fas fa-cash-register',
      route: '/facturacion',
      color: 'warning'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    console.log('Navegando a:', route);
    this.router.navigate([route]);
  }
}
