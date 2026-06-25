import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HabitacionesService, Habitacion } from '../services/habitaciones.service';
import { ClientesService, Cliente, CrearClienteRequest } from '../../../clientes/services/clientes.service';
import { ReservasService, CrearReservaRequest } from '../../reservas/services/reservas.service';
import { MensajeFlotanteService } from '../../../shared/mensaje-flotante/mensaje-flotante.service';

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

@Component({
  selector: 'app-reservar-habitacion',
  standalone: false,
  templateUrl: './reservar-habitacion.component.html',
  styleUrl: './reservar-habitacion.component.css'
})
export class ReservarHabitacionComponent implements OnInit {
  habitacion: HabitacionFrontend | null = null;
  reservaForm: FormGroup;
  idHabitacion: number = 0;
  currentUser: any = { name: 'Laly Melissa Ocas Vasquez' };
  fechaMinima: string = '';

  // Propiedades para el debounce
  private debounceTimer: any = null;
  buscandoCliente: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private habitacionesService: HabitacionesService,
    private clientesService: ClientesService,
    private reservasService: ReservasService,
    private mensajeFlotanteService: MensajeFlotanteService
  ) {
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    
    this.reservaForm = this.fb.group({
      identificacion: ['', Validators.required],
      nombreCliente: ['', Validators.required],
      telefono: [''],
      acompanante: [''],
      tipoRegistro: ['hospedar', Validators.required],
      tiempo: [30, [Validators.required, Validators.min(1)]],
      fecha: [this.getTodayDate(), Validators.required],
      horaEntrada: ['', Validators.required],
      horaSalida: ['', Validators.required],
      descuento: [0, [Validators.min(0), Validators.max(100)]],
      estadoReserva: ['Pendiente', Validators.required]
    });
  }

  ngOnInit(): void {
    this.idHabitacion = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarHabitacion();
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Método para buscar cliente por DNI y autocompletar formulario
  onIdentificacionChange(): void {
    const identificacion = this.reservaForm.get('identificacion')?.value;
    
    // Limpiar timer anterior
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // No buscar si está vacío o es muy corto
    if (!identificacion || identificacion.length < 8) {
      this.buscandoCliente = false;
      return;
    }
    
    // Configurar nuevo timer con debounce de 800ms
    this.debounceTimer = setTimeout(() => {
      this.buscandoCliente = true;
      
      // Buscar cliente por DNI
      this.clientesService.buscarClientePorDocumento(identificacion).subscribe({
        next: (clientes) => {
          this.buscandoCliente = false;
          if (clientes.length > 0) {
            const cliente = clientes[0];
            
            // Autocompletar formulario con datos del cliente
            this.reservaForm.patchValue({
              nombreCliente: cliente.nombres_apellidos,
              telefono: cliente.telefono || '',
              acompanante: cliente.acompanante || ''
            });
            
            // Mostrar mensaje de éxito
            this.mostrarMensajeClienteEncontrado(cliente.nombres_apellidos);
          } else {
          }
        },
        error: (err) => {
          this.buscandoCliente = false;
        }
      });
    }, 800); // Esperar 800ms después de que el usuario deje de escribir
  }

  private mostrarMensajeClienteEncontrado(nombreCliente: string): void {
    // Crear un mensaje temporal en el DOM
    const mensaje = document.createElement('div');
    mensaje.className = 'cliente-encontrado-mensaje';
    mensaje.innerHTML = `
      <i class="fas fa-check-circle"></i>
      Cliente encontrado: ${nombreCliente}
    `;
    mensaje.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: slideIn 0.3s ease;
    `;
    
    // Agregar animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(mensaje);
    
    // Remover mensaje después de 3 segundos
    setTimeout(() => {
      if (mensaje.parentNode) {
        mensaje.parentNode.removeChild(mensaje);
      }
    }, 3000);
  }

  cargarHabitacion(): void {
    // Primero intentar cargar desde el backend
    this.habitacionesService.getHabitacionPorId(this.idHabitacion).subscribe({
      next: (habitacion) => {
        this.habitacion = {
          id: habitacion.id_habitacion,
          numero: habitacion.numero,
          tipo: habitacion.tipo_habitacion,
          precio: habitacion.precio,
          estado: habitacion.estado.toLowerCase() as 'disponible' | 'ocupada' | 'reservada',
          descripcion: habitacion.descripcion,
          capacidad: this.getCapacidadPorTipo(habitacion.tipo_habitacion),
          piso: Math.floor(habitacion.id_habitacion / 100) || 1
        };
      },
      error: (err) => {
        // Usar datos simulados si el backend no está disponible
        this.cargarHabitacionSimulada();
      }
    });
  }

  private cargarHabitacionSimulada(): void {
    const habitacionesSimuladas = [
      {
        id: 101,
        numero: '101',
        tipo: 'Individual',
        precio: 50,
        estado: 'disponible' as const,
        descripcion: 'Habitación individual con vista a la calle',
        capacidad: 1,
        piso: 1
      },
      {
        id: 102,
        numero: '102',
        tipo: 'Doble',
        precio: 80,
        estado: 'disponible' as const,
        descripcion: 'Habitación doble con cama matrimonial',
        capacidad: 2,
        piso: 1
      },
      {
        id: 103,
        numero: '103',
        tipo: 'Matrimonial',
        precio: 120,
        estado: 'ocupada' as const,
        descripcion: 'Habitación matrimonial con balcón',
        capacidad: 2,
        piso: 1
      },
      {
        id: 201,
        numero: '201',
        tipo: 'Doble',
        precio: 90,
        estado: 'disponible' as const,
        descripcion: 'Habitación doble en segundo piso',
        capacidad: 2,
        piso: 2
      },
      {
        id: 202,
        numero: '202',
        tipo: 'Individual',
        precio: 55,
        estado: 'disponible' as const,
        descripcion: 'Habitación individual tranquila',
        capacidad: 1,
        piso: 2
      },
      {
        id: 301,
        numero: '301',
        tipo: 'Matrimonial',
        precio: 150,
        estado: 'reservada' as const,
        descripcion: 'Suite presidencial con jacuzzi',
        capacidad: 2,
        piso: 3
      }
    ];

    const habitacionEncontrada = habitacionesSimuladas.find(h => h.id === this.idHabitacion);
    
    if (habitacionEncontrada) {
      this.habitacion = habitacionEncontrada;
    } else {
      this.mensajeFlotanteService.mostrarError(
        'Habitación no encontrada',
        'Error'
      );
      this.router.navigate(['/habitaciones']);
    }
  }

  calcularTotalConDescuento(): number {
    if (!this.habitacion) return 0;
    
    const precio = this.habitacion.precio;
    const tiempo = this.reservaForm.get('tiempo')?.value || 1;
    const tipoRegistro = this.reservaForm.get('tipoRegistro')?.value;
    const descuento = this.reservaForm.get('descuento')?.value || 0;
    
    // Calcular subtotal según el tipo de registro
    let subtotal: number;
    if (tipoRegistro === 'reserva') {
      subtotal = precio * tiempo; // Precio × días (24h cada día)
    } else {
      // Para hospedar: precio por hora, pero tiempo está en minutos
      const precioPorMinuto = precio / 60; // Convertir precio por hora a precio por minuto
      subtotal = precioPorMinuto * tiempo; // Precio por minuto × minutos
    }
    
    // Aplicar descuento
    const descuentoDecimal = descuento / 100;
    return subtotal * (1 - descuentoDecimal);
  }

  getSubtotal(): number {
    if (!this.habitacion) return 0;
    
    const precio = this.habitacion.precio;
    const tiempo = this.reservaForm.get('tiempo')?.value || 1;
    const tipoRegistro = this.reservaForm.get('tipoRegistro')?.value;
    
    if (tipoRegistro === 'reserva') {
      return precio * tiempo; // Precio × días (24h cada día)
    } else {
      // Para hospedar: precio por hora, pero tiempo está en minutos
      const precioPorMinuto = precio / 60; // Convertir precio por hora a precio por minuto
      return precioPorMinuto * tiempo; // Precio por minuto × minutos
    }
  }

  getDescuentoPorcentaje(): number {
    return this.reservaForm.get('descuento')?.value || 0;
  }

  getMontoDescuento(): number {
    if (!this.habitacion) return 0;
    
    const subtotal = this.getSubtotal();
    const descuento = this.reservaForm.get('descuento')?.value || 0;
    const descuentoDecimal = descuento / 100;
    return subtotal * descuentoDecimal;
  }

  // Métodos dinámicos para el campo tiempo
  getTiempoLabel(): string {
    const tipoRegistro = this.reservaForm.get('tipoRegistro')?.value;
    return tipoRegistro === 'reserva' ? 'Número de Días:' : 'Tiempo (minutos):';
  }

  getTiempoPlaceholder(): string {
    const tipoRegistro = this.reservaForm.get('tipoRegistro')?.value;
    return tipoRegistro === 'reserva' ? '1' : '30';
  }

  getTiempoStep(): number {
    const tipoRegistro = this.reservaForm.get('tipoRegistro')?.value;
    return tipoRegistro === 'reserva' ? 1 : 30;
  }

  getTiempoMin(): number {
    const tipoRegistro = this.reservaForm.get('tipoRegistro')?.value;
    return tipoRegistro === 'reserva' ? 1 : 30;
  }

  getTiempoAyuda(): string {
    const tipoRegistro = this.reservaForm.get('tipoRegistro')?.value;
    return tipoRegistro === 'reserva' 
      ? 'Ej: 2 para 2 días (48 horas)' 
      : 'Ej: 60 para 1 hora / 120 para 2 horas';
  }

  // Actualizar el tiempo cuando cambia el tipo de registro
  onTipoRegistroChange(): void {
    const tipoRegistro = this.reservaForm.get('tipoRegistro')?.value;
    const tiempoControl = this.reservaForm.get('tiempo');
    
    if (tipoRegistro === 'reserva') {
      tiempoControl?.setValue(1); // 1 día por defecto para reservas
    } else {
      tiempoControl?.setValue(30); // 30 minutos por defecto para hospedar
    }
  }

  
  guardarReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    // Primero buscar o crear el cliente
    const documento = this.reservaForm.get('identificacion')?.value;
    const nombreCliente = this.reservaForm.get('nombreCliente')?.value;
    
    this.clientesService.buscarClientePorDocumento(documento).subscribe({
      next: (clientes) => {
        let cliente: Cliente;
        
        if (clientes.length > 0) {
          // Cliente existe
          cliente = clientes[0];
          this.crearReservaConCliente(cliente.id_cliente);
        } else {
          // Crear nuevo cliente
          const nuevoCliente: CrearClienteRequest = {
            tipo_documento: 'DNI',
            nro_documento: documento,
            nombres_apellidos: nombreCliente,
            telefono: this.reservaForm.get('telefono')?.value || ''
          };
          
          this.clientesService.crearCliente(nuevoCliente).subscribe({
            next: (clienteCreado) => {
              this.crearReservaConCliente(clienteCreado.id_cliente);
            },
            error: (err) => {
              this.mensajeFlotanteService.mostrarError(
                'Error al crear el cliente',
                'Error'
              );
            }
          });
        }
      },
      error: (err) => {
        this.mensajeFlotanteService.mostrarError(
          'Error al buscar cliente',
          'Error'
        );
      }
    });
  }

  private crearReservaConCliente(idCliente: number): void {
    const reservaData: CrearReservaRequest = {
      id_habitacion: this.idHabitacion,
      id_cliente: idCliente,
      fecha: this.reservaForm.get('fecha')?.value,
      hora_entrada: this.reservaForm.get('horaEntrada')?.value,
      hora_salida: this.reservaForm.get('horaSalida')?.value,
      tiempo: this.reservaForm.get('tiempo')?.value.toString(),
      descuento: this.reservaForm.get('descuento')?.value || 0,
      total: this.calcularTotalConDescuento(),
      total_descuento: this.getMontoDescuento(),
      estado: 'Pendiente'
    };

    this.reservasService.crearReserva(reservaData).subscribe({
      next: (reservaCreada) => {
        // Actualizar estado de la habitación a Ocupado
        this.habitacionesService.actualizarEstado(this.idHabitacion, 'Ocupado').subscribe({
          next: () => {
            this.mensajeFlotanteService.mostrarInfo(
              '¡Reserva registrada exitosamente!',
              'Reserva Exitosa'
            );
            this.router.navigate(['/habitaciones']);
          },
          error: (err) => {
              this.mensajeFlotanteService.mostrarAdvertencia(
              'Reserva creada pero hubo un error al actualizar el estado de la habitación',
              'Advertencia'
            );
          }
        });
      },
      error: (err) => {
        this.mensajeFlotanteService.mostrarError(
          'Error al crear la reserva',
          'Error'
        );
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

  volver(): void {
    this.router.navigate(['/habitaciones']);
  }
}
