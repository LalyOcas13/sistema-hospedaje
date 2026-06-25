import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent implements OnInit{
  
showRightColumn = false; // Controla la visibilidad de la columna derecha

constructor(private router: Router, private authService: AuthService) {}

// Datos del hotel
hotelName = 'HOSPEDAJE L&V';
logoPath = 'logo.png';

// Datos del usuario
userName = 'LALY VASQUEZ';

// Menú de navegación
menuItems = [
  { label: 'Inicio', icon: 'bx bx-home', route: '/inicio' },
  { label: 'Usuarios', icon: 'bx bx-group', route: '/usuarios' },
  { label: 'Clientes', icon: 'bx bx-user', route: '/clientes' },
  { label: 'Habitaciones', icon: 'bx bx-building', route: '/habitaciones' },
  { label: 'Recepción', icon: 'bx bx-conversation', route: '/recepcion' },
  { label: 'Reportes', icon: 'bx bx-bar-chart', route: '/reportes' }
];

// Pisos del hotel
floors = [
  { label: 'PRIMER PISO', active: true },
  { label: 'SEGUNDO PISO', active: false },
  { label: 'TERCER PISO', active: false }
];

// Variables para el reloj
hourRotation = 0;
minuteRotation = 0;
secondRotation = 0;
currentTime = '';
currentDate = '';

// Variables para el calendario
dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
currentMonth = '';
daysInMonth: (number | null)[] = [];
emptyDays: number[] = [];

ngOnInit(): void {
  // Configuración inicial
  this.initClock();
  this.initCalendar();
  this.loadCurrentUser();
  
  // Verificar la ruta actual al inicializar
  this.showRightColumn = this.router.url.startsWith('/inicio');
  if (this.showRightColumn) {
    document.body.classList.remove('no-right-sidebar');
  } else {
    document.body.classList.add('no-right-sidebar');
  }
  
  // Actualizar menú activo según la ruta actual
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.showRightColumn = event.urlAfterRedirects.startsWith('/inicio');
      if (this.showRightColumn) {
        document.body.classList.remove('no-right-sidebar');
      } else {
        document.body.classList.add('no-right-sidebar');
      }
    }
  });
}

// Maneja la selección de un piso
selectFloor(selectedFloor: any): void {
  this.floors.forEach(floor => floor.active = false);
  selectedFloor.active = true;
  // Aquí puedes cargar los datos del piso seleccionado
}

// Configura el reloj digital
initClock(): void {
  this.updateClock();
  setInterval(() => this.updateClock(), 1000);
}

// Actualiza el reloj
updateClock(): void {
  const now = new Date();
  
  this.currentTime = now.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  this.currentDate = now.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

// Configura el calendario
initCalendar(): void {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  this.currentMonth = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
  
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = (firstDay + 6) % 7;
  
  this.emptyDays = Array(adjustedFirstDay).fill(0);
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  this.daysInMonth = Array.from({length: daysInMonth}, (_, i) => i + 1);
}

// Verifica si un día es hoy
isToday(day: number | null): boolean {
  if (day === null) return false;
  const now = new Date();
  return now.getDate() === day;
}

// Métodos para los controles de ventana
minimizeWindow(): void {
  console.log('Minimizar ventana');
}

toggleFullscreen(): void {
  console.log('Alternar pantalla completa');
}

closeWindow(): void {
  console.log('Cerrar ventana');
}

// Carga la información del usuario actual desde la API
loadCurrentUser(): void {
  const currentUser = this.authService.getCurrentUser();
  if (currentUser && currentUser.name) {
    // Usar 'name' según la interfaz User
    this.userName = currentUser.name;
  } else {
    this.userName = 'Usuario';
  }
}

// Cierra la sesión del usuario
logout(): void {
  console.log('Cerrando sesión...');
  this.authService.logout();
  this.router.navigate(['/login']);
}
}
