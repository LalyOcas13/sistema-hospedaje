import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionesService, Habitacion } from '../services/habitaciones.service';
import { ClientesService, Cliente } from '../../../clientes/services/clientes.service';
import { ReservasService, Reserva } from '../../reservas/services/reservas.service';
import { MensajeFlotanteService } from '../../../shared/mensaje-flotante/mensaje-flotante.service';
import { ComprobanteService } from '../../../facturacion/services/comprobante.service';
import { VentasService } from '../../../reportes/services/ventas.service';

interface HabitacionFrontend {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
  estado: 'disponible' | 'ocupada' | 'reservada';
  descripcion?: string;
  capacidad?: number;
  piso?: number;
}

interface ReservaConCliente extends Reserva {
  cliente: Cliente;
  habitacion: HabitacionFrontend;
}

@Component({
  selector: 'app-detalle-reserva',
  standalone: false,
  templateUrl: './detalle-reserva.component.html',
  styleUrl: './detalle-reserva.component.css'
})
export class DetalleReservaComponent implements OnInit {
  habitacion: HabitacionFrontend | null = null;
  reserva: ReservaConCliente | null = null;
  idHabitacion: number = 0;
  cargando: boolean = false;
  error: string = '';
  tipoComprobante: string = 'boleta';
  rucIngresado: string = '';
  comprasCliente: any[] = [];
  totalCompras: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private habitacionesService: HabitacionesService,
    private clientesService: ClientesService,
    private reservasService: ReservasService,
    private mensajeFlotanteService: MensajeFlotanteService,
    private comprobanteService: ComprobanteService,
    private ventasService: VentasService
  ) {}

  ngOnInit(): void {
    this.idHabitacion = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    // Cargar habitación
    this.habitacionesService.getHabitacionPorId(this.idHabitacion).subscribe({
      next: (habitacionBackend) => {
        this.habitacion = {
          id: habitacionBackend.id_habitacion,
          numero: habitacionBackend.numero,
          tipo: habitacionBackend.tipo_habitacion,
          precio: habitacionBackend.precio,
          estado: habitacionBackend.estado.toLowerCase() as 'disponible' | 'ocupada' | 'reservada',
          descripcion: habitacionBackend.descripcion,
          capacidad: this.getCapacidadPorTipo(habitacionBackend.tipo_habitacion),
          piso: Math.floor(habitacionBackend.id_habitacion / 100) || 1
        };

        // Buscar reserva activa de esta habitación
        this.buscarReservaActiva();
      },
      error: (err) => {
        console.error('Error al cargar habitación:', err);
        this.error = 'No se pudo cargar la información de la habitación';
        this.cargando = false;
      }
    });
  }

  private buscarReservaActiva(): void {
    // Obtener todas las reservas y buscar la activa para esta habitación
    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        const reservaActiva = reservas.find(r => 
          r.id_habitacion === this.idHabitacion && 
          (r.estado === 'Pagado' || r.estado === 'Pendiente')
        );

        if (reservaActiva) {
          // Cargar datos del cliente
          this.clientesService.getClientePorId(reservaActiva.id_cliente).subscribe({
            next: (cliente) => {
              this.reserva = {
                ...reservaActiva,
                cliente: cliente,
                habitacion: this.habitacion!
              };
              this.cargando = false;

              // Cargar compras del cliente
              this.cargarComprasCliente();
            },
            error: (err) => {
              console.error('Error al cargar cliente:', err);
              this.error = 'No se pudo cargar la información del cliente';
              this.cargando = false;
            }
          });
        } else {
          // No hay reserva activa (la habitación debería estar disponible)
          this.error = 'Esta habitación no tiene una reserva activa';
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error al buscar reservas:', err);
        this.error = 'No se pudo cargar la información de la reserva';
        this.cargando = false;
      }
    });
  }

  private getCapacidadPorTipo(tipo: string): number {
    switch (tipo) {
      case 'Individual': return 1;
      case 'Doble': return 2;
      default: return 2;
    }
  }

  getEstadoReservaClass(): string {
    if (!this.reserva) return '';
    
    switch (this.reserva.estado) {
      case 'Pagado': return 'estado-activa';
      case 'Pendiente': return 'estado-pendiente';
      case 'Finalizada': return 'estado-finalizada';
      default: return '';
    }
  }

  getEstadoReservaIcon(): string {
    if (!this.reserva) return '';
    
    switch (this.reserva.estado) {
      case 'Pagado': return 'fas fa-check-circle';
      case 'Pendiente': return 'fas fa-clock';
      case 'Finalizada': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    return hora.substring(0, 5); // Formato HH:MM
  }

  calcularDuracion(): string {
    if (!this.reserva) return '';
    
    const horaEntrada = this.reserva.hora_entrada;
    const horaSalida = this.reserva.hora_salida;
    
    if (!horaEntrada || !horaSalida) return '';
    
    const [h1, m1] = horaEntrada.split(':').map(Number);
    const [h2, m2] = horaSalida.split(':').map(Number);
    
    const totalMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return `${horas}h ${minutos}m`;
  }

  async finalizarReserva(): Promise<void> {
    if (!this.reserva) return;
    
    const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
      '¿Estás seguro de que deseas finalizar esta reserva? La habitación quedará disponible.',
      'Finalizar Reserva'
    );
    
    if (confirmado) {
      this.reservasService.actualizarEstado(this.reserva.id_reserva, 'Finalizada').subscribe({
        next: () => {
          // Actualizar estado de la habitación a disponible
          this.habitacionesService.actualizarEstado(this.idHabitacion, 'Disponible').subscribe({
            next: () => {
              this.mensajeFlotanteService.mostrarInfo(
                'Reserva finalizada correctamente. La habitación ahora está disponible.',
                'Reserva Finalizada'
              );
              this.router.navigate(['/habitaciones']);
            },
            error: (err) => {
              console.error('Error al actualizar estado de habitación:', err);
              this.mensajeFlotanteService.mostrarAdvertencia(
                'La reserva fue finalizada pero hubo un error al actualizar la habitación.',
                'Advertencia'
              );
            }
          });
        },
        error: (err) => {
          console.error('Error al finalizar reserva:', err);
          this.mensajeFlotanteService.mostrarError(
            'Error al finalizar la reserva',
            'Error'
          );
        }
      });
    }
  }

  imprimirComprobante(): void {
    if (!this.reserva || !this.habitacion) {
      this.mensajeFlotanteService.mostrarError(
        'No hay información de reserva disponible',
        'Error'
      );
      return;
    }

    // Validar documento según tipo de comprobante
    if (this.tipoComprobante === 'factura') {
      // Para factura se requiere RUC (11 dígitos)
      // Usar RUC ingresado si se proporcionó, si no usar el del cliente
      const rucAUsar = this.rucIngresado || this.reserva.cliente.nro_documento;
      if (!rucAUsar || rucAUsar.length !== 11) {
        this.mensajeFlotanteService.mostrarAdvertencia(
          'Para emitir FACTURA se requiere RUC de 11 dígitos.',
          'Documento Inválido'
        );
        return;
      }

      // Validar formato del RUC
      if (!this.validarRUC(rucAUsar, this.reserva.cliente.nro_documento)) {
        return;
      }
    } else {
      // Para boleta se requiere DNI (8 dígitos)
      if (!this.reserva.cliente.nro_documento || this.reserva.cliente.nro_documento.length !== 8) {
        this.mensajeFlotanteService.mostrarAdvertencia(
          'Para emitir BOLETA se requiere DNI de 8 dígitos. El cliente actual no tiene DNI registrado.',
          'Documento Inválido'
        );
        return;
      }
    }

    // Preparar datos para el comprobante
    const datosComprobante = {
      reserva: this.reserva,
      habitacion: this.habitacion,
      cliente: this.reserva.cliente,
      total: this.reserva.total,
      descuento: this.reserva.total_descuento || 0,
      fecha: this.reserva.fecha,
      horaEntrada: this.reserva.hora_entrada,
      horaSalida: this.reserva.hora_salida,
      tiempo: this.reserva.tiempo,
      tipoComprobante: this.tipoComprobante,
      rucIngresado: this.rucIngresado
    };

    console.log('📤 Enviando datosComprobante:', datosComprobante);
    console.log('📤 tipoComprobante:', this.tipoComprobante);

    // Usar el servicio para pasar los datos
    this.comprobanteService.setDatosComprobante(datosComprobante);

    // Navegar al componente de Comprobante (maneja ambos tipos: boleta y factura)
    this.router.navigate(['/facturacion/comprobante']);
  }

  validarRUC(ruc: string, dniCliente: string): boolean {
    // Validar que el RUC tenga 11 dígitos
    if (ruc.length !== 11) {
      this.mensajeFlotanteService.mostrarAdvertencia(
        'El RUC debe tener 11 dígitos.',
        'RUC Inválido'
      );
      return false;
    }

    // Validar que empiece con 10 o 20
    const primerosDigitos = ruc.substring(0, 2);
    if (primerosDigitos !== '10' && primerosDigitos !== '20') {
      this.mensajeFlotanteService.mostrarAdvertencia(
        'El RUC debe empezar con 10 (persona natural) o 20 (persona jurídica).',
        'RUC Inválido'
      );
      return false;
    }

    // Si es persona natural (empieza con 10), validar que los siguientes 8 dígitos coincidan con el DNI
    if (primerosDigitos === '10') {
      const dniDelRUC = ruc.substring(2, 10);
      if (dniDelRUC !== dniCliente) {
        this.mensajeFlotanteService.mostrarAdvertencia(
          `El RUC ingresado no coincide con el DNI del cliente (${dniCliente}). Para persona natural, el RUC debe ser: 10 + DNI + dígito verificador.`,
          'RUC Inválido'
        );
        return false;
      }
    }

    return true;
  }

  volver(): void {
    this.router.navigate(['/habitaciones']);
  }

  private cargarComprasCliente(): void {
    if (!this.reserva) return;

    const todasLasVentas = this.ventasService.obtenerVentas();
    const nombreCliente = this.reserva.cliente.nombres_apellidos;

    // Filtrar ventas por nombre del cliente
    this.comprasCliente = todasLasVentas.filter(venta =>
      venta.cliente.includes(nombreCliente)
    );

    // Calcular total de compras
    this.totalCompras = this.comprasCliente.reduce((sum, v) => sum + v.total, 0);

    console.log('📊 Compras del cliente:', this.comprasCliente);
    console.log('📊 Total de compras:', this.totalCompras);
  }
}
