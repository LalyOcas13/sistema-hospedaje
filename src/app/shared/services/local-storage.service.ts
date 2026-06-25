import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  
  // Claves para localStorage
  private readonly KEYS = {
    CLIENTES: 'hoteleria_clientes',
    HABITACIONES: 'hoteleria_habitaciones',
    RESERVAS: 'hoteleria_reservas',
    USUARIOS: 'hoteleria_usuarios'
  };

  constructor() {
    this.inicializarDatos();
  }

  // Inicializar datos si no existen
  private inicializarDatos(): void {
    if (!this.getItem(this.KEYS.CLIENTES)) {
      this.setItem(this.KEYS.CLIENTES, this.getClientesIniciales());
    }
    
    if (!this.getItem(this.KEYS.HABITACIONES)) {
      this.setItem(this.KEYS.HABITACIONES, this.getHabitacionesIniciales());
    }
    
    if (!this.getItem(this.KEYS.RESERVAS)) {
      this.setItem(this.KEYS.RESERVAS, []);
    }
  }

  // ==================== MÉTODOS GENÉRICOS ====================

  getItem(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error al obtener item ${key}:`, error);
      return null;
    }
  }

  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error al guardar item ${key}:`, error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error al eliminar item ${key}:`, error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
  }

  // ==================== CLIENTES ====================

  getClientes(): any[] {
    return this.getItem(this.KEYS.CLIENTES) || [];
  }

  guardarCliente(cliente: any): any {
    const clientes = this.getClientes();
    
    // Verificar si ya existe el DNI
    const existeDNI = clientes.find(c => c.nro_documento === cliente.nro_documento);
    if (existeDNI) {
      throw new Error('Ya existe un cliente con ese DNI');
    }
    
    // Generar ID
    const nuevoCliente = {
      id_cliente: this.generarId('cliente'),
      ...cliente,
      estado: cliente.estado || 'Activo',
      fecha_creacion: new Date().toISOString()
    };
    
    clientes.push(nuevoCliente);
    this.setItem(this.KEYS.CLIENTES, clientes);
    
    console.log('✅ Cliente guardado en localStorage:', nuevoCliente.nombres_apellidos);
    return nuevoCliente;
  }

  actualizarCliente(id: number, datos: any): any {
    const clientes = this.getClientes();
    const index = clientes.findIndex(c => c.id_cliente === id);
    
    if (index === -1) {
      throw new Error('Cliente no encontrado');
    }
    
    clientes[index] = { ...clientes[index], ...datos };
    this.setItem(this.KEYS.CLIENTES, clientes);
    
    return clientes[index];
  }

  eliminarCliente(id: number): void {
    const clientes = this.getClientes();
    const index = clientes.findIndex(c => c.id_cliente === id);
    
    if (index === -1) {
      throw new Error('Cliente no encontrado');
    }
    
    clientes.splice(index, 1);
    this.setItem(this.KEYS.CLIENTES, clientes);
  }

  buscarClientePorDocumento(documento: string): any[] {
    const clientes = this.getClientes();
    return clientes.filter(c => c.nro_documento.includes(documento));
  }

  // ==================== HABITACIONES ====================

  getHabitaciones(): any[] {
    return this.getItem(this.KEYS.HABITACIONES) || [];
  }

  guardarHabitacion(habitacion: any): any {
    const habitaciones = this.getHabitaciones();
    
    // Verificar si ya existe el número
    const existeNumero = habitaciones.find(h => h.numero === habitacion.numero);
    if (existeNumero) {
      throw new Error('Ya existe una habitación con ese número');
    }
    
    const nuevaHabitacion = {
      id_habitacion: this.generarId('habitacion'),
      ...habitacion,
      estado: habitacion.estado || 'Disponible'
    };
    
    habitaciones.push(nuevaHabitacion);
    this.setItem(this.KEYS.HABITACIONES, habitaciones);
    
    console.log('✅ Habitación guardada en localStorage:', nuevaHabitacion.numero);
    return nuevaHabitacion;
  }

  actualizarHabitacion(id: number, datos: any): any {
    const habitaciones = this.getHabitaciones();
    const index = habitaciones.findIndex(h => h.id_habitacion === id);
    
    if (index === -1) {
      throw new Error('Habitación no encontrada');
    }
    
    habitaciones[index] = { ...habitaciones[index], ...datos };
    this.setItem(this.KEYS.HABITACIONES, habitaciones);
    
    return habitaciones[index];
  }

  eliminarHabitacion(id: number): void {
    const habitaciones = this.getHabitaciones();
    const index = habitaciones.findIndex(h => h.id_habitacion === id);
    
    if (index === -1) {
      throw new Error('Habitación no encontrada');
    }
    
    habitaciones.splice(index, 1);
    this.setItem(this.KEYS.HABITACIONES, habitaciones);
  }

  getHabitacionesDisponibles(): any[] {
    const habitaciones = this.getHabitaciones();
    return habitaciones.filter(h => h.estado === 'Disponible');
  }

  actualizarEstadoHabitacion(id: number, estado: string): any {
    return this.actualizarHabitacion(id, { estado });
  }

  // ==================== RESERVAS ====================

  getReservas(): any[] {
    let reservas = this.getItem(this.KEYS.RESERVAS);
    
    // Si no hay reservas, cargar datos iniciales
    if (!reservas || reservas.length === 0) {
      reservas = this.getReservasIniciales();
      this.setItem(this.KEYS.RESERVAS, reservas);
      console.log('📋 Cargando reservas iniciales:', reservas.length);
    }
    
    return reservas;
  }

  guardarReserva(reserva: any): any {
    const reservas = this.getReservas();
    const habitaciones = this.getHabitaciones();
    
    // Verificar que la habitación esté disponible
    const habitacion = habitaciones.find(h => h.id_habitacion === reserva.id_habitacion);
    if (!habitacion || habitacion.estado !== 'Disponible') {
      throw new Error('Habitación no disponible');
    }
    
    const nuevaReserva = {
      id_reserva: this.generarId('reserva'),
      ...reserva,
      estado: reserva.estado || 'Pendiente',
      fecha_creacion: new Date().toISOString()
    };
    
    reservas.push(nuevaReserva);
    this.setItem(this.KEYS.RESERVAS, reservas);
    
    // Actualizar estado de la habitación
    this.actualizarEstadoHabitacion(reserva.id_habitacion, 'Ocupado');
    
    console.log('✅ Reserva guardada en localStorage:', nuevaReserva.id_reserva);
    return nuevaReserva;
  }

  getReservasPorCliente(idCliente: number): any[] {
    const reservas = this.getReservas();
    return reservas.filter(r => r.id_cliente === idCliente);
  }

  getReservasPorHabitacion(idHabitacion: number): any[] {
    const reservas = this.getReservas();
    return reservas.filter(r => r.id_habitacion === idHabitacion);
  }

  // ==================== UTILIDADES ====================

  private generarId(tipo: string): number {
    const ids: { [key: string]: number } = {
      cliente: 1000,
      habitacion: 100,
      reserva: 5000
    };
    
    const base = ids[tipo] || 1;
    const timestamp = Date.now();
    return base + (timestamp % 9000);
  }

  // ==================== DATOS INICIALES ====================

  private getClientesIniciales(): any[] {
    return [
      {
        id_cliente: 1,
        tipo_documento: 'DNI',
        nro_documento: '12345678',
        nombres_apellidos: 'Laly Melissa Ocas Vasquez',
        telefono: '987654321',
        acompanante: '',
        nacionalidad: 'Peruana',
        procedencia: 'Lima',
        placa: '',
        tipoVehiculo: '',
        estado: 'Activo',
        fecha_creacion: new Date().toISOString()
      },
      {
        id_cliente: 2,
        tipo_documento: 'DNI',
        nro_documento: '87654321',
        nombres_apellidos: 'Ruth Vasquez',
        telefono: '987654322',
        acompanante: '',
        nacionalidad: 'Peruana',
        procedencia: 'Arequipa',
        placa: '',
        tipoVehiculo: '',
        estado: 'Activo',
        fecha_creacion: new Date().toISOString()
      }
    ];
  }

  private getHabitacionesIniciales(): any[] {
    return [
      {
        id_habitacion: 101,
        numero: '101',
        tipo_habitacion: 'Individual',
        precio: 50,
        estado: 'Disponible',
        descripcion: 'Habitación individual con vista a la calle'
      },
      {
        id_habitacion: 102,
        numero: '102',
        tipo_habitacion: 'Doble',
        precio: 80,
        estado: 'Disponible',
        descripcion: 'Habitación doble con cama matrimonial'
      },
      {
        id_habitacion: 103,
        numero: '103',
        tipo_habitacion: 'Matrimonial',
        precio: 120,
        estado: 'Ocupado',
        descripcion: 'Habitación matrimonional con balcón'
      },
      {
        id_habitacion: 201,
        numero: '201',
        tipo_habitacion: 'Doble',
        precio: 90,
        estado: 'Disponible',
        descripcion: 'Habitación doble en segundo piso'
      },
      {
        id_habitacion: 202,
        numero: '202',
        tipo_habitacion: 'Individual',
        precio: 55,
        estado: 'Disponible',
        descripcion: 'Habitación individual tranquila'
      },
      {
        id_habitacion: 301,
        numero: '301',
        tipo_habitacion: 'Matrimonial',
        precio: 150,
        estado: 'Reservada',
        descripcion: 'Suite presidencial con jacuzzi'
      }
    ];
  }

  private getReservasIniciales(): any[] {
    return [
      {
        id_reserva: 1,
        id_habitacion: 103,
        id_cliente: 1,
        fecha: new Date().toISOString().split('T')[0],
        hora_entrada: '14:00',
        hora_salida: '16:00',
        tiempo: '120',
        descuento: 10,
        total: 216,
        total_descuento: 24,
        estado: 'Pagado'
      },
      {
        id_reserva: 2,
        id_habitacion: 301,
        id_cliente: 2,
        fecha: new Date().toISOString().split('T')[0],
        hora_entrada: '10:00',
        hora_salida: '12:00',
        tiempo: '120',
        descuento: 0,
        total: 300,
        total_descuento: 0,
        estado: 'Pendiente'
      }
    ];
  }

  // ==================== MÉTODOS DE DEBUG ====================

  verDatos(): void {
    console.log('📋 Datos en localStorage:');
    console.log('Clientes:', this.getClientes().length);
    console.log('Habitaciones:', this.getHabitaciones().length);
    console.log('Reservas:', this.getReservas().length);
  }

  limpiarDatos(): void {
    this.removeItem(this.KEYS.CLIENTES);
    this.removeItem(this.KEYS.HABITACIONES);
    this.removeItem(this.KEYS.RESERVAS);
    this.inicializarDatos();
    console.log('🗑️ Datos limpiados y reinicializados');
  }
}
