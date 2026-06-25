import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LocalStorageService } from '../../shared/services/local-storage.service';

export interface Cliente {
  id_cliente: number;
  tipo_documento: 'DNI' | 'CE' | 'PASAPORTE';
  nro_documento: string;
  nombres_apellidos: string;
  telefono: string;
  acompanante: string;
  nacionalidad: string;
  procedencia: string;
  placa: string;
  tipoVehiculo: string;
  estado: 'Activo' | 'Inactivo';
}

export interface CrearClienteRequest {
  tipo_documento: 'DNI' | 'CE' | 'PASAPORTE';
  nro_documento: string;
  nombres_apellidos: string;
  telefono: string;
  acompanante?: string;
  nacionalidad?: string;
  procedencia?: string;
  placa?: string;
  tipoVehiculo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  
  constructor(private localStorageService: LocalStorageService) { }

  getClientes(): Observable<Cliente[]> {
    const clientes = this.localStorageService.getClientes();
    return of(clientes).pipe(delay(300)); // Simular delay de red
  }

  getClientePorId(id: number): Observable<Cliente> {
    const clientes = this.localStorageService.getClientes();
    const cliente = clientes.find(c => c.id_cliente === id);
    
    if (!cliente) {
      return throwError(() => new Error('Cliente no encontrado'));
    }
    
    return of(cliente).pipe(delay(200));
  }

  crearCliente(cliente: CrearClienteRequest): Observable<Cliente> {
    try {
      const nuevoCliente = this.localStorageService.guardarCliente(cliente);
      return of(nuevoCliente).pipe(delay(500));
    } catch (error) {
      return throwError(() => error);
    }
  }

  actualizarCliente(id: number, cliente: Partial<CrearClienteRequest>): Observable<Cliente> {
    try {
      const clienteActualizado = this.localStorageService.actualizarCliente(id, cliente);
      return of(clienteActualizado).pipe(delay(400));
    } catch (error) {
      return throwError(() => error);
    }
  }

  eliminarCliente(id: number): Observable<void> {
    try {
      this.localStorageService.eliminarCliente(id);
      return of(void 0).pipe(delay(300));
    } catch (error) {
      return throwError(() => error);
    }
  }

  buscarClientePorDocumento(documento: string): Observable<Cliente[]> {
    const clientes = this.localStorageService.buscarClientePorDocumento(documento);
    return of(clientes).pipe(delay(200));
  }

  actualizarEstado(id: number, estado: 'Activo' | 'Inactivo'): Observable<Cliente> {
    try {
      const clienteActualizado = this.localStorageService.actualizarCliente(id, { estado });
      return of(clienteActualizado).pipe(delay(300));
    } catch (error) {
      return throwError(() => error);
    }
  }
}
