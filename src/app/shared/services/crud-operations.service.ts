import { Injectable } from '@angular/core';
import { MensajeFlotanteService } from '../mensaje-flotante/mensaje-flotante.service';

export interface CrudOperation {
  id: number;
  nombre: string;
  tipo: 'habitacion' | 'cliente' | 'producto' | 'reserva' | 'venta';
}

export interface CrudResult {
  exito: boolean;
  mensaje: string;
  datos?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CrudOperationsService {

  constructor(private mensajeFlotanteService: MensajeFlotanteService) {}

  // ==================== HABITACIONES ====================
  async editarHabitacion(habitacion: any): Promise<CrudResult> {
    try {
      // Validaciones específicas para habitaciones
      if (!habitacion.numero || !habitacion.tipo) {
        return {
          exito: false,
          mensaje: 'El número y tipo de habitación son obligatorios'
        };
      }

      // Obtener habitaciones del localStorage
      const habitaciones = JSON.parse(localStorage.getItem('habitaciones') || '[]');
      const index = habitaciones.findIndex((h: any) => h.id_habitacion === habitacion.id_habitacion);
      
      if (index > -1) {
        habitaciones[index] = { ...habitaciones[index], ...habitacion };
        localStorage.setItem('habitaciones', JSON.stringify(habitaciones));
        
        return {
          exito: true,
          mensaje: `Habitación ${habitacion.numero} actualizada correctamente`,
          datos: habitaciones[index]
        };
      }
      
      return { exito: false, mensaje: 'Habitación no encontrada' };
    } catch (error) {
      return { exito: false, mensaje: 'Error al actualizar habitación' };
    }
  }

  async eliminarHabitacion(id: number, numero: string): Promise<CrudResult> {
    try {
      const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
        `¿Estás seguro de que deseas eliminar la habitación "${numero}"?`,
        'Eliminar Habitación'
      );
      
      if (!confirmado) {
        return { exito: false, mensaje: 'Operación cancelada' };
      }

      const habitaciones = JSON.parse(localStorage.getItem('habitaciones') || '[]');
      const habitacionesFiltradas = habitaciones.filter((h: any) => h.id_habitacion !== id);
      localStorage.setItem('habitaciones', JSON.stringify(habitacionesFiltradas));
      
      return {
        exito: true,
        mensaje: `Habitación ${numero} eliminada correctamente`
      };
    } catch (error) {
      return { exito: false, mensaje: 'Error al eliminar habitación' };
    }
  }

  async actualizarEstadoHabitacion(id: number, nuevoEstado: string): Promise<CrudResult> {
    try {
      const habitaciones = JSON.parse(localStorage.getItem('habitaciones') || '[]');
      const index = habitaciones.findIndex((h: any) => h.id_habitacion === id);
      
      if (index > -1) {
        habitaciones[index].estado = nuevoEstado;
        localStorage.setItem('habitaciones', JSON.stringify(habitaciones));
        
        return {
          exito: true,
          mensaje: `Estado de habitación actualizado a ${nuevoEstado}`,
          datos: habitaciones[index]
        };
      }
      
      return { exito: false, mensaje: 'Habitación no encontrada' };
    } catch (error) {
      return { exito: false, mensaje: 'Error al actualizar estado' };
    }
  }

  // ==================== CLIENTES ====================
  async editarCliente(cliente: any): Promise<CrudResult> {
    try {
      if (!cliente.nro_documento || !cliente.nombres_apellidos) {
        return {
          exito: false,
          mensaje: 'El documento y nombres son obligatorios'
        };
      }

      const clientes = JSON.parse(localStorage.getItem('hoteleria_clientes') || '[]');
      const index = clientes.findIndex((c: any) => c.id_cliente === cliente.id_cliente);
      
      if (index > -1) {
        clientes[index] = { ...clientes[index], ...cliente };
        localStorage.setItem('hoteleria_clientes', JSON.stringify(clientes));
        
        return {
          exito: true,
          mensaje: `Cliente ${cliente.nombres_apellidos} actualizado correctamente`,
          datos: clientes[index]
        };
      }
      
      return { exito: false, mensaje: 'Cliente no encontrado' };
    } catch (error) {
      return { exito: false, mensaje: 'Error al actualizar cliente' };
    }
  }

  async eliminarCliente(id: number, nombres: string): Promise<CrudResult> {
    try {
      const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
        `¿Estás seguro de que deseas eliminar al cliente "${nombres}"?`,
        'Eliminar Cliente'
      );
      
      if (!confirmado) {
        return { exito: false, mensaje: 'Operación cancelada' };
      }

      const clientes = JSON.parse(localStorage.getItem('hoteleria_clientes') || '[]');
      const clientesFiltrados = clientes.filter((c: any) => c.id_cliente !== id);
      localStorage.setItem('hoteleria_clientes', JSON.stringify(clientesFiltrados));
      
      return {
        exito: true,
        mensaje: `Cliente ${nombres} eliminado correctamente`
      };
    } catch (error) {
      return { exito: false, mensaje: 'Error al eliminar cliente' };
    }
  }

  // ==================== PRODUCTOS ====================
  async editarProducto(producto: any): Promise<CrudResult> {
    try {
      if (!producto.nombre || !producto.precio) {
        return {
          exito: false,
          mensaje: 'El nombre y precio del producto son obligatorios'
        };
      }

      const productos = JSON.parse(localStorage.getItem('hoteleria_productos') || '[]');
      const index = productos.findIndex((p: any) => p.id === producto.id);
      
      if (index > -1) {
        productos[index] = { ...productos[index], ...producto };
        localStorage.setItem('hoteleria_productos', JSON.stringify(productos));
        
        return {
          exito: true,
          mensaje: `Producto ${producto.nombre} actualizado correctamente`,
          datos: productos[index]
        };
      }
      
      return { exito: false, mensaje: 'Producto no encontrado' };
    } catch (error) {
      return { exito: false, mensaje: 'Error al actualizar producto' };
    }
  }

  async eliminarProducto(id: number, nombre: string): Promise<CrudResult> {
    try {
      const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
        `¿Estás seguro de que deseas eliminar el producto "${nombre}"?`,
        'Eliminar Producto'
      );
      
      if (!confirmado) {
        return { exito: false, mensaje: 'Operación cancelada' };
      }

      const productos = JSON.parse(localStorage.getItem('hoteleria_productos') || '[]');
      const productosFiltrados = productos.filter((p: any) => p.id !== id);
      localStorage.setItem('hoteleria_productos', JSON.stringify(productosFiltrados));
      
      return {
        exito: true,
        mensaje: `Producto ${nombre} eliminado correctamente`
      };
    } catch (error) {
      return { exito: false, mensaje: 'Error al eliminar producto' };
    }
  }

  // ==================== VENTAS ====================
  async editarVenta(venta: any): Promise<CrudResult> {
    try {
      const ventas = JSON.parse(localStorage.getItem('hoteleria_ventas') || '[]');
      const index = ventas.findIndex((v: any) => v.id_venta === venta.id_venta);
      
      if (index > -1) {
        ventas[index] = { ...ventas[index], ...venta };
        localStorage.setItem('hoteleria_ventas', JSON.stringify(ventas));
        
        return {
          exito: true,
          mensaje: `Venta ${venta.id_venta} actualizada correctamente`,
          datos: ventas[index]
        };
      }
      
      return { exito: false, mensaje: 'Venta no encontrada' };
    } catch (error) {
      return { exito: false, mensaje: 'Error al actualizar venta' };
    }
  }

  async eliminarVenta(id: number): Promise<CrudResult> {
    try {
      const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
        `¿Estás seguro de que deseas eliminar la venta ${id}?`,
        'Eliminar Venta'
      );
      
      if (!confirmado) {
        return { exito: false, mensaje: 'Operación cancelada' };
      }

      const ventas = JSON.parse(localStorage.getItem('hoteleria_ventas') || '[]');
      const ventasFiltradas = ventas.filter((v: any) => v.id_venta !== id);
      localStorage.setItem('hoteleria_ventas', JSON.stringify(ventasFiltradas));
      
      return {
        exito: true,
        mensaje: `Venta ${id} eliminada correctamente`
      };
    } catch (error) {
      return { exito: false, mensaje: 'Error al eliminar venta' };
    }
  }

  // ==================== MÉTODOS UTILITARIOS ====================
  async actualizarEstadoGeneral(tipo: string, id: number, nuevoEstado: string): Promise<CrudResult> {
    switch (tipo) {
      case 'habitacion':
        return this.actualizarEstadoHabitacion(id, nuevoEstado);
      case 'cliente':
        return this.editarCliente({ id_cliente: id, estado: nuevoEstado });
      case 'producto':
        return this.editarProducto({ id, estado: nuevoEstado });
      default:
        return { exito: false, mensaje: 'Tipo de entidad no válido' };
    }
  }

  obtenerDatosLocalStorage(clave: string): any[] {
    try {
      return JSON.parse(localStorage.getItem(clave) || '[]');
    } catch (error) {
      return [];
    }
  }

  guardarDatosLocalStorage(clave: string, datos: any[]): void {
    localStorage.setItem(clave, JSON.stringify(datos));
  }
}
