import { Component, OnInit, AfterViewChecked, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HabitacionesService, Habitacion } from '../services/habitaciones.service';
import { map } from 'rxjs/operators';
import { MensajeFlotanteService } from '../../../shared/mensaje-flotante/mensaje-flotante.service';

interface HabitacionFrontend {
  id: number;
  id_habitacion: number;
  numero: string;
  tipo: string;
  precio: number;
  estado: 'disponible' | 'ocupada' | 'reservada' | 'mantenimiento';
  descripcion?: string;
  imagen?: string;
  capacidad?: number;
  piso?: number;
}

@Component({
  selector: 'app-listar-habitaciones',
  standalone: false,
  templateUrl: './listar-habitaciones.component.html',
  styleUrl: './listar-habitaciones.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ListarHabitacionesComponent implements OnInit, AfterViewChecked {
  habitaciones: HabitacionFrontend[] = [];
  habitacionesFiltradas: HabitacionFrontend[] = [];
  
  // Estados de carga y error
  cargando: boolean = false;
  error: string = '';
  
  // Paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 12;
  totalHabitaciones: number = 0;
  totalPaginas: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;

  constructor(
    private router: Router,
    private habitacionesService: HabitacionesService,
    private mensajeFlotanteService: MensajeFlotanteService
  ) { }

  ngOnInit(): void {
    try {
      this.cargarHabitaciones();
    } catch (error) {
      this.error = 'Error al cargar las habitaciones';
      this.cargando = false;
      // Cargar datos de respaldo si hay error
      this.cargarHabitacionesSimuladas();
    }
  }

  // Forzar recarga cuando el componente se vuelve activo
  ngAfterViewChecked(): void {
    // Verificar si hay cambios en localStorage y recargar si es necesario
    const habitacionesGuardadas = localStorage.getItem('habitaciones');
    if (habitacionesGuardadas && this.habitaciones.length > 0) {
      try {
        const habitacionesActuales = JSON.parse(habitacionesGuardadas);
        const hayCambios = habitacionesActuales.some((hab: any) => {
          const habitacionLocal = this.habitaciones.find(h => h.id_habitacion === hab.id_habitacion);
          return !habitacionLocal || habitacionLocal.estado !== hab.estado;
        });
        
        if (hayCambios) {
          this.cargarHabitacionesSimuladas();
        }
      } catch (error) {
      }
    }
  }

  cargarHabitaciones(): void {
    this.cargando = true;
    this.error = '';
    
    // Primero intentar cargar desde el backend
    this.habitacionesService.getHabitaciones().subscribe({
      next: (data) => {
        // Mapear datos del backend al formato del frontend
        this.habitaciones = data.map(hab => ({
          id: hab.id_habitacion,
          id_habitacion: hab.id_habitacion,
          numero: hab.numero,
          tipo: hab.tipo_habitacion,
          precio: hab.precio,
          estado: hab.estado.toLowerCase() as 'disponible' | 'ocupada' | 'reservada',
          descripcion: hab.descripcion,
          imagen: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop`,
          capacidad: this.getCapacidadPorTipo(hab.tipo_habitacion),
          piso: Math.floor(hab.id_habitacion / 100) || 1
        }));
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        // Usar datos simulados si el backend no está disponible
        this.cargarHabitacionesSimuladas();
      }
    });
  }

  private cargarHabitacionesSimuladas(): void {
    // Primero intentar cargar desde localStorage
    const habitacionesGuardadas = localStorage.getItem('habitaciones');
    let habitaciones: any[] = [];
    
    if (habitacionesGuardadas) {
      try {
        habitaciones = JSON.parse(habitacionesGuardadas);
      } catch (error) {
        habitaciones = [];
      }
    }
    
    // Si no hay datos en localStorage, usar datos por defecto
    if (habitaciones.length === 0) {
      habitaciones = [
        { id_habitacion: 101, numero: '101', tipo_habitacion: 'Individual', precio: 50, estado: 'disponible', capacidad: 1, piso: 1, descripcion: 'Habitación individual con vista a la calle' },
        { id_habitacion: 102, numero: '102', tipo_habitacion: 'Doble', precio: 80, estado: 'disponible', capacidad: 2, piso: 1, descripcion: 'Habitación doble con cama matrimonial' },
        { id_habitacion: 103, numero: '103', tipo_habitacion: 'doble', precio: 120, estado: 'ocupada', capacidad: 2, piso: 1, descripcion: 'Habitación matrimonial con balcón' },
        { id_habitacion: 201, numero: '201', tipo_habitacion: 'Doble', precio: 90, estado: 'ocupada', capacidad: 2, piso: 2, descripcion: 'Habitación doble en segundo piso' },
        { id_habitacion: 202, numero: '202', tipo_habitacion: 'Individual', precio: 55, estado: 'disponible', capacidad: 1, piso: 2, descripcion: 'Habitación individual tranquila' },
        { id_habitacion: 301, numero: '301', tipo_habitacion: 'Doble', precio: 150, estado: 'reservada', capacidad: 2, piso: 3, descripcion: 'Suite presidencial con jacuzzi' }
      ];
    }
    
    // Mapear al formato del frontend
    const habitacionesSimuladas: HabitacionFrontend[] = habitaciones.map(hab => ({
      id: hab.id_habitacion,
      id_habitacion: hab.id_habitacion,
      numero: hab.numero,
      tipo: hab.tipo_habitacion,
      precio: hab.precio,
      estado: hab.estado as 'disponible' | 'ocupada' | 'reservada' | 'mantenimiento',
      descripcion: hab.descripcion,
      imagen: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop`,
      capacidad: hab.capacidad,
      piso: hab.piso
    }));

    this.habitaciones = habitacionesSimuladas;
    this.aplicarFiltros();
    this.cargando = false;
  }

  aplicarFiltros(): void {
    this.habitacionesFiltradas = this.habitaciones;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalHabitaciones = this.habitacionesFiltradas.length;
    this.totalPaginas = Math.ceil(this.totalHabitaciones / this.elementosPorPagina);
    this.startIndex = (this.paginaActual - 1) * this.elementosPorPagina;
    this.endIndex = Math.min(this.startIndex + this.elementosPorPagina, this.totalHabitaciones);
    
    // Aplicar paginación a la vista
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.habitacionesFiltradas = this.habitacionesFiltradas.slice(inicio, fin);
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.aplicarFiltros();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.aplicarFiltros();
    }
  }

  puedeIrAtras(): boolean {
    return this.paginaActual > 1;
  }

  puedeIrSiguiente(): boolean {
    return this.paginaActual < this.totalPaginas;
  }

  obtenerInfoPagina(): string {
    return `Mostrando ${this.startIndex + 1}-${this.endIndex} de ${this.totalHabitaciones} habitaciones`;
  }

  editarHabitacion(habitacion: HabitacionFrontend): void {
    // Navegar a la página de edición con el ID de la habitación
    this.router.navigate(['/habitaciones/editar', habitacion.id_habitacion]);
  }

  async eliminarHabitacion(habitacion: HabitacionFrontend): Promise<void> {
    const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
      `¿Estás seguro de que deseas eliminar la habitación "${habitacion.numero}"?`,
      'Eliminar Habitación'
    );
    
    if (confirmado) {
      this.habitacionesService.eliminarHabitacion(habitacion.id_habitacion).subscribe({
        next: () => {
          this.habitaciones = this.habitaciones.filter(h => h.id !== habitacion.id);
          this.aplicarFiltros();
          this.mensajeFlotanteService.mostrarInfo(
            `Habitación ${habitacion.numero} eliminada exitosamente`,
            'Éxito'
          );
        },
        error: (error) => {
          this.mensajeFlotanteService.mostrarError(
            'No se pudo eliminar la habitación. Intente nuevamente.',
            'Error'
          );
        }
      });
    }
  }

  actualizarEstados(): void {
    // Simular actualización de estados
    this.cargando = true;
    setTimeout(() => {
      this.cargando = false;
    }, 2000);
  }

  abrirModalRegistro(): void {
    // Navegar a crear habitación
    this.router.navigate(['/habitaciones/crear']);
  }

  onHabitacionRegistrada(habitacion: HabitacionFrontend): void {
    // Manejar registro de nueva habitación
    this.habitaciones.push(habitacion);
    this.aplicarFiltros();
  }

  cerrarModal(): void {
    // Cerrar modal
  }

  trackByHabitacion(index: number, habitacion: HabitacionFrontend): number {
    return habitacion.id;
  }

  obtenerNombrePiso(piso: number): string {
    const nombresPisos = ['PRIMER PISO', 'SEGUNDO PISO', 'TERCER PISO'];
    return nombresPisos[piso - 1] || `Piso ${piso}`;
  }

  atras(): void {
    this.paginaAnterior();
  }

  siguiente(): void {
    this.paginaSiguiente();
  }

  async reservarHabitacion(habitacion: HabitacionFrontend): Promise<void> {
    
    if (habitacion.estado === 'disponible') {
      this.router.navigate(['/habitaciones/reservar', habitacion.id]);
    } else {
      // Habitación ocupada/reservada - mostrar opción de ver datos
      const mensaje = habitacion.estado === 'ocupada'
        ? `Esta habitación está OCUPADA.\n\n¿Deseas ver los datos del cliente que la está ocupando actualmente?`
        : `Esta habitación está ${habitacion.estado.toUpperCase()}.\n\n¿Deseas ver los datos del cliente asociado?`;

      const verDetalles = await this.mensajeFlotanteService.mostrarConfirmacion(
        mensaje,
        `Habitación ${habitacion.estado.toUpperCase()}`
      );
      
      if (verDetalles) {
        console.log('Navegando a ver detalles de reserva:', habitacion.id);
        this.router.navigate(['/habitaciones/detalle-reserva', habitacion.id]);
      }
    }
  }

  onImageError(event: Event, habitacion: HabitacionFrontend): void {
    // Asignar imagen de respaldo local cuando falle la carga
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxyZWN0IHg9IjEwMCIgeT0iNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNjAiIGZpbGw9IiNlMGUwZTAiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTAwIiByPSIyMCIgZmlsbD0iI2MwYzBjMCIvPgo8dGV4dCB4PSIxNTAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjODA4MDgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD4KPHN2Zz4=';
  }

  private getCapacidadPorTipo(tipo: string): number {
    switch (tipo) {
      case 'Individual': return 1;
      case 'Doble': return 2;
      default: return 2;
    }
  }
}
