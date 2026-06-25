import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  selectedFloor = 1;
  
  floors = [
    {
      id: 1,
      title: 'Primer Piso',
      description: 'Habitaciones estándar y suites económicas',
      image: 'assets/CAMA.jpg'
    },
    {
      id: 2,
      title: 'Segundo Piso',
      description: 'Habitaciones ejecutivas y familiares',
      image: 'assets/habitacion-simple-hotel.jpg'
    },
    {
      id: 3,
      title: 'Tercer Piso',
      description: 'Suites presidenciales y penthouse',
      image: 'assets/image-chincheros-cusco-hotel-inka-house-chinchero-4.jpg'
    },
    {
      id: 4,
      title: 'Cuarto Piso',
      description: 'Habitaciones de lujo y servicios especiales',
      image:  'assets/foto-tv-led-suite-hotel-lujo-habitacion_1298493-44322.avif'
    }
  ];

  habitacionesSimples = [
    {
      numero: '101',
      tipo: 'Habitación Simple',
      precio: 50,
      estado: 'disponible',
      imagen: 'assets/habitacion-101.jpg'
    },
    {
      numero: '102',
      tipo: 'Habitación Simple',
      precio: 50,
      estado: 'disponible',
      imagen: 'assets/habitacion-102.jpg'
    },
    {
      numero: '103',
      tipo: 'Habitación Simple',
      precio: 50,
      estado: 'ocupada',
      imagen: 'assets/habitacion-103.jpg'
    },
    {
      numero: '104',
      tipo: 'Habitación Simple',
      precio: 50,
      estado: 'disponible',
      imagen: 'assets/habitacion-104.jpg'
    }
  ];

  constructor() { }

  selectFloor(floorId: number): void {
    this.selectedFloor = floorId;
  }

  reservarHabitacion(habitacion: any): void {
    alert(`Reservando habitación ${habitacion.numero} - ${habitacion.tipo}`);
    // Aquí puedes agregar la lógica para la reserva
  }

  get currentFloorImage(): string {
    const floor = this.floors.find(f => f.id === this.selectedFloor);
    return floor ? floor.image : 'assets/fondo-hotel-inicio.webp';
  }

  get currentFloorTitle(): string {
    const floor = this.floors.find(f => f.id === this.selectedFloor);
    return floor ? floor.title : 'Primer Piso';
  }

  get currentFloorDescription(): string {
    const floor = this.floors.find(f => f.id === this.selectedFloor);
    return floor ? floor.description : 'Habitaciones estándar y suites económicas';
  }
}
